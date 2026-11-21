---
title: 미니 PC 서버로 정적 페이지 배포
date: 2026-11-21
category: Server
description: 미니 PC 서버에 포트포워딩 없이 정적 페이지를 배포하는 방법에 대해 공부해보았습니다.
tags: [server, pc]
# draft: true
---

# 외부 인터넷에서 미니 PC로 접속되지 않은 이유
KT 공유기는 공인 IP 하나이고, 공유기에 연결된 기기들은 모두 사설 IP를 나눠쓴다.

그래서 내부 -> 외부로 요청을 하면 공유기가 요청을 보낸 기기의 사설 IP를 기록해두고 응답이 오면 기록했던 사설 IP를 확인하고 전달한다.

외부 -> 내부 요청은 어떤 사설 IP로 보냈는지 기록이 없어 전달해야 할 목적지를 몰라 공유기가 해당 요청을 버린다.

그래서 포트포워딩을 한다. 포트포워딩은 외부에서 오는 요청을 내부에서 받을 사설 IP를 지정해서 외부의 요청을 받는 방식이다.

하지만 포트포워딩은 포트를 열어야해 공격 받을 수 있는 확률이 높아진다. 그리고 공유기 재부팅이나 정전 시 공인 IP가 바뀔 수 있어 도메인 연결을 그때 그때 다시 해줘야한다.

그래서 간단한 Cloudflare Tunnel을 사용하려한다.

<br> 

# Cloudflare Tunnel
Couldflare Tunnel은 포트포워딩과 반대로 미니 PC에서 먼저 Cloudflare로 나가는 연결을 맺어두고, 외부의 요청이 이 연결을 타고 들어오는 구조로, 공유기는 내부의 기기가 외부로 접속한 것이라고 인지한다.

<br>

# 장점
장점으로는 외부에서 오는 요청을 열어두는 것이 아니기 떄문에 공격을 받을 확률이 적다.

집의 공인 IP가 노출되지 않고, 재부팅이나 정전으로 공인 IP가 바뀌어도 미니 PC 서버가 Cloudflare로 연결하는 방식이기에 신경쓸게 없다.

포트포워딩을 사용하면 certbot으로 인증서를 받고, 갱신 자동화를 설정하고 443포트도 따로 열어야하지만, Cludeflare는 이 과정을 자동으로 해준다.

<br>

# 단점
단점으로는 Cloudflare에 의존하기 때문에 Cloudflare에 장애가 발생하면 내 서비스도 같이 장애가 발생한다.

무료 플랜을 사용한다면 대용량 서비스도 불가능하다.

그리고 포트포워딩, DDNS, 인증서를 집접 다루지 않아 네트워크에 대한 공부도 되지 않는다.

하지만 매우 간편하기에 Cloudflare를 사용해보려 한다.

# 전체 흐름
서버가 켜지면 cloudflared가 Cloudflare 데이터센터로 연결을 걸어 유지한다. 서버가 건 연결이기에 공유기가 막지 않는다.

Cloudflare에 도메인을 연결하고 해당 도메인으로 접속을 하면 Cloudflare가 연결된 주소로 요청을 보낸다.

cloudflared가 Nginx로 넘기고 Nginx가 해당 포트의 파일을 읽어서 응답한다.

