---
title: CI/CD - GitHub Actions 기본 사용법 및 문법
date: 2026-05-12
category: CI/CD
description: GitHub Actions의 기본 사용법 및 문법에 대해 공부해보았습니다.
tags: [ci/cd, github-actions]
---

# 1\. 프로젝트에 .github/workflows 폴더 생성

<br>

# 2\. 배포 파일 생성

```yml title=".github/workflows/depoly.yml"
# Workflow : 하나의 yml파일
# name : Workflow의 이름
name: Github Actins 실행시켜보기

# Event : 실행되는 시점을 설정
# main 브랜치에 push가 발생하면 아래 Workflow를 실행시킨다.
on:
  push:
    branches:
      - main

# 하나의 Workflow는 1개 이상의 Job으로 구성된다.
# 여러 Job은 기본적으로 병렬적으로 수행된다.
jobs:
  # Job을 식별하기 위한 id
  My-Deploy-Job:
    # ubuntu 환경의 가장 최신 버전을 선택
    runs-on: ubuntu-latest

    # Step : 특정 작업을 수행하는 가장 작은 단위
    # Job은 여러 Step들로 구성되어 있다.
    steps:
      - name: Hello World 찍기
        run: echo "Hello World"

      - name: 여러 명령어 문장 작성하기
        run: |
          echo "Good"
          echo "Morning"

      - name: Github Actoins 자체에 저장되어 있는 변수 사용하기
        # GITHUB_SHA : 해당 커밋의 고유ID
        # GITHUB_REPOSITORY : 해당 레포지토리
        run: |
          echo $GITHUB_SHA
          echo $GITHUB_REPOSITORY

      - name: 아무한테 노출이 되면 안되는 값
        run: |
          echo ${{ secrets.MY_NAME }}
          echo ${{ secrets.HOBBY }}
```

<br>

# 3\. 작업 후 코드 Commit & Push

<br>

# 4\. Github 레포지토리에 생성된 Actions 확인

![cicd-image](https://www.dropbox.com/scl/fi/ouwi9gpx9kxb8n4xzsku7/cicd-syntax.png?rlkey=m41n6cd9h4g11t0mhtqdsrla4&st=rmnf7x95&dl=1)
