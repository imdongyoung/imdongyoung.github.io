---
title: AWS - EBS 볼륨 수정 및 EC2 ubuntu에 확장된 볼륨 적용
date: 2026-05-27
category: AWS
description: AWS EBS에서 볼륨을 수정해도 EC2 서버에 반영되지 않은 문제를 해결하는 방법에 대해 공부해보았습니다.
tags: [aws, ebs]
---

# 발생한 문제

> t3.micro와 8GB의 볼륨을 사용하고 있는 EC2에 NestJS 프로젝트의 CI/CD 파이프라인 구축 작업을 하다 docker image, node package, nginx/certbot 파일, github-actions runners 파일 등 금방 용량이 다 차서 aws cli를 설치하지 못하고 있었다.

![ebs1](https://www.dropbox.com/scl/fi/v4i93n5u1p2hmat0rdfhh/ebs-volume1.png?rlkey=foetxrkvrp8j0v5rj5ex23jeg&st=lm9np16f&dl=1)
![ebs2](https://www.dropbox.com/scl/fi/d1x8ej13ugw6hw20v69m9/ebs-volume2.png?rlkey=1yh6emv213i0qke51ic79tm3c&st=eivwg4ua&dl=1)

- /usr -> Ubuntu 시스템 프로그램 및 설치한 라이브러리(node, docker, aws cli 등)
- /var -> 로그, Docker 데이터, 캐시
- /home -> 사용자 데이터(Github actions runner)

<br>

# EBS 볼륨 수정

EC2 인스턴스 -> EBS -> 볼륨 선택 후 작업 -> 볼륨의 용량을 원하는 용량으로 설정

<br>

# 설정 후 다시 용량 확인

![ebs3](https://www.dropbox.com/scl/fi/l1tas65dnxm2zmh286sqo/ebs-volume3.png?rlkey=u7ybaidgmzepda2xz6zumgwyg&st=yh1hyi4l&dl=1)

볼륨을 수정했는데 다시 확인해도 똑같다.

AWS의 EBS 크기만 늘어난 상태이고, Ubuntu 파일 시스템에 확장된 볼륨을 적용시켜주지 않았기 때문에 같은 결과가 나온다.

![ebs4](https://www.dropbox.com/scl/fi/7410gj2jycpcrva36422n/ebs-volume4.png?rlkey=7vq6n5uozfzf61idxb2f8dm0r&st=sainnbdp&dl=1)

nvme0n1애 확장된 20GB의 볼륨이 확인된다.

<br>

# Ubuntu에 볼륨 적용

growpart 설치

```bash
sudo apt update
sudo apt install -y cloud-guest-utils
```

파티션 확장

```bash
sudo growpart /dev/nvme0n1 1
```

파일시스템 확장

```bash
sudo resize2fs /dev/nvme0n1p1
```

확인

![ebs5](https://www.dropbox.com/scl/fi/hcn94m3si5st3cc8c5f1r/ebs-volume5.png?rlkey=6d1j77nddalafqn3hmyfr2o1j&st=151h3jnw&dl=1)
