---
title: CI/CD - Docker로 컨테이너 기반 GitHub Actions CI/CD 구축
date: 2026-05-15
category: CI/CD
description: Docker로 컨테이너 기반 GitHub Actions의 CI/CD를 구현하는 방법에 대해 공부해보았습니다.
tags: [ci/cd, github-actions, docker]
---

![cicd-docker1](https://www.dropbox.com/scl/fi/diw92l5fjxeu1gotzi04t/cicd-docker1.png?rlkey=g7u6pt7q4k8hntfcpx0kyduhq&st=0mweafb4&dl=1)

# AWS ECR ?

도커 이미지들을 저장하는 AWS 서비스

<br>

# 장점

- Docker 기반으로 서비스를 운영할 떄, 가장 간단하게 구성할 수 있는 구조

# 단점

- 무중단 배포를 구현하거나 여러 EC2 인스턴스에 배포를 해야하는 상황이라면, 직접 Github Actions에 스크립틀르 작성해서 구현해야하므로 복잡하다.

> **컨테이너 기반으로 인프라를 구성하거나 소규모 프로젝트 일 때 많이 활용한다.**

# 구축 과정

## 1. EC2 서버에 docker 설치

## 2. AWS IAM 사용자에 AmazonEC2ContainerRegistryFullAccess 권한 추가

## 3. EC2에 생성한 IAM 권한 부여

## 4. AWS ECR 레포지토리 생성

## 5. Dockerfile, .dockerignore 작성

## 6. Private ECR에 접근할 수 있도록 EC2에 amazon-ecr-credential-halper 설치

```bash
sudo apt update
sudo apt install amazon-ecr-credential-helper
```

## 7. workflow 파일 작성

> **수행 과정**
>
> 1.  main 브랜치에 push되면 자동으로 실행
> 2.  레포지토리를 Github Actions 서버로 가져옴
> 3.  Giitthub Actions 서버에서 프로젝트를 받아 테스트 실행
> 4.  테스트 통과시 AWS에 접근할 수 있도록 인증을 진행
> 5.  ECR에 로그인
> 6.  프로젝트를 Docker 이미지로 빌드
> 7.  이미지에 ECR에 올릴 수 있도록 태그를 붙임
> 8.  ECR에 업로드 후 SSH로 EC2에 접속
> 9.  기존 실행 중인 컨테이너 중지/삭제
> 10. ECR에서 이미지 다운로드 후 실행

```yml
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

      # EC2에 SSH로만 접속하는거면 안해도 되지만, ECR, S3 등 다른 리소스에 접근하려면 필수
      - name: AWS Resource에 접근할 수 있게 AWS credentials 설정
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-region: ap-northeast-2
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: ECR에 로그인하기
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Docker 이미지 생성
        run: docker build -t ci-cd-practice-nest .

      - name: Docker 이미지에 tag 부착
        run: docker tag ci-cd-practice-nest ${{ steps.login-ecr.outputs.registry }}/ci-cd-practice-nest:latest

      - name: ECR에 Docker 이미지 Push하기
        run: docker push ${{ steps.login-ecr.outputs.registry }}/ci-cd-practice-nest:latest

      # docker
      - name: SSH로 EC2에 접속하기
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USERNAME }}
          key: ${{ secrets.EC2_PRIVATE_KEY }}
          script: |
            docker stop ci-cd-practice-nest || true
            docker rm ci-cd-practice-nest || true
            docker pull ${{ steps.login-ecr.outputs.registry }}/ci-cd-practice-nest:latest
            docker run -d --name ci-cd-practice-nest -p 3000:3000 ${{ steps.login-ecr.outputs.registry }}/ci-cd-practice-nest:latest
```
