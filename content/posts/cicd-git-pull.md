---
title: CI/CD - git pull 방식의 GitHub Actions CI/CD 구현
date: 2026-05-13
category: CI/CD
description: git pull 방식을 통해 GitHub Actions으로 CI/CD를 구현하는 방법에 대해 공부해보았습니다.
tags: [ci/cd, github-actions]
---

![cicd-image](https://www.dropbox.com/scl/fi/u68orlikrhxf97yw02l2r/gitpull1.png?rlkey=w4hpq22qiqttejl6ouf34d8bp&st=74ryxq4m&dl=1)

## 장점

- git pull을 활용해서 변경된 부분의 프로젝트 코드에 대해서만 업데이트 하기 떄문에 CI/CD 속도가 빠르다.
  - 대부분의 CI/CD 방식들은 전체 프로젝트를 통쨰로 갈아끼우는 방식을 사용한다.
- CI/CD 툴로 Github Actions만 사용하기 때문에 인프라 구조가 복잡하지 않고 간단하다.

## 단점

- 빌드 작업을 EC2에서 직접 진행하기 때문에 운영하고 있는 서버의 성능에 영향을 미칠 수 있다.
- Github 계정 정보가 해당 EC2에 저장되기 때문에 개인 프로젝트 또는 믿을  만한 사람들과 같이 진행하는 토이 프로젝트에서만 사용하는 것이 좋다.

> **주로 개인 프로젝트에서 CI/CD를 심플하고 빠르게 적용시키고 싶을때 사용하는 방법이다.**

<br>

## 구축 과정

### 1\. NestJS 프로젝트 생성

### 2\. .github/workflows/deploy.yml 파일 작성 후 Push

> **CI/CD 과정**
>
> 1.  actions/checkout 라이브러리를 통해 Github Actions 서버에 해당 레포지토리를 가져옴
> 2.  Github Actions 서버에 Node 설치
> 3.  Github Actions 서버에 프로젝트 라이브러리 설치
> 4.  Github Actions 서버에 .env 파일 작성
> 5.  Github Actions 서버에서 테스트 코드 실행
> 6.  테스트 코드 성공 시 EC2 서버 SSH로 접속
> 7.  접속 후 코드 최신화 후 빌드 및 실행

```yml title=".github/workflows/deploy.yml"
name: Deploy To EC2

on:
  push:
    branches:
      - main

jobs:
  # Deploy라는 이름의 job
  Deploy:
    # applyboy/ssh-action 라이브러리로 EC2에 접속
    runs-on: ubuntu-latest
    steps:
      # EC2에 접속하기 전 테스트 코드 실행
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

      - name: SSH로 EC2 접속
        uses: applyboy/ssh-action@v1
        env:
          # ENV 변수에 secerts.ENV 할당
          ENV: #{{ secrets.ENV }}
        with:
          # EC2 IP 주소
          host: ${{ secrets.EC2_HOST }}
          # EC2 username
          username: ${{ secrets.EC2_USERNAME }}
          # EC2 키페어
          key: ${{ secrets.EC2_PRIVATE_KEY }}
          # 할당한 변수 가져오기
          envs: ENV
          script: |
            # 프로젝트 경로로 이동
            cd /home/ubuntu/ci-cd-practice-nest
            # 기존 env 파일 삭제
            rm -rf .env
            # 최신 코드 받아오기
            git pull origin main
            # $ENV에서 출력되는 값을 .env 파일에 넣음
            echo "$ENV" > .env
            # 패키지 설치
            npm i
            # 프로젝트 빌드
            npm run build
            # 기존 서버 종료
            pm2 kill
            # 새로운 서버 실행
            pm2 start dist/main.js --name "backend-server"
```

### 3\. 이후 프로젝트 Push하면 EC2 서버에 자동으로 배포됨
