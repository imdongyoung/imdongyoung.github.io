---
title: 프록시란
date: 2026-05-09
category: Proxy
description: 프록시가 무엇인지 공부해보았습니다.
tags: [proxy]
---

## 프록시(Proxy) ?

**프록시(Proxy)**란 **'중계(중간에서 연결해주는 것)'**의 의미를 가진다.

그러므로 **프록시 서버(Proxy Server)**는 **중간 역할을 해주는 서버**를 의미한다.

클라이언트(사용자)와 서버가 직접 통신하지 않고 중간 역할을 하는 **프록시 서버**를 거쳐 서버와 통신을 한다.

이처럼 중간 역할을 하는 서버를 **프록시 서버**라고 한다.

![프록시 이미지1](https://www.dropbox.com/scl/fi/xg462m1apaia9gdbi24hm/proxy1.png?rlkey=kogdkw5nwlc3xpgo7a6x49v7g&st=7v98hgtr&dl=1 "이미지 출처 : https://velog.io/@younghyun/series/Network")

<br>

## 포워드 프록시(Forward Proxy) ?

**보내려고 하는 요청**을 **관리** 또는 **보안 처리**를 위한 용도로 사용하는 서버를 **포워드 프록시(Forward Proxy)** 서버 라고 한다.

포워드 프록시 서버의 대표적인 예시로 **회사 방화벽**이 있다. 회사 내부에 있는 컴퓨터로 ChatGPT에 접속하려는데 차단되는 경우가 있다. 이 경우 포워드 프록시 서버가 보내려는 요청을 감시하면서 위험하다고 판단되는 사이트에 접속하지 못하게 차단 설정을 한 것이다.

![프록시 이미지2](https://www.dropbox.com/scl/fi/08ja0lut1ws9iywdwsggy/proxy2.png?rlkey=esxgfb0o7w5hoie1n81f1pvif&st=ec4khzix&dl=1 "이미지 출처 : https://hudi.blog/forward-proxy-reverse-proxy/")

<br>

## 리버스 프록시(Reverse Proxy) ?

**들어오는 요청**을 **관리** 또는 **보안 처리**를 하기 위한 용도로 사용하는 서버를 **리버스 프록시(Reverse Proxy)** 서버라고 한다.

리버스 프록시 서버의 대표적인 예시가 **HTTPS 처리, 요청 수 제한, 로드 밸린싱**을 하는 용도로 사용하는 **Nginx**가 있다.

리버스 프록시 서버가 들어오는 요청의 보안 처리를 하기 위해 HTTPS 처리를 한다. 그리고 들어오는 요청을 감시하다가 일정 요청 수 이상을 보낼 때도 차단을 하게끔 설정할 수 있다.

또한 들어오는 요청을 여러 대의 서버로 분배해주는 로드밸런싱 기능을 하게끔 셋팅할 수 있다.

![프록시 이미지2](https://www.dropbox.com/scl/fi/600gix4cflar09g04ew84/proxy3.png?rlkey=ti4tgdjj1hnhmxja3mzqacjqn&st=zbn6adnv&dl=1 "이미지 출처 : https://hudi.blog/forward-proxy-reverse-proxy/")

<br>

## 리버스 프록시를 왜 사용할까?

들어오는 요청을 관리 또는 보안 처리를 하기 위해 사용되며, 만약 리버스 프록시 서버를 사용하지 않고 직접적으로 들어오는 요청을 백엔드 서버가 바로 받아 처리하는 식으로 구성하면 보안적으로 문제가 되는 경우가 많다.

대표적으로 누군가가 악의적으로 수많은 요청을 갑자기 보내는 경우, 실제 백엔드 서버가 그 요청을 다 받아서 처리하려고 하기 떄문에 과부하가 걸려 서버 장애가 발생한다.
