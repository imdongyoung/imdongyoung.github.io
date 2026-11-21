---
title: Nginx 문법과 명령어
date: 2026-05-07
category: Nginx
description: Nginx의 기본 문법과 명령어
tags: [nginx]
---

# nginx.conf

Nginx의 기본적인 설정 파일

<br>

# Nginx 문법

```nginx title="nginx.conf"
# server : 하나의 웹 사이트에 관련된 설정을 관리하는 단위 (server 블럭 이라고 부름)
server {
	# localhost:80으로 들어오는 요청을 이 server 블럭으로 처리하도록 설정
    # server_name이 일치하는 server 블럭이 없는 경우 첫 번째 server 블록으로 처리
	listen		80;
    server_name	localhost;

    # /로 시작하는 모든 경로를 처리
    location / {
    	# /test.html로 요청이 들어오면 /usr/share/nginx/html/test.html 파일로 응답
    	root	/usr/share/nginx/html;

        # /로 요청이 들어오면 /usr/share/nginx/html/index.html로 응답
        # 만약 /usr/share/nginx/html/index.html이 없을 경우,
        # /usr/share/nginx/html/index.htm으로 응답
        index index.html index.htm;
    }

    # Nginx에서 500, 502, 503, 504의 상태 코드가 발생했을때 /50x.html로 redirect
    error_page	500 502 503 504	/50x.html;

    # /50x.html과 완전히 일치하는 경로를 처리
    location = /50x.html {
    	# /50x.html로 요청이 들어오면 /usr/share/html/50x.html 파일로 응답
        root	/usr/share/nginx/html;
    }
}
```

<br>

# Nginx 명령어

```bash
# nginx 문법 확인 명령어
sudo nginx -t

# nginx 설정 파일 변경 반영
sudo nginx -s reload
```

<br>

# Nginx 에러 디버깅 방법

```bash
# 1번째, Nginx 실행 상태 확인
sudo systemctl status nginx

# 2번째, Nginx 문법 확인
sudo nginx -t

# 3번째, error 로그 확인
cd /var/log/nginx
vi error.log
```
