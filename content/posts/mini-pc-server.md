---
title: 중고 미니 PC를 구매하여 서버 만들기
date: 2026-11-19
category: Server
description: 중고 미니 PC를 구매하여 서버를 만들어 AWS 비용을 막아보자
tags: [server, pc]
---

# 중고 미니 PC 구매 이유

사이드 프로젝트를 하면서 항상 AWS를 사용했다.

EC2, Elastic IP, RDS, ECR 등..

여러 서비스를 사용하니까 비용이 월에 3~4만원 씩은 나오는 것 같다.

다른 방법이 없나 찾아보다가 유튜브에서 중고로 미니 PC를 구매하여 서버로 사용한다는 사람을 봤다.

전기료는 월 2~3천원 정도 나오는 것 말곤 추가 지출이 없어서 안 할 이유가 없는 것 같다.

바로 당근에서 20만원에 중고 미니 PC를 구매했다!

PC는 백엔드 서버 3~4개는 동시에 가동할 수 있을 사양의 PC를 구매했다.
- CPU : AMD Ryzen3 5425u
- RAM : 16GB
- SSD : 256GB


<br>

# 서버 만들기

### 1. 설치 USB

먼저 사용하지 않는 USB에 Ubuntu Server 설치 파일을 받았다.

Ubuntu Desktop은 GUI를 위한 프로그램이 함께 돌아가 메모리와 CPU를 더 사용하여, 화면이 따로 필요 없는 가벼운 Ubuntu Server로 설치했다.

설치할때는 Rufus로 설치한 ISO 파일을 USB에 구워서 설치했다.

![install-usb](https://www.dropbox.com/scl/fi/u55sgvqvfivailivcm1sn/mini-pc1.png?rlkey=3rx3u7nogkjd4xxnta3n8zi8q&st=rh65558l&dl=1)

<br>

### 2. BIOS 설정

서버로 사용해야 하기에 24시간 가동할 수 있도록 BIOS에서 설정을 진행했다

정전 후 전기가 돌아오면 다시 자동으로 켜질 수 있도록 Restore on AC Power Loss 기능을 Power On으로 설정했다.

유선 LAN 만을 사용하기에 전력을 조금이라도 아끼기 위해 Wi-Fi와 블루투스 사용은 껐다.

Ryzen 내장 그래픽은 RAM의 일부를 떼어가 사용한다고 하기에 UMA Frame Buffer Size를 128MB로 설정하여 조금만 떼어가도록 설정했다.

<br>

### 3. OS 설치

OS 설치는 어려운게 없었다. USB를 꼽고 BIOS에서 USB로 부팅하고 언어 선택하고, IP 잘 잡히는지, 디스크 전부 사용하는지, 확인하고 프로필 설정하면 끝이다.

<br>

### 4. 한국 시간으로 설정

시스템을 한국 시간으로 해야 로그와 백업이 한국 시간으로 찍히기 때문에 설정을 해준다.

```bash
sudo timedatectl set-timezone Asia/Seoul
```

<br>

### 5. IP 고정

공유기는 기기마다 DHCP를 사용하여 IP를 자동으로 나눠주는데, 정전이나 재부팅 시 IP가 변경될 수 있다.

미니 PC에 연결된 유선 인터페이스와 MAC 주소, IP 주소를 확인하고, 공유기 관리 페이지로 접속한다.

우리 집은 KT 공유기를 사용하고 있어서 `172.30.1.254`로 접속했다.

근데 관리자 페이지에서는 미니 PC의 연결 정보가 나오지 않고 있었다.

확인해보니 우리 집 네트워크는 **광케이블** -> **광모뎀** -> **공유기** -> **기기(PC, 휴대폰)**로 구성되어 있었다.

- 광모뎀은 KT 인터넷 망과 집을 이어주는 장비이다. 광모뎀에 직접 연결된 기기는 KT에서 공인 IP를 받는다.
- 공유기는 공인 IP 하나를 광모뎀을 통해 KT에게 받아서 연결된 기기들에게 사설 IP를 나눠준다. 외부에서는 공유기 뒤의 기기로 다이렉트로 접속할 수 없어 보호막 역할을 해준다.

나는 광모뎀에 PC를 연결해놓고 있었다. 그래서 공유기를 거치지 않았고 공유기 목록에도 나타나지 않았던 것이다.

이렇게 되면 어디서든 서버의 SSH에 로그인 시도를 할 수 있고 방화벽도 없어 위험한 상황이었다.

그래서 바로 공유기 옆으로 PC를 옮겼다.

그리고 `ip a` 명령어로 확인해보니 IP 주소는 나오지 않았다..

이유는 내 미니 PC에는 LAN 포트가 2개가 있다. 처음 광모뎀에 연결했을때 첫번째 포트에 연결해서 Ubuntu를 설치할 때 첫번째 포트에서 IP를 받도록 설정이 되어있었다.

```yaml
enp1s0:                # 첫번째 LAN 포트
  dhcp4: true          # IP를 받도록 설정됨
  match:
    macaddress: 00:e0:4d:xx:xx:xx
enp2s0:                # 두번째 LAN 포트
  accept-ra: true      # IPv6 광고만 받음. dhcp4 없음
```

근데 나는 모르고 두번째 포트에 연결을 했다.

그래서 두 포트 모두 IP를 받을 수 있도록 설정했다.

```yaml
enp1s0:                 # 첫번째 LAN 포트
  dhcp4: true
  optional: true        # 부팅 시 연결을 기다리지 않음
enp2s0:                 # 첫번째 LAN 포트
  dhcp4: true           # 두번째 LAN 포트도 IP를 받도록 설정
  optional: true        # 부팅 시 연결을 기다리지 않음
```

이제 정상적으로 IP가 연결되어 KT 관리자 페이지에서 고정 IP를 설정해주었다!

<br>

### 6. SSH 접속

먼저 ssh로 접속을 시도해보았다.

```bash
ssh dongyoung@172.30.1.xx
```

비밀번호를 입력하니까 접속이 잘 된다.

매번 비밀번호를 입력하는게 번거롭기 때문에, Mac에서 SSH 키를 만들고 공개키를 서버에 등록했다.

```bash
ssh-keygen -t ed25519 # SSH 키 생성

ssh-copy-id -i ~/.ssh/id_ed25519.pub dongyoung@172.30.1.xx
# 비밀번호 한 번 더 입력
```

이제 접속할떄 마다 비밀번호 입력 없이 접속이 된다.

그 다음 ssh의 config로 프로필을 설정해서 간단한 명령어로 입력할 수 있도록 설정했다.

```text title="~/.ssh/config"
Host homeserver
    HostName 172.30.1.xx
    User dongyoung
    IdentityFile ~/.ssh/id_ed25519
```

그러면 `ssh homeserver`라는 간단한 명령어로 미니 PC 서버에 접속이 가능해진다.

![ssh](https://www.dropbox.com/scl/fi/gbkveu3hhzzfyg1cgqdjk/mini-pc2.png?rlkey=0y3544riozmti54sg3hte42rz&st=ads8f9nm&dl=1)

하지만 아 방법은 미니 PC의 사설 IP로 접속하는 방법이기에 외부 학교나 카페 인터넷에서는 접속하지 못한다.

다음 글은 외부에서도 접속할 수 있는 방법을 포스트해야겠다.