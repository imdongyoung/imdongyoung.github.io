---
title: AWS - 서브넷
date: 2026-06-29 00:01
category: AWS
description: AWS의 서브넷에 대해 공부해보았습니다.
tags: [aws]
---

# 서브넷이란?

서브넷은 하나의 큰 네트워크(VPC, 회사 네트워크 등)를 더 작고 효율적인 여러 개의 구역으로 쪼갠 하위 네트워크를 의미한다.

서브넷을 사용하는 이유는 용도에 따라 네트워ㅡ를 분리해서 사용하고 싶기 떄문이다. 예를 들어 하나의 VPC에서 데이터베이스끼리만 모아놓은 네트워크와 백엔드 서버끼리만 모아놓은 네트워크를 분리해서 관리하고 싶을때 사용할 수 있다.

<br>

# 퍼블릭 서브넷 / 프라이빗 서브넷

VPC를 여러개의 서브넷으로 나눌때 가장 많이 활용하는 방식이 외부에서 접근이 가능한 네트워크와 외부에서 접근이 불가능한 네트워크로 나누는 방식이다. 여기서 외부에서 접근이 가능한 서브넷을 퍼블릭 서브넷이라고 부르고, 외부에서 접근이 불가능한 서브넷을 프라이빗 서브넷이라고 부른다.

<br>

# AWS 서브넷 생성

## 1\. VPC 선택

![subnet1](https://www.dropbox.com/scl/fi/zurw7eadi15kmgyo74g4x/aws-subnet1.png?rlkey=xgzvpn6839ifbwbarzs6ec2dv&st=5x9jfrcj&dl=1)

## 2\. Pulic 서브넷 설정

범위는 10.0.1.0/24로 10.0.1.0 ~ 10.0.1.255(256개)의 주소를 할당

![subnet2](https://www.dropbox.com/scl/fi/2qj4pmii581adsulss32c/aws-subnet2.png?rlkey=arsuyzh0g192oj469tqf4meki&st=5z444ss6&dl=1)

## 3\. Private 서브넷 설정

범위는 10.0.2.0/24로 10.0.2.0 ~ 10.0.2.255(256개)의 주소를 할당

![subnet3](https://www.dropbox.com/scl/fi/yb45tidok3v07028ivh7r/aws-subnet3.png?rlkey=djy0xipluu9o2p8i8yqty235q&st=kpu4p6gy&dl=1)

서브넷 이름은 보통 \[서비스명\]-\[pulic | private\]-subnet-\[가용영역 알파벳\]으로 작성한다.

<br>

# 퍼블릭 서브넷에 EC2 배치

EC2 인스턴스를 생성한 VPC와 서브넷으로 생성

-   퍼블릭 서브넷을 지정
-   퍼블릭 IP 자동 할당 활성화
-   인바운드 HTTP 허용

![subnet4](https://www.dropbox.com/scl/fi/ghkqvilk0ig2u5l72kxa8/aws-subnet4.png?rlkey=2ksup85zi2tz0m9yudqckgq39&st=1juxdid1&dl=1)
![subnet7](https://www.dropbox.com/scl/fi/dx2gnev4vce1efkaiknug/aws-subnet7.png?rlkey=gabg67lsky7ozoybbo6yf3dwd&st=gc65rtl9&dl=1)

하지만 연결을 시도하면 실패함

![subnet5](https://www.dropbox.com/scl/fi/nhvfpswjeq1wnyfam2a35/aws-subnet5.png?rlkey=0607fqu6smylcma46gwl9tnty&st=7jq078u7&dl=1)

인스턴스를 서브넷에 배치를 했지만 VPC에 외부 인터넷과 통신할 수 있는 출입구를 셋팅하지 않았기 때문에 접속되지 않음. 인터넷 게이트 웨이를 설정해 통신할 수 있도록 해야함

<br>

![subnet6](https://www.dropbox.com/scl/fi/n06fmcto83c4nndp04uet/aws-subnet6.png?rlkey=eimyrtkcyd9ltn1d0ynoic5o4&st=42wgpvb3&dl=1)