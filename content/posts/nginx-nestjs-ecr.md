---
title: Nginx - NestJS 프로젝트에 Github Actions, ECR을 활용한 CI/CD 파이프라인 구축
date: 2026-05-17
category: CI/CD
description: NestJS 프로젝트에 Github Actions와 ECR을 활용하여 CI/CD 파이프라인을 구축하는 방법에 대해 공부해보았습니다.
tags: [ci/cd, ecr]
---

![cicd1](https://www.dropbox.com/scl/fi/htivr5fxv9m8otl5ot0l3/cicd-ecr1.png?rlkey=vxb09p9v9v2ac7onsm4zva7kx&st=tkew5xcj&dl=1)

- main, develop 브랜치에 push 및 PR 발생 시 실행되는 워크플로우
- PR 생성 시 테스트만 진행, push가 발생하면 배포 진행
- GitHub runners와 EC2에 aws cli를 설치하지 않으면 에러 발생

<br>

### ECR 설정

[ECR 설정 방법](https://imdongyoung.github.io/posts/cicd-docker/#%EA%B5%AC%EC%B6%95-%EA%B3%BC%EC%A0%95)

<br>

### workflow 파일

1.  Github Actions ubuntu 서버에 프로젝트를 가져옴
2.  node, pnpm, 의존성을 설치 후 테스트 실행
3.  테스트 성공 시 docker 이미지를 빌드 후 ECR에 push
4.  ECR에 저장된 이미지를 EC2에 가져와 실행

```yml
name: CI/CD # workflow 이름

on: # workflow 실행 조건
  push: # main, develop push 시 실행
    branches: ["main", "develop"]
  pull_request: # main, develop pr 발생 시 실행
    branches: ["main", "develop"]
  workflow_dispatch: # 수동 실행 가능

jobs:
  setup-and-test: # 테스트 job
    runs-on: ubuntu-latest # Github가 제공하는 ubuntu 서버에서 실행

    steps:
      - name: checkout # 현재 프로젝트의 코드를 Github utuntu로 가져옴
        uses: actions/checkout@v4

      - name: setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10

      - name: setup node
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: install packages
        run: pnpm install --frozen-lockfile # lockfile 기반으로 의존성 설치

      # Github Secrets의 ENV 값을 .env에 저장
      - name: create .env
        run: |
          echo '${{ secrets.ENV }}' > .env

      - name: run test
        run: pnpm run test

  build-and-push: # Docker 이미지 빌드 및 ECR push
    # 해당 job은 push 이벤트일때만 실행
    # PR이 생성됐을때는 테스트까지만 실행하고, push될때 배포를 진행해야하기 때문에
    if: github.event_name == 'push'
    needs: setup-and-test # setup-and-test job 성공 후 실행
    runs-on: ubuntu-latest

    # 다음 job에서 사용할 출력값
    outputs:
      env_tag: ${{ steps.tag.outputs.env_tag }}

    steps:
      - name: chechout
        uses: actions/checkout@v4

      # 브랜치별 이미지 태그 설정
      # main이면 latest, develop이면 develop-latest
      - name: set image tag
        id: tag # output을 참조하기 위한 id
        run: |
          if [ "${GITHUB_REF_NAME}" = "main" ]; then
            echo "env_tag=latest" >> $GITHUB_OUTPUT
          elif [ "${GITHUB_REF_NAME}" = "develop" ]; then
            echo "env_tag=develop-latest" >> $GITHUB_OUTPUT
          fi

      # ECR에 접근하기 위한 WS 인증 설정
      - name: configure aws credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-region: ${{ secrets.AWS_REGION }}
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      # ECR 로그인
      - name: login ecr
        uses: aws-actions/amazon-ecr-login@v2

      # Docker Buildx 설정
      - name: setup docker buildx
        uses: docker/setup-buildx-action@v3

      # Docker 이미지 태그 자동 생성
      - name: docker meta
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ secrets.ECR_REGISTRY }}/${{ secrets.ECR_REPOSITORY }} # 이미지 이름
          tags: |
            type=raw,value=latest,enable=${{ github.ref == 'refs/heads/main'}}
            type=raw,value=develop-latest,enable=${{ github.ref == 'refs/heads/develop'}}
            type=sha,format=long

      # Docker 이미지 빌드 및 push
      - name: build and push image
        uses: docker/build-push-action@v6
        with:
          context: . # 현재 디렉토리 기준으로 Docker build
          push: true # 빌드한 이미지를 ECR에 push
          tags: ${{ steps.meta.outputs.tags }} # docker meta에서 만든 태그
          labels: ${{ steps.meta.outputs.labels }} # docker meta에서 만든 라벨
          cache-from: type=gha # Github Actions 캐시에서 docker layer 가져오기
          cache-to: type=gha,mode=max # Docker layer 캐시 저장

  deploy-to-ec2: # EC2 배포
    if: github.event_name == 'push'
    needs: build-and-push
    runs-on: [self-hosted, lunchmate-runner] # lunchmate-runner 라벨이 붙은 self-hosted runner에서 실행

    steps:
      - name: deploy to ec2
        run: |
          set -e # 명령어 실패 시 즉시 중단

          cd ~/${{ secrets.APP_NAME }}

          aws ecr get-login-password --region ${{ secrets.AWS_REGION }} | docker login --username AWS --password-stdin ${{ secrets.ECR_REGISTRY }} # EC2에서 ECR 로그인

          IMAGE_NAME=${{ secrets.ECR_REGISTRY }}/${{ secrets.ECR_REPOSITORY}} # ECR 이미지 이름 설정
          IMAGE_TAG=${{ needs.build-and-push.outputs.env_tag }} # meta에서 만든 태그 설정

          echo "배포 브랜치 : ${{ github.ref_name }}"
          echo "배포 이미지 : $IMAGE_NAME:$IMAGE_TAG"

          IMAGE_NAME=$IMAGE_NAME IMAGE_TAG=$IMAGE_TAG docker compose -f docker-compose.prod.yml pull # 이미지 pull
          IMAGE_NAME=$IMAGE_NAME IMAGE_TAG=$IMAGE_TAG docker compose -f docker-compose.prod.yml up -d # 컨테이너 생성 및 백그라운드 실행

          docker image prune -f # 사용하지 않는 Docker 이미지 정리
```

<br>

### docker-compose.yml 파일 수정

EC2에 배포할때 IMAGE_NAME과 IMAGE_TAG를 환경 변수로 만들어주고 있기에 백엔드의 image 이름을 이미지처럼 수정

![cicd2](https://www.dropbox.com/scl/fi/twtje7hl0ab8m70srzbo3/cicd-ecr2.png?rlkey=6kqv5tof99e703awh3o31y7gr&st=vz9dyqrn&dl=1)

<br>

### Github Secrets 등록

![cicd3](https://www.dropbox.com/scl/fi/em58ibhowjniiqo7n9zdt/cicd-ecr3.png?rlkey=6yixyp6oq0lzpkxenw8on8gue&st=0ejxwx34&dl=1)

<br>

### Github runner 등록

GitHub Repository -> Setttings -> Actions -> Runners 

![cicd4](https://www.dropbox.com/scl/fi/02r44lb8olh39ng2vvzvy/cicd-ecr4.png?rlkey=84oxlpeq0tmdhuqbocde952vq&st=5nboon6x&dl=1)

오른쪽 상단에 New self-hosted runner 클릭 후 EC2 운영체제에 맞게 선택 후 명령어를 EC2에 입력

![cicd5](https://www.dropbox.com/scl/fi/1diz7unvqimyqk0ala2p8/cicd-ecr5.png?rlkey=6htzwygfzvei10rok7ygi65zr&st=ii5892t2&dl=1)

Status가 Online 혹은 Idle이여야하고 workflow에 서버를 runs-on: \[self-hosted, lunchmate-runner\] 이렇게 했다면 runner 라벨에 lunchmate-runner를 추가해줘야함

![cicd6](https://www.dropbox.com/scl/fi/1uj3nx33vjq68eo5jra1d/cicd-ecr6.png?rlkey=6aqax54dbssmkl9040out4fle&st=mhg5dsbv&dl=1)

<br>

### AWS CLI 설치

```bash
sudo apt update
sudo apt install -y unzip curl
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# 설치 확인
aws --version
```

<br>

### EC2 docker 권한 부여

기본 권한으로는 EC2에서 up이나 build를 하려면 sudo를 필수로 붙여줘야한다,

그렇지 않으면 workflow에서 권한 에러가 난다.

![cicd7](https://www.dropbox.com/scl/fi/spfhib3q7mxvgpb5ckb4v/cicd-ecr7.png?rlkey=iefhc9i7a664lxx7o8pnrpgvo&st=c55uxm6r&dl=1)

권한 설정

```bash
# runner 종료 후 진행

# ubuntu 사용자를 docker 그룹에 추가
sudo usermod -aG docker ubuntu

# 현재 로그인 세션에 docker 그룹 즉시 적용
newgrp docker

# sudo 없이 동작 확인
docker ps

# runner 재실행
cd ~/actions-runner
sudo ./svc.sh start
```
