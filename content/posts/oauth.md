---
title: OAuth 과정
date: 2026-06-09
category: OAuth
description: OAuth가 어떻게 동작하는지에 대해 공부해보았습니다.
tags: [oauth]
---

# OAuth 2.0

제 3자 앱이 사용자의 자격증명(비밀번호) 없이, 사용자를 대신해 리소스에 접근할 수 있도록 위임하는 프로토콜

![oauth-image](https://www.dropbox.com/scl/fi/dig9qu4qhpg4ib30b8y0d/oauth.png?rlkey=ki1aht66abewkyu8fs8yqylu3&st=k6f3gyys&dl=1 "출처 : https://hudi.blog/oauth-2.0")

**Resouce Owner** : 실제 사용자, 구글 계정의 주인으로 브라우저를 통해 행동

**Client** : 백엔드 서버, 사용자의 구글 정보에 접근하기 위해 OAuth를 요청

**Authorization Server** : 구글, 카카오 등 소셜 플랫폼의 인증 서버, 사용자가 실제 로그인 하는 곳이며 Authorization Code와 Access Token을 발급해줌

**Resource Server** : 실제 데이터를 가지고 있는 API 서버, 구글의 경우 이메일, 프로필 등 유저 정보를 보관하는 Google API 서버

# 프론트 채널 / 백 채널

- **프론트 채널** : 브라우저의 주소창을 통해 정보가 오가는 통신. 사용자가 URL을 직접 볼 수 있고, 중간에 가로챌 가능성이 이써 민감하지 않거나 일회성 값만 전달
- **백 채널** : 서버와 서버가 직접 HTTP 통신하는 방식. 브라우저를 완전히 우회하기 때문에 사용자는 물론, 중간 공격자도 내용을 볼 수 없음. client_secret이나 access_token 같은 민감한 값은 이 경로로 전달

# 과정

## 1\. Resource Owner -> Client : 로그인 요청

사용자가 웹사이트에서 "구글로 로그인" 버튼을 클릭한 순간 동작함. 브라우저가 GET auth/google 같은 엔드포인트로 요청을 보냄

<br>

## 2\. Client -> Authorization Server : 로그인 요청

Client가 사용자의 브라우저를 Authorization Server의 로그인 페이지로 리다이렉트 시킴. 이때 URL에 여러 파라미터를 담아 보냄

```text
https://accounts.google.com/o/oauth2/v2/auth
  ?client_id=1234567890.apps.googleusercontent.com
  &redirect_uri=https://yourapp.com/auth/google/callback
  &response_type=code
  &scope=email profile
  &state=xK9mR2pQs7
```

- **client_id** : 구글 Cloud Console에 앱을 등록할 때 발급받는 식별자. 노출되어도 상관 없음
- **redirect_uri** : 인증이 끝난 뒤 사용자를 다시 돌려보낼 주소. 보안을 위해 구글 Console에 사전 등록된 주소와 정확히 일치해야함
- **response_type=code** : Authorization Code Grant 방식을 사용한다는 의미. 이 값이 있어야 구글이 Access Token 대신 Authorization Code를 먼저 발급함
- **scope** : 어떤 권한을 요청하는지 명시. email은 이메일 주소를, profile은 이름과 프로필 사진을 요청
- **state** : CSRF(Cross-Site Request Forgery) 공격을 막기 위한 랜덤 문자열. Client가 이 값을 생성해서 세션에 저장해두고 URL에도 담아서 보냄. 나중에 콜백이 왔을 때 세션의 값과 비교하여 정상적인 요청인지 검증

<br>

## 3\. Authorization Server -> Resource Owner : 로그인 페이지 제공

구글이 사용자의 브라우저에 로그인 UI를 보여줌.

<br>

## 4\. Resource Owner -> Authorization Server : ID/PW 제공

사용자가 구글 계쩡의 아이디와 비밀번호를 입력하고 로그인함. 이 정보는 구글에만 전달되며 Client는 확인 불가

<br>

## 5\. Authorization Server -> Resource Owner : Authorization Code 발급

사용자가 로그인을 하였다면, 구글이 Authorization Code를 발급함. Authorization Code는 일회성이며 발급 후 5~10분 이내 만료됨.

이 코드 만으로 사용자 데이터에 접근할 수 없으면 Access Token으로 교환해야 데이터에 접근 가능.

<br>

## 6\. Authorization Server -> Client : Redirect URI로 리다이렉트

구글이 사용자의 브라우저를 2단계에서 보낸 redirect_uri로 리다이렉트 시킴. 이때 URL 파라미터에 Authorization Code와 state를 담아서 보냄

```text
https://yourapp.com/auth/google/callback
  ?code=4/0AX4XfWjK9mZpQ...
  &state=xK9mR2pQs7
```

브라우저는 이 URL을 그대로 백엔드 서버(NestJS)로 요청함. Passport의 AuthGuard('google')이 콜백 요청을 가로채서 자동으로 다음 단계를 처리함.

이 시점에서 서버는 state 값이 2단계에서 세션에 저장해둔 값과 일치하는 확인하거, code 파라미터가 실제 존재하는지, error 파아미터가 들어오진 않았는지 확인함.

<br>

## 7\. Client -> Authorization Server : Authorization Code + Client ID + Client Secret으로 Access Token 요청

여기서 부터 백체널. 브라우저는 더 이상 관여하지 않음.

Client(NestJS)가 구글 토큰 엔드포인트에 직접 HTTP POST 요청을 보냄.

```
POST https://oauth2.googleapis.com/token
Content-Type: application/x-www-form-urlencoded

code=4/0AX4XfWjK9mZpQ...
client_id=1234567890.apps.googleusercontent.com
client_secret=GOCSPX-AbCdEfGhIjKl...
redirect_uri=https://yourapp.com/auth/google/callback
grant_type=authorization_code
```

- **client_secret** : 구글 Conole에서 앱을 등록할때 발급받은 비밀 키로 절대 외부에 노출해서는 안됨. 환경 변수에만 저장하고 프론트나 URL에 포함하면 안됨.

구글은 이 요청을 받아 세가지 검증을 함

1.  code가 실제로 자신이 발급한 유효한 코드인지.
2.  client_id와 client_secret의 조합이 맞는지
3.  redirect_uri가 등록된 주소와 일치하는지

세 검증 통과하면 Access Token을 발급해줌

<br>

## 8\. Authorization Server -> Client : Access Token 발급

구글이 검증에 성공하면 Access Token과 Refresh Token을 발급함

```json
{
  "access_token": "ya29.A0ARrdaM...",
  "expires_in": 3599,
  "refresh_token": "1//0gLdXeB...",
  "scope": "email profile",
  "token_type": "Bearer"
}
```

access_token은 실제로 Resource Server API를 호출할떄 사용하는 토큰. expires_in은 초 단위로 보통 3600초(1시간).

refresh_token은 access_token이 만료된 뒤 사용자 재로그인 없이 새 access_token을 발급받을 떄 사용. 한번 만 발급되므로 DB에 안전하게 보관해야함.

<br>

## 9\. 로그인 성공 처리

Client 서버가 Access Token을 받은 뒤 내부 처리를 함.

먼저 Access Token과 Refresh Token을 DB에 저장(나중에 사용자 대신 구글 API를 호출할때 꺼내 쓰기 위함)

다음으로, 이 Access Token으로 구글의 사용자 정보 API를 한번 더 호출해서 유저 프로필(이메일, 이름 등)을 가져온 뒤, 자체 DB에서 해당 유저를 조회하거나 새로 생성함(소셜 계정 최초 가입 처리)

유저 정보로 자체 JWT를 발급해 클라이언트에게 전달.

<br>

## 10\. Resouce Owner -> Client : 서비스 요청

로그인이 완료된 사용자가 앱의 기능을 사용.

클라이언트는 9단계에서 받은 자체 JWT를 헤더에 담아 요청. 백엔드 서버에서 이를 검증.

<br>

## 11\. Client -> Resource Server : Access Token으로 API 호출

Client 서버(NestJS)가 DB에 저장해둔 Access Token을 사용해서 Resource Server(Google API)에 요청함.

```
GET https://www.googleapis.com/oauth2/v2/userinfo
Authorization: Bearer ya29.A0ARrdaM...
```

Access Token이 허용하는 scope 내의 API만 호출 가능. 2단계에서 scope=email profile만 요청했다면, 구글 드라이브 API 같은 다른 서비스는 이 토큰으로 접근할 수 없음.

<br>

## 12\. Resource Server -> Client : Access Token 검증 및 리소스 제공

Resource Server가 Access Token을 검증함.

이 토큰이 유효한지, 요청한 API에 접근할 scope 권한이 있는지 확인.

모두 검증되면 데이터를 JSON으로 반환.

토큰이 만료되었다면 401 Unauthorized를 반환. 이 때 Client는 DB에 저장해둔 Refresh Token으로 Access Token을 재발급 받고, 다시 API를 요청.

<br>

## 13\. Client -> Resource Owner : 리소스 제공

Client가 구글로부터 받은 데이터를 가공하여 사용자에게 최종 응답을 반환.
