---
title: AWS - 인터넷 게이트웨이, 라우팅 테이블
date: 2026-06-29 00:02
category: AWS
description: AWS의 인터넷 게이트웨이와 라우팅 테이블에 대해 공부해보았습니다.
tags: [aws]
---

## 인터넷 게이트웨이란?

VPC와 외부 인터넷 간에 통신할 수 있게 해주는 장치

![image1](https://www.dropbox.com/scl/fi/zowvoausncsern0x1fqwy/aws-igw1.png?rlkey=r2p4ojkxqeeyl469z3no0gjx8&st=o7lb906t&dl=1)

<br>

## AWS 인터넷 게이트웨이 생성 및 연결

VPC -> 인터넷 게이트웨이에서 인터넷 게이트웨이 생성

![image2](https://www.dropbox.com/scl/fi/y84m67sjgob82mve079ke/aws-igw2.png?rlkey=hab252s35u4vsnqanj1em50x8&st=skgy3jz2&dl=1)

생성된 인터넷 게이트웨이를 체크하고 \[작업\] -> \[VPC에 연결\] 클릭

![image3](https://www.dropbox.com/scl/fi/kjtxqt9sz8sgwarfv7n0w/aws-igw3.png?rlkey=hmodziqpppw4jaltpdvke65jm&st=a7hhgs10&dl=1)

EC2 인스턴스가 배치된 VPC에 연결

![image4](https://www.dropbox.com/scl/fi/iflb2hzbrfve8wwbl6gxq/aws-igw4.png?rlkey=19q6qy3jdpxst9nhtsm4ub2gu&st=hhas3uox&dl=1)

<br>

## 라우팅 테이블

트래픽을 어디로 전송해야 하는지 경로를 알려주는 테이블, VPC는 인터넷 게이트웨이 뿐만 아니라 라우팅 테이블도 있어야만 외부 인터넷과 통신 할 수 있다.

서브넷을 퍼블릭이라고 이름을 붙였다고 자동으로 인터넷이 되는게 아니고, 라우팅 테이블에 IGW로 가는 규칙이 있어야 퍼블릭 서브넷이 된다.

VPC 내부에 있는 EC2 인스턴스가 외부에 있는 특정 컴퓨터와 통신을 하고 싶을때. 인스턴스는 외부 인터넷과 통신을 해야하기 때문에 인터넷 게이트 웨이를 거쳐가야 한다. 하지만 컴퓨터는 생각보다 똑똑하지 않기에 인터넷 게이트웨이로 가는 방법을 알려줘야한다. 즉, EC2 인스턴스가 어떤 방향으로 트래픽을 보내야 하는 지 알려주는 장치가 라우팅 테이블이다.

![image5](https://www.dropbox.com/scl/fi/ejf3fnur3y816k4oja2e0/aws-igw5.png?rlkey=qlnj6ymnzwlkbmg9x3r32kfr7&st=09lb4v3h&dl=1)

<br>

## AWS 라우팅 테이블 생성 및 연결

VPC -> 라우팅 테이블에서 라우팅 테이블 생성

EC2 인스턴스가 배치된 VPC에 생성

![image6](https://www.dropbox.com/scl/fi/22lfksbopjmk82jfsemx8/aws-igw6.png?rlkey=4qi736wqnriz5oqzf3xfb7fsa&st=gq3lomhl&dl=1)

생성된 라우팅 테이블을 체크하고 아래 세부항목에서 \[서브넷 연결\] -> \[서브넷 연결 편집\] 클릭

![image7](https://www.dropbox.com/scl/fi/3kf6s4au965zlau51qz57/aws-igw7.png?rlkey=mirjgf9mwpmgna6nza0c4u3p8&st=gw5rjbqh&dl=1)

생성한 퍼블릭 서브넷을 체크하고 저장

![image8](https://www.dropbox.com/scl/fi/gl0hgq3ymlm5gczetgpll/aws-igw8.png?rlkey=qhg0o3v2pw5bmugyxs6fhalc9&st=ncwil8xq&dl=1)

다시 라우팅 테이블을 치크하고 아래 세부항목에서 \[라우팅\] -> \[라우팅 편집\] 클릭

![image9](https://www.dropbox.com/scl/fi/s4xtncpf8nt5m3aio3qo7/aws-igw9.png?rlkey=fpz29wf7k57udqlwy0bcfv4ku&st=09samqh8&dl=1)

라우팅 편집에서 어떤 경로로 트래픽을 전송해야 하는지 정의해야함

- **라우팅1** : VPC 내부에서 10.0.0.0/16으로 보내는 트래픽은 local로 보내라는 뜻으로, Private IP를 활용해 내부에서 통신을 하겠다는 의미
- **라우팅2** : 0.0.0.0/0은 모든 IPv4 주소를 의미하며, VPC 내부에서 IPv4 주소로 보내는 모든 트래픽은 인터넷 게이트웨이로 보내라는 의미

10.0.0.0/16 범위 내의 IP인 경우 두 조건을 모두 충족한다. 이럴 경우 IP 주소 범위의 조건이 구체적인 것을 우선적으로 적용한다.

![image10](https://www.dropbox.com/scl/fi/upece9hh5kv0zlo9rbqsv/aws-igw10.png?rlkey=lqxsv0h8ch0yktjg5l9xaia2z&st=6ivtzmt9&dl=1)

인터넷 게이트웨이와 라우팅 테이블을 세팅하면 VPC 내에 배치된 EC2 인스턴스에 접속이 된다. 이렇게 만든 서브넷을 퍼블릭 서브넷 이라고 한다.

![image11](https://www.dropbox.com/scl/fi/qb4oc6jq8u83b2yyteex5/aws-igw11.png?rlkey=8zue1wgapulzcoaxn3x8zo0ku&st=wtt2ogr5&dl=1)