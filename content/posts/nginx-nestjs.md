---
title: Nginx - NestJS 프로젝트에 Docker, Nginx, Certbot으로 HTTPS 적용
date: 2026-05-16
category: Nginx
description: NestJS 프로젝트에 Docker, Nginx, Certbot으로 HTTPS 적용하여 배포하는 방법에 대해 공부해보았습니다.
tags: [nginx, docker, certbot]
---

> 실습에서 사용한 스택 : **AWS EC2, Docker, Nginx, Certbot**

## pnpm용 빌드 Dockerfile

```dockerfile title="Dockerfile"
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
```

<br>

# **EC2에 HTTPS 적용**

## 1\. AWS EC2 인스턴스에 프로젝트 git clone

## 2\. Ubuntu에 Docker 설치

```bash
sudo apt update
sudo apt install -y ca-certificates curl git

sudo install -m 0755 -d /etc/apt/keyrings

sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  -o /etc/apt/keyrings/docker.asc

sudo chmod a+r /etc/apt/keyrings/docker.asc

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update

sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

<br>

## 3.  80번 포트로 먼저 배포 후 접속 확인

인증서 파일이 없기 때문에 443 서버 블록이 있으면 에러가 발생할 수 있음

```nginx title="nginx/conf.d/default.conf"
server {
    listen 80;
    server_name api.lunchmate.co.kr localhost;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://lunchmate-backend:3000;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```yml title="docker-compose.yml"
services:
  lunchmate-backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: lunchmate-backend
    image: ${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}
    expose:
      - "3000"
    env_file:
      - .env
    restart: always

  nginx:
    image: nginx:alpine
    container_name: lunchmate-nginx
    restart: always
    depends_on:
      - lunchmate-backend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./certbot/www:/var/www/certbot
      - ./certbot/conf:/etc/letsencrypt
```

<br>

## 4\. 컨테이너 실행 후 최초 SSL 인증서 발급

```bash
sudo docker compose run --rm --entrypoint "" certbot \
certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d api.lunchmate.co.kr \
  --email <본인이메일> \
  --agree-tos \
  --no-eff-email
```

<br>

## 5\. nginx, docker 설정을 HTTPS용으로 수정

```nginx title="nginx/conf.d/default.conf"
server {
    listen 80;
    server_name api.lunchmate.co.kr localhost;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name api.lunchmate.co.kr;
    server_tokens off;

    ssl_certificate /etc/letsencrypt/live/api.lunchmate.co.kr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.lunchmate.co.kr/privkey.pem;

    location / {
        proxy_pass http://lunchmate-backend:3000;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```yml title="docker-compose.yml"
services:
  lunchmate-backend:
    build:
      context: . #현재 디렉토리의
      dockerfile: Dockerfile # Dockerfile로 백엔드 이미지를 빌드
    container_name: lunchmate-backend
    image: ${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}
    expose:
      - "3000" # 컨테이너 내부 네트워크에서만 3000번 포트를 노출
    env_file:
      - .env
    restart: always # 컨테이너가 죽거나 EC2가 재부팅되면 자동 재시작

  nginx:
    image: nginx:alpine # 가벼운 alpine nginx 이미지
    container_name: lunchmate-nginx
    restart: always
    depends_on:
      - lunchmate-backend # 벡엔드 컨테이너를 먼저 시작한 뒤 Nginx를 시작함
    ports: # EC2의 80, 443 포트를 Nginx 컨테이너로 연결함, 외부 HTTP/HTTPS 요청이 여기로 들어옴
      - "80:80"
      - "443:443"
    volumes: # Nginx 설정, Certbot 인증용 웹루트, 발급된 인증서를 컨테이너와 공유
      - ./nginx/conf.d/prod.conf:/etc/nginx/conf.d/default.conf
      - ./certbot/www:/var/www/certbot
      - ./certbot/conf:/etc/letsencrypt
    # 인증서가 갱신되면 새 인증서를 읽도록 6시간 마다 Nginx 재시작
    command: '/bin/sh -c ''while :; do sleep 6h & wait $${!}; nginx -s reload; done & nginx -g "daemon off;"'''

  certbot:
    container_name: certbot
    image: certbot/certbot:latest
    restart: unless-stopped
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    # 12시간마다 certbot renew를 실행해 인증서 갱신을 시도함
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $!; done;'"
```

<br>

## 6\. Nginx 재시작 후 HTTPS 접속 확인
