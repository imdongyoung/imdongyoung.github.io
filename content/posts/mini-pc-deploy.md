---
title: 미니 PC 서버로 정적 페이지 배포
date: 2026-11-21
category: Server
description: 미니 PC 서버에 포트포워딩 없이 정적 페이지를 배포하는 방법에 대해 공부해보았습니다.
tags: [server, pc]
---

# 외부 인터넷에서 미니 PC로 접속되지 않은 이유
KT 공유기는 공인 IP 하나이고, 공유기에 연결된 기기들은 모두 사설 IP를 나눠쓴다.

그래서 내부 -> 외부로 요청을 하면 공유기가 요청을 보낸 기기의 사설 IP를 기록해두고 응답이 오면 기록했던 사설 IP를 확인하고 전달한다.

외부 -> 내부 요청은 어떤 사설 IP로 보냈는지 기록이 없어 전달해야 할 목적지를 몰라 공유기가 해당 요청을 버린다.

그래서 포트포워딩을 한다. 포트포워딩은 외부에서 오는 요청을 내부에서 받을 사설 IP를 지정해서 외부의 요청을 받는 방식이다.

하지만 포트포워딩은 포트를 열어야해 공격 받을 수 있는 확률이 높아진다. 그리고 공유기 재부팅이나 정전 시 공인 IP가 바뀌어 도메인 연결을 그때 그때 다시 해줘야한다.

그래서 간단한 Cloudflare Tunnel을 사용하려한다.

<br> 

# Cloudflare Tunnel
Couldflare Tunnel은 포트포워딩과 반대로 미니 PC에서 먼저 Cloudflare로 나가는 연결을 맺어두고, 외부의 요청이 이 연결을 타고 들어오는 구조로, 공유기는 내부의 기기가 외부로 접속한 것이라고 인지한다.

<br>

# 장점
장점으로는 외부에서 오는 요청을 열어두는 것이 아니기 떄문에 공격을 받을 확률이 적다.

집의 공인 IP가 노출되지 않고, 재부팅이나 정전으로 공인 IP가 바뀌어도 미니 PC 서버가 Cloudflare로 연결하는 방식이기에 신경쓸게 없다.

포트포워딩을 사용하면 certbot으로 인증서를 받고, 갱신 자동화를 설정하고 433포트도 따로 열어야하지만, Cludeflare는 이 과정을 자동으로 해준다.

<br>

# 단점
단점으로는 Cloudflare에 의존하기 때문에 Cloudflare에 장애가 발생하면 내 서비스도 같이 장애가 발생한다.

무료 플랜을 사용한다면 대용량 서비스도 불가능하다.

그리고 포트포워딩, DDNS, 인증서를 집접 다루지 않아 네트워크에 대한 공부도 되지 않는다.

하지만 매우 간편하기에 Cloudflare를 사용해보려 한다.

# 전체 흐름
서버가 켜지면 cloudflared가 Cloudflare 데이터센터로 연결을 걸어 유지한다. 서버가 건 연결이기에 공유기가 막지 않는다.

Cloudflare에 도메인을 연결하고 해당 도메인으로 접속을 하면 Cloudflare가 연결된 주소로 요청을 보낸다.

cloudflared가 Nginx로 넘기고 Nginx가 해당 포트의 파일을 잃어서 응답한다.

![flow](https://www.dropbox.com/scl/fi/nsynw4rju35i7nv9b39np/mini-pc-flow.drawio.png?rlkey=w3nh049geznm5ycldgl1qvdkg&st=ymrbiqgb&dl=1)

# 보안 설정
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```