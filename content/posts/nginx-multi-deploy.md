---
title: Nginx - 하나의 도메인으로 여러 웹페이지를 배포
date: 2026-05-08
category: Nginx
description: 하나의 도메인으로 여러 웹페이지를 배포하는 방법을 배워보았습니다.
tags: [nginx, domain]
---

## 1\. 먼저 하나의 도메인에 2개의 EC2 퍼블릭 IP를 연결

![nginx-multi1](https://www.dropbox.com/scl/fi/v5agb70f3o1ozav8jileo/nginx-mulit1.png?rlkey=ilq71fhvpzmzvygrutlj2wjq5&st=pejzkg3q&dl=1)

## 2\. Nginx 설정 파일 수정

```nginx title="/ect/nginx/conf.g/default.conf"
# nginx-dy.p-e.kr로 들어오는 요청을 react로 처리
server {
	listen 80;
    server_name nginx-dy.p-e.kr;

    location / {
    	root /usr/share/nginx/nginx-frontend-react/dist;
        index index.html
    }
}

# admin.nginx-dy.p-e.kr로 들어오는 요청을 next로 처리
server {
	listen 80;
    server_name admin.nginx-dy.p-e.kr;

    location / {
    	root /usr/share/nginx/nginx-frontend-next/out;
        index index.html
    }
}


# 문법 체크 후 설정 파일 적용
sudo nginx -t
sudo nginx -s reload
```

## nginx-dy.p-e.kr로 접속 시 react 응답

![nginx-multi2](https://www.dropbox.com/scl/fi/s9v9caaruodptflz9i3zu/nginx-multi2.png?rlkey=wgq8h1dcojbbnb9f7chdjn1nd&st=ly78xdqx&dl=1)

## admin.nginx-dy.p-e.kr로 접속 시 next 응답

![nginx-multi3](https://www.dropbox.com/scl/fi/qiua8nmdq68sqxt7halum/nginx-multi3.png?rlkey=9hd8u7k3ka8rtdplxkqjszhh5&st=ocmw8pul&dl=1)