![flow](https://www.dropbox.com/scl/fi/nsynw4rju35i7nv9b39np/mini-pc-flow.drawio.png?rlkey=w3nh049geznm5ycldgl1qvdkg&st=ymrbiqgb&dl=1)

<br>

# 보안 설정

서버가 외부와 연결되면 공격을 받을 위험이 있다. Cloudflare Tunnel을 사용하면 SSH로 직접 들어올 수는 없지만,배포한 서버의 취약점이나 집 내부의 감연된 기기로부터 공격을 받을 수 있다.

먼저 보안 패치를 자동으로 적용하도록 설정한다.

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

<br>

다음은 비밀번호를 통한 SSH 접속을 할 수 없도록 설정한다.

```bash
sudo vi /etc/ssh/sshd_config.d/00-hardening.conf
```

```nginx title="00-hardening.conf"
# 비밀번호 로그인 금지, 키로만 로그인
PasswordAuthentication no
# root 계정으로는 바로 로그인 금지
PermitRootLogin no
# 키보드 입력 방식의 비밀번호 인증도 금지 (우회 경로 차단)
KbdInteractiveAuthentication no
```

```bash
sudo systemctl restart ssh
```

<br>

방화벽은 SSH 접속은 모두 허용하고, Cloudflare Tunnel로 들어온 요청은 서버 내부에서 Nginx로 전달되어 80번 포트를 외부에서 열 필요가 없기 때문에 80번은 집 안에서 테스트할 때만 쓰도록 허용한다.

```bash
sudo ufw allow OpenSSH # SSH 허용
sudo ufw allow from 172.30.1.0/24 to any port 80 # 80포트는 집 안 네트워크에서만 허용
sudo ufw enable # 방화벽 켜기
sudo ufw status
```

<br>

# Nginx 설치 및 정적 페이지 생성

```bash
sudo apt install -y nginx
```

Nginx를 설치하고 `/var/www` 폴더를 생성한다. 리눅스에서 웹 콘텐츠를 해당 디렉터리 위치에 넣으라고 권장한다.

<br>

```bash
# 배포할 웹 콘텐츠를 넣을 폴더 생성
sudo mkdir -p /var/www/learn-guides
# 폴더 소유자를 내 계정으로 변경해 SFTP로 업로드할 수 있게 설정
sudo chown -R dongyoung:dongyoung /var/www/learn-guides
```

<br>

만든 폴더에 CyberDuck을 통해 SFTP로 HTML 파일들을 업로드 해줬다.

![cyberduck](https://www.dropbox.com/scl/fi/9xeczi4n2h30yu34hzbsx/mini-pc-depoly2.png?rlkey=g8kkiwih6ql1jj9em95h3sxei&st=gj088x9p&dl=1)

<br>

이제 Nginx 설정 파일을 생성한다.

```bash
sudo vi /etc/nginx/sites-available/mysite
```

```nginx
server {
    listen 80 default_server;        # 80번 포트로 들어오는 요청을 받음
    listen [::]:80 default_server;   # IPv6 주소로 오는 요청도 받음
    server_name _;                   # 어떤 도메인 이름으로 와도 받음

    root /var/www/learn-guides;      # 파일을 찾을 폴더
    index index.html;                # 주소가 폴더로 끝나면 보여줄 기본 파일

    location / {
        try_files $uri $uri/ =404;   # 파일 → 폴더 순서로 찾고 없으면 404
    }

    # CSS, JS, 이미지, 폰트는 브라우저가 7일간 저장해두고 재사용
    location ~* \.(css|js|png|jpg|jpeg|gif|svg|ico|woff2?)$ {
        expires 7d;
        add_header Cache-Control "public";
    }
}
```

<br>

Nginx는 설정을 `sites-available`에 두고 켤 것만 `sites-enabled`에 링크로 연결한다. 링크만 지우면 설정 파일을 보관한 채 사이트를 끌 수 있다. 

default 사이트는 내 사이트와 `default_server` 자리를 두고 충돌하니 끝다

```bash
# 기본 사이트의 링크만 삭제 (원본은 available에 남음)
sudo rm /etc/nginx/sites-enabled/default  
# 내 설정을 enabled에 링크(바로가기)로 연결                               
sudo ln -s /etc/nginx/sites-available/mysite /etc/nginx/sites-enabled/   
# 설정 문법 검사, "syntax is ok"가 나와야 함
sudo nginx -t                     
# 연결을 끊지 않고 새 설정 적용                                       
sudo systemctl reload nginx                                              
```

<br>

# 확인

집 공유기로 연결된 Mac으로 접속해 테스트하면 잘 나온다.

![test1](https://www.dropbox.com/scl/fi/r9x3i7ohs9at2lpi096jf/mini-pc-depoly3.png?rlkey=7a413udgw9m0zi7tcfen6e2hy&st=nr2hcj2o&dl=1)

<br>

# Cloudflare Tunnel 적용

먼저 서버에 cloudflared를 설치해줘야한다. cloudflared는 Cloudflare로 터널을 열고 연결을 유지해주는 프로그램이다.

```bash
# github에서 설치 파일 다운로드
curl -L -o cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb 
# 설치 파일로 패키지 설치
sudo dpkg -i cloudflared.deb
# 버전 확인
cloudflared --version
```

<br>

내 Cloudflare 계정에서 내 미니 PC 서버가 도메인을 다룰 수 있도록 권한을 받는다.

```bash
cloudflared tunnel login
```

위 명령어를 입력하면 로그인 URL을 준다. 해당 URL로 접속해서 로그인을 해준다. 

<br>

다음은 터널을 생성하고 도메인을 연결을 해줘야한다.

먼저 도메인은 가비아에서 가장 저렴한 2,000원짜리 도메인을 구매했다.

구매한 도메인을 Cloudflare Domain에 연결하고 가비아에서 네임서버를 Cloudflare에서 제공한 네임서버로 변경했다.

```bash
# # 'homeserver' 터널 생성, 터널 생성 후 UUID와 ~/.cloudflared/[UUID].json 파일이 생성됨
cloudflared tunnel create homeserver
# 도메인 → 터널 연결 DNS 레코드(CNAME) 자동 생성
cloudflared tunnel route dns homeserver learnbook.cloud
```

터널을 생성하면 `[UUID].json` 파일을 반환해준다. 이 `[UUID].json` 파일은 터널의 비밀번호 역할을 하기 때문에 유출되지 않게 보관을 해둬야한다.

<br>

다음으로 터널로 들어온 요청을 어디로 보낼지 설정을 해줘야한다.

```bash
# 서비스용 설정 폴더 생성
sudo mkdir -p /etc/cloudflared             
# 터널 인증 파일 복사                 
sudo cp ~/.cloudflared/[UUID].json /etc/cloudflared/    
# 설정 파일 작성    
sudo vi /etc/cloudflared/config.yml                       
```

```yaml title="config.yml"
tunnel: [UUID]                                    # 사용할 터널
credentials-file: /etc/cloudflared/[UUID].json    # 터널 인증 파일 위치

ingress:                                          # 요청을 어디로 보낼지 정하는 규칙
  - hostname: learnbook.cloud                     # 이 도메인으로 온 요청은
    service: http://localhost:80                  # 같은 컴퓨터의 Nginx로 전달
  - service: http_status:404                      # 어느 규칙에도 안 맞으면 404
```

<br>

잘 되는지 확인을 해본다.

```bash
sudo cloudflared --config /etc/cloudflared/config.yml tunnel run
```

![test](https://www.dropbox.com/scl/fi/wdg60u8un9timpxwzt5b8/mini-pc-deploy4.png?rlkey=8dwuazhh4fo3gj2jzvrnq7778&st=dbtqc1on&dl=1)

<br>

잘 되니 백그라운드에서 실행하도록 설정해준다.

```bash
# systemd 서비스로 등록 + 자동 시작 설정
sudo cloudflared service install     
# 서비스 상태 확인, active (running)이면 정상                              
sudo systemctl status cloudflared                                  
```

<br>

# 접속 테스트

도메인으로도 접속이 잘 된다.

![test](https://www.dropbox.com/scl/fi/91cvjfa21spui29iw70vg/mini-pc-depoly5.png?rlkey=vdfwyvke7nlxo51bto9xcbeja&st=tfv9tlzl&dl=`)

<br>

외부 접속인 모바일 데이터를 통한 접속도 잘 된다.

![mobile-test](https://www.dropbox.com/scl/fi/wmblo595ty0zpnpdtyqou/mini-pc-deploy5.png?rlkey=m53sl3af5296zk8f663mmklvf&st=sjnz9k94&dl=1)

<br>

다음은 외부 인터넷을 사용할때 터미널을 통해 접속하는 방법을 공부해보겠다.