---
title: Nginx - Certbot으로 HTTPS 적용
date: 2026-05-08
category: Nginx
description: Certbot을 사용해 Nginx에 HTTPS를 적용하는 방법을 배워보았습니다.
tags: [nginx, https]
---

## Ubuntu에 Certbot 설치 명령어

```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

<br>

## HTTPS 인증서 발급 받기

```bash
sudo certbot --nginx -d <도메인 주소>

# nginx 설정 파일의 server 블록에 해당 도메인이 없으면 에러
```

<br>

### 인증서를 발급 받으면 HTTPS로 접속할 수 있음

![nginx-https-image](https://www.dropbox.com/scl/fi/sxlrhcznsubyqhup15dzz/nginx-https1.png?rlkey=o5tfemdcxvue90d54u6gxtl5x&st=q9oghfvo&dl=1)

<br>

### Certbot이 작성한 Nginx 설정 파일 코드

```nginx title="nginx-dy.p-e.kr.conf"
# HTTPS nginx-dy.p-e.kr 요청을 처리
server {
        server_name nginx-dy.p-e.kr;

        location / {
                root /usr/share/nginx/nginx-frontend-react/dist;
                index index.html;
        }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/nginx-dy.p-e.kr/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/nginx-dy.p-e.kr/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}


# HTTP nginx-dy.p-e.kr 요청을 HTTPS로 리다이렉트
# HTTP이면서 nginx-dy.p-e.kr이 아니면 404 응답
server {
    if ($host = nginx-dy.p-e.kr) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

        listen 80;
        server_name nginx-dy.p-e.kr;

    return 404; # managed by Certbot


}
```

```nginx title="admin.nginx-dy.p-e.kr.conf"
# HTTPS admin.nginx-dy.p-e.kr 요청을 처리
server {
        server_name admin.nginx-dy.p-e.kr;

        location / {
                root /usr/share/nginx/nginx-frontend-react/dist;
                index index.html;
        }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/admin.nginx-dy.p-e.kr/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/admin.nginx-dy.p-e.kr/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}


# HTTP admin.nginx-dy.p-e.kr 요청을 HTTPS로 리다이렉트
# HTTP이면서 admin.nginx-dy.p-e.kr이 아니면 404 응답
server {
    if ($host = admin.nginx-dy.p-e.kr) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

        listen 80;
        server_name admin.nginx-dy.p-e.kr;

    return 404; # managed by Certbot
}
```

```nginx title="default.conf"
include nginx-dy.p-e.kr.conf;
include admin.nginx-dy.p-e.kr.conf;
```

<br>

## Certbot으로 발급 받은 인증서 확인 명령어

```bash
sudo certbot certificates
```
