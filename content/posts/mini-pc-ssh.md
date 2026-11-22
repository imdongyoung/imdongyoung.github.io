---
title: 외부 인터넷에서 미니 PC 서버로 접속
date: 2026-11-22
category: Server
description: 카페나 학교 인터넷에서 미니 PC로 SSH를 사용해서 접속하는 방법에 대해 공부해보았습니다.
tags: [server, pc]
---

# 외부에서는 접속이 안 되나?

집 안의 공유기에 미니 PC를 연결했기에 집 내부의 기기들만 접속이 가능하고 외부 인터넷의 접속은 불가능하다.

그럼 밖에 있을때 미니 PC로 SSH 접속을 하고 싶을때 아무 것도 할 수 없다.

외부에서도 접속 할 수 있도록 Tailscale을 사용하여 설정해 보겠다.

<br>

# Tailscale ?

![tailscale](https://www.dropbox.com/scl/fi/j16gjrld20ith7zg4upno/tailscale.webp?rlkey=a7it31uc0btiy1zzk1b3izpo3&st=hijf2k7z&dl=1)
 
Tailscale은 등록된 기기들끼리만 쓰는 사설 네트워크를 인터넷 위에 만들어주는 VPN 서비스이다.

앱 설치와 로그인으로 간단하게 Tailscale 사설 네트워크에 연결을 할 수 있어 매우 간편하다.

<br>

# 설정 방법

먼저 서버에 Tailscale을 설치해준다.

```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

<br>

그 다음 서버를 Tailscale 네트워크에 연결을 해준다. 아래 명령어를 입력하면 로그인 URL이 나온다.

```bash
sudo tailscale up
```

![tailscale up](https://www.dropbox.com/scl/fi/v0yia2mtdtzhcqduaav2s/mini-pc-ssh1.png?rlkey=u04lg7majfcrk3bmfvepddyq9&st=r6nhudik&dl=1)

<br>

그 다음 Mac에 Tailscale을 설치해준다.

[Talescale 다운로드](https://tailscale.com/download)

<br>

그러면 tailscale에 미니 PC와 Mac이 연결된 것을 확인할 수 있다.

![tailscale desktop](https://www.dropbox.com/scl/fi/vvengtycnhh6pll74t6u7/mini-pc-ssh3.png?rlkey=uzh128dc7kv7rn28fqldgz8pq&st=9dwwl97w&dl=1)

<br>

Mac에서 미니 PC로 요청이 가는지 확인해본다.

```bash
tailscale ping 100.65.xx.xx
```

![pong](https://www.dropbox.com/scl/fi/fdp6x5ocrdthnezvao6pn/mini-pc-ssh4.png?rlkey=c7enzgrz0judlazx3n2nm1csm&st=etjke1jx&dl=1)

요청도 잘 간다.

<br>

Tailscale은 기기를 잃어버리는 것을 대비해 기기 인증을 일정 시간마다 만료시킨다. 하지만 미니 PC는 집에 두기 때문에 잃어버릴 일이 없다.

그러므로 해당 설정은 꺼준다.

[Tailscale 관리자 콘솔](https://login.tailscale.com/admin/machines)에서 연결된 미니 PC 목록 오른쪽 점 세 개를 클릭하면 나오는 `Disable key expiry` 항목을 선택한다.

![key expiry](https://www.dropbox.com/scl/fi/8xegg88qz4v0kxt2l8kxo/mini-pc-ssh5.png?rlkey=v3h4um9eana5ubljocjg77muq&st=dw6bbq1s&dl=1)

<br>

이제 이전에 설정했던 Mac의 SSH 프로필을 수정해줘야한다.

```bash
vi ~/.ssh/config
```

```nginx
Host homeserver
    # 미니 PC 사설 IP 대신 Tailscale IP로 변경
    HostName 100.65.x.x       
    User dongyoung
    IdentityFile ~/.ssh/id_ed25519
```

<br>

그 다음 방화벽 설정을 수정해준다.

이전에 SSH의 모든 접속을 허용하도록 했다.

이제는 집 안의 네트워크와 Tailscale을 통한 접속만 허용하도록 수정한다.

```bash
# Tailscale로 들어온 SSH 허용
sudo ufw allow in on tailscale0 to any port 22
# 집 안 네트워크에서 온 SSH 허용
sudo ufw allow from 172.30.1.0/24 to any port 22
# "모든 SSH 허용" 규칙 삭제
sudo ufw delete allow OpenSSH
```

<br>

테스트를 해보면 접속이 잘 된다.

![test](https://www.dropbox.com/scl/fi/9artzf52jxhf7lhsncbav/mini-pc-ssh7.png?rlkey=yvlcuj17o1sey063w53blp8b9&st=szylyy96&dl=1)

이제 어디서든 Mac을 통해 미니 PC에 접속을 할 수 있게 되었다~

