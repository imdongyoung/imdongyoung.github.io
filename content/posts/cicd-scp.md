---
title: CI/CD - SCP를 활용하여 CI/CD 구현
date: 2026-05-14
category: CI/CD
description: SCP를 활용하여 GitHub Actions으로 CI/CD를 구현하는 방법에 대해 공부해보았습니다.
tags: [ci/cd, github-actions]
---

![cicd-scp1](https://previews.dropbox.com/p/thumb/ADREumHaKqGz-PLtZZ2fLm5u9cxTVpCYYmOVnYh7BHjyXvvOms3GVyFpD1ypcMoCV4bbvlubqhEec7MklXGdyPFJeT45yDUKq37eqU-Lhhajh_kf2MvN2IPmLlmZdNeCBgAtrcVWsuLnvBKoAmJTSgpm0z8WANkg5e1Q33q8zCaiM4_ssaYQDxppyU_2Ig3qAE0xevp-Ac_MoL5QFS9rjDI8LT4LG_o2NG5d1jnEtm-zAmvQ0df2UIvd2j1NoHlRA6H7k3rV1RhPxLAWO0avY-zdymBZPiTMg2-oIIZJbBY1qe09a77iMzQ0UoiIQvbVqsm0kOrpwxGSc5RXrsVg4p90/p.png)

## SCP ?

SCP는 EC2로 빌드된 파일을 전송해주는 기능

## 장점

- 빌드 작업을 Github Actions에서 하기 때문에 운영하고 있는 서버의 성능에 영향을 거의 주지 않는다.
- CI/CD 툴로 Github Actions만 사용하기 때문에 인프라 구조가 복잡하지 않고 간단하다.

## 단점

- 무중단 배포를 구현하거나 여러 EC2 인스턴스에 배포해야 하는 상황이라면, 직접 Github Actions에 스크립트를 작성해서 구현해야한다. 이 방식은 상당히 복잡하다.

> **이 방식은 현업에서 초기 서비스를 구축할때 많이 활용함**

## 구축 과정

### 1\. NestJS 프로젝트 생성

### 2\. .github/workflows/deploy.yml 파일 작성 후 Push

> 1.  Github Actions 서버에서 테스트를 진행하는건 git pull 과정과 동일
> 2.  테스트 성공 시 Github Actions 서버에서 프로젝트 빌드
> 3.  빌드된 파일들을 압축
> 4.  압축된 파일을 EC2 서버로 전송
> 5.  전송 받은 압축 파일을 해제 후 실행

```yml title=".github/workflows/deploy.yml"
name: Deploy To EC2

on:
  push:
    branches:
      - main

jobs:
  # Deploy라는 이름의 job
  Deploy:
    # appleboy/ssh-action 라이브러리로 EC2에 접속
    runs-on: ubuntu-latest
    steps:
      - name: Github Repository 파일 불러오기
        uses: actions/checkout@v4

      - name: Node 설치
        uses: actions/setup-node@v4
        with:
          node-version: "22"

      - name: 의존성(라이브러리) 설치
        run: npm ci

      - name: .env 파일 만들기
        run: |
          echo '${{ secrets.ENV }}' > .env

      - name: 테스트 코드 실행
        run: npm run test

      - name: 빌드
        run: npm run build

      - name: 압축하기
        run: tar -czvf project.tar.gz dist .env package.json package-lock.json

      - name: SCP로 EC2에 빌드된 파일 전송하기
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USERNAME }}
          key: ${{ secrets.EC2_PRIVATE_KEY }}
          # 전달할 파일
          source: project.tar.gz
          # 전달 받을 위치
          target: /home/ubuntu/ci-cd-practice-nest/tobe

      # .env를 압축 파일로 전달받아 생성할 필요가 없음
      - name: SSH로 EC2 접속
        uses: appleboy/ssh-action@v1.0.3
        with:
          # EC2 IP 주소
          host: ${{ secrets.EC2_HOST }}
          # EC2 username
          username: ${{ secrets.EC2_USERNAME }}
          # EC2 키페어
          key: ${{ secrets.EC2_PRIVATE_KEY }}
          script: |
            rm -rf /home/ubuntu/ci-cd-practice-nest/current
            mkdir /home/ubuntu/ci-cd-practice-nest/current
            mv /home/ubuntu/ci-cd-practice-nest/tobe/project.tar.gz /home/ubuntu/ci-cd-practice-nest/current/project.tar.gz
            cd /home/ubuntu/ci-cd-practice-nest/current
            tar -xvf project.tar.gz
            npm i
            pm2 kill
            ls -a /home/ubuntu/ci-cd-practice-nest
            pm2 start dist/main.js --name "backend-server"
```
