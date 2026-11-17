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

![프록시 이미지1](https://previews.dropbox.com/p/thumb/ADQxf6I0ubGeXofH5awb5BBljLw_mOP_7uvNBsbilc9qcj8h4-rI45E1SEHPylvRPkUBMNF5NPuHZXbpU0mHl8h26-BkEPnMHSr3D5Y6MbC_SFDIDAIz2tVbU9xC2rfLFl_Qcq09niv9oiQ_MV3W_FYpm1A3vB5MKnxmTfx_qQdEZePbK-NiC9uIsqX33C0YlK3c1Qx4GPQA8SAokSl4k3UsOiYBHA0jQuPZOucMEUBb-g3TkU1cG0QN7S7XNmMU79reROBnMIipm9aQ2KiXFpp68zvQLC6Yr9XmtJkBsY30qQRnRlXFzsgxiBS2nDq4VgBUsoy9js7yCEV_uheN0zRb/p.png?is_prewarmed=true "이미지 출처 : https://velog.io/@younghyun/series/Network")

## 포워드 프록시(Forward Proxy) ?

**보내려고 하는 요청**을 **관리** 또는 **보안 처리**를 위한 용도로 사용하는 서버를 **포워드 프록시(Forward Proxy)** 서버 라고 한다.

포워드 프록시 서버의 대표적인 예시로 **회사 방화벽**이 있다. 회사 내부에 있는 컴퓨터로 ChatGPT에 접속하려는데 차단되는 경우가 있다. 이 경우 포워드 프록시 서버가 보내려는 요청을 감시하면서 위험하다고 판단되는 사이트에 접속하지 못하게 차단 설정을 한 것이다.

![프록시 이미지2](https://previews.dropbox.com/p/thumb/ADQkqV9w9y7pJVHmzZSKmS2mq8IwC6c31sokhL5glBMyDSM5T7TCwgLkHR1HTm4w6iCL_LiI3Mzdf_qhvbUk7iaH9330rD6sNTyH5cF6HU1aCbs55nUaZnOLVa8nI5_hMCUrunIpt1g5uax6o5-HRrUZP2safsOSp5JkKxqgpP3vQopUEl_yeoA6rnSQ8ive2smWlOlp_-T5TA38Gu6dyLqPk7n5blNtF3LU1CigvrLPq4KH49a4O_-VoVQwFSR6Ty_B_CSB7QSktG7lykmR1aHgd1vKFVOuVWJ2Z4p6noiVNI3Sr3Ch58RepxB21Ev0x0IUSi11f7xD4ufD_0Hc6rEO/p.png "이미지 출처 : https://hudi.blog/forward-proxy-reverse-proxy/")

## 리버스 프록시(Reverse Proxy) ?

**들어오는 요청**을 **관리** 또는 **보안 처리**를 하기 위한 용도로 사용하는 서버를 **리버스 프록시(Reverse Proxy)** 서버라고 한다.

리버스 프록시 서버의 대표적인 예시가 **HTTPS 처리, 요청 수 제한, 로드 밸린싱**을 하는 용도로 사용하는 **Nginx**가 있다.

리버스 프록시 서버가 들어오는 요청의 보안 처리를 하기 위해 HTTPS 처리를 한다. 그리고 들어오는 요청을 감시하다가 일정 요청 수 이상을 보낼 때도 차단을 하게끔 설정할 수 있다.

또한 들어오는 요청을 여러 대의 서버로 분배해주는 로드밸런싱 기능을 하게끔 셋팅할 수 있다.

![프록시 이미지2](https://previews.dropbox.com/p/thumb/ADQJsTqY2KDEgY67sY9GqC2_x_O8lfBiqoINmAS6ZIB7rmNlwVc6IzheOjfdQks-T2Qi9swSIkp9iPZKYST_ST1bvMhIGOTktASqbHzydq5WdXX8VypFwsN6yk7tSMYFiKXVxcqEb9NB2XyRsZnhMWB-6QRTi2Ob8QThYxNtNHbzx-vgbXTiAJBHaxCHj_1MK4EldpB0q8A6YAv-TYaX3WFUMe0RAmELNTaRU7pyrgp9Yb7zjAZKguvpzmwIDTqWqtzcCBQ0KbnYFtWYvZpoUnirExYbkRPjXRykj6t7p6ZHoXhWtbsIUhGEq6QCyGAgfkkPlxIHdXez3SiSH_0Wdyfh/p.png "이미지 출처 : https://hudi.blog/forward-proxy-reverse-proxy/")

## 리버스 프록시를 왜 사용할까?

들어오는 요청을 관리 또는 보안 처리를 하기 위해 사용되며, 만약 리버스 프록시 서버를 사용하지 않고 직접적으로 들어오는 요청을 백엔드 서버가 바로 받아 처리하는 식으로 구성하면 보안적으로 문제가 되는 경우가 많다.

대표적으로 누군가가 악의적으로 수많은 요청을 갑자기 보내는 경우, 실제 백엔드 서버가 그 요청을 다 받아서 처리하려고 하기 떄문에 과부하가 걸려 서버 장애가 발생한다.
