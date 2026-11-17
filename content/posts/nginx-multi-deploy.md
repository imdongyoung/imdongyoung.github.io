---
title: Nginx - 하나의 도메인으로 여러 웹페이지를 배포
date: 2026-05-08
category: Nginx
description: 하나의 도메인으로 여러 웹페이지를 배포하는 방법을 배워보았습니다.
tags: [nginx, domain]
---

## 1\. 먼저 하나의 도메인에 2개의 EC2 퍼블릭 IP를 연결

![nginx-multi1](https://previews.dropbox.com/p/thumb/ADToBaPxKzMRZ2mNAKZYbq7gTc1qRDGSn0-W9hvPqhdoF0rAcq_oeSehavLaz7wQLhVYD-fJtoG8kvnkpHkT__MsE8cpb6VkgVIlwoU-zokoWUUiqV3_Jfvs7-39JuQ6Oo0nh4crmnYDQqD1LMveR1uViv-jo9rxebF5ZxId5Dme7vkOfHlnHZ5vBTckJpynSSoM5J0NduVKoJSuLsyh8k-HVH9q1eULT_mmYwqCRGpPIF0yZQ8N8V8QvIgeuEF9bBKmjZoz7qyeXkHsVU84NzLQHrD-ViJofGwGSyW-FSpDnb2Bx4uPz-ljwoAWglzwV7x7QZjGMtVlnM8PGvt1YFhm/p.png)

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

![nginx-multi2](https://previews.dropbox.com/p/thumb/ADQKGPzIFnpElBbBQ1AogVcUlRj13eiucuGnYIV5spTbFa8vHZZuI4XJq14cuGckojs6IIXWDKCs9HHMp8OBcEaaf3ceXIV5_xC9VyymKfw7KXYmYDqemFaqRMzQGQcaUY5aHTFnFv6I1KrzkQ6MOxBE_7DiH0_ionxMvDEkPRlOH5GtmJX42zLOzcMG6batjJZjOjbqgKE82CGn6x388vQZMZizVOlL8C5ruzbqXabS9AkVo14pHW-iahrvdrjE_C53uwJpTWkibCvw2m2VvLOnYeA4nGeT--vT8sgyCGhb-RvSVH3MtcQYts1_AysLrmHZRMimLAAYuwZzh_d45mQi/p.png)

## admin.nginx-dy.p-e.kr로 접속 시 next 응답

![nginx-multi3](https://previews.dropbox.com/p/thumb/ADQrNStraB4TBmGWah3dY7ejXuENp4epe31XgVSAq6vWet3-bE5fJGR4dTdse1p5rWCmCkAkVbG8M7BkFq8Tte8uquw65XjecM7np-Qflbgnhq1wxkICnHckn2pzZF-RVoG2IeRegblda9QSA9P6BLKlODFKZ7YmF8avwaZnXLArfPnVB3sSWL82hybQdKkO-AFTqj2wA0cRC7Itoh2h9iuSMl6Tfrb4P66egyg7PPZ0Q0XGbBqzbHTQChg62P4ggeE2ev0iVej5XGU8ZyYpAUlfAteOc1Fe-_0N6g9TihN_GbeSiU5zGGRnnHT9lIVN78TAgPV-2qGNOUPoRQ6zjXVQ/p.png)
