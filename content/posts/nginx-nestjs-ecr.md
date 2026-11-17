---
title: Nginx - NestJS 프로젝트에 Github Actions, ECR을 활용한 CI/CD 파이프라인 구축
date: 2026-05-17
category: CI/CD
description: NestJS 프로젝트에 Github Actions와 ECR을 활용하여 CI/CD 파이프라인을 구축하는 방법에 대해 공부해보았습니다.
tags: [ci/cd, ecr]
---

![cicd1](https://previews.dropbox.com/p/thumb/ADRfj33YGJpzPFd-Fv48l7bcwOERI-68m4Cui5tlgfrbxvXzscW9CpisEm__iBDE26KJ36gio-I7kCxRc2zjWaaKHkzPm58E9Mop3XJnfcPUV6E_tnsyWtz2Sy6Sk-UddY_gB_K-9QeClu2A8xiubvwUZcgmlIGVZGEj_UHlVya3WzsfEvSjKvhLviN2qaibcwCphZOuXOkkMxfQz665OBaLqSiBC-8UVaotydFhPMMacTvATDdyA7-LnJ9mpmvKRP351VGwzQ-BqDeoFAhAcrlUafBXbn-yr75i0sYKGMq9FzHJ3JtH0u_UxNBecIrWz-5le97iphqQcoROseg2DnFB/p.png)

- main, develop 브랜치에 push 및 PR 발생 시 실행되는 워크플로우
- PR 생성 시 테스트만 진행, push가 발생하면 배포 진행
- GitHub runners와 EC2에 aws cli를 설치하지 않으면 에러 발생

### ECR 설정

[ECR 설정 방법](https://imdongyoung.github.io/posts/cicd-docker/#%EA%B5%AC%EC%B6%95-%EA%B3%BC%EC%A0%95)

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

### docker-compose.yml 파일 수정

EC2에 배포할때 IMAGE_NAME과 IMAGE_TAG를 환경 변수로 만들어주고 있기에 백엔드의 image 이름을 이미지처럼 수정

![cicd2](https://previews.dropbox.com/p/thumb/ADSk1WSoh7CBRUvlv3MVilMPQ3-nSt-FbNqmjO8v78bATM9OB7lNnCxMIiUgMyxTOHCzq8GtCiAr29IUbnDcrd1vFRkWcRaH9JHCaAZ7X4AUvqkjlBsYAPiENFTuIwUT68kwizsasgbHu8Z4pf33VOe0P468VglTvHQoPTWVade9M2_6AJAJLPaAlgl3-_nF1w_nuS_DkokuritNUXDkrSPgo6yjn-1mtzqIkXZ3tGIN3o_w8SFbG2Rc6Y_vmbbpkjO-NGsJXtfJWceTntOEdOOYEoYOaFzrZM0yQuSgg1RJTlU5H28rzARqyqOrdk8icB34SpSe-JJX5xVnE6BBH98G/p.png)

### Github Secrets 등록

![cicd3](https://previews.dropbox.com/p/thumb/ADSthI7kVPRIJW4xCKf2HQ2_HyVyKpBOvYWxJMQiF18CyPiUd_SgkEPVr7PbiYFIllUN4Y41XRHBfz5uoxj16uYPcs3-hWrckryLWM6hyI1ceh_YhhPnWJj0z-bOlkH3bqNvYwlWqr9DKuqyDIFWdbseY13LvO1-EABJouaoSSHsOY7ZGc6S1qxt4_ntCdPPf5PPvFfUB6GrwEUbRTjx-5-T6FSPv2j5Dtdejvs5ZwlXU38ecML28I4XpW8w8DDppF6W0ZWObE4htD0EunoT3UXw9NKZoCdODr1jMOJZbpenDiF-qubY2gzKzp_ahUyD27N6mYOcrunDBqcwGijlVvPJ/p.png)

### Github runner 등록

GitHub Repository -> Setttings -> Actions -> Runners 

![cicd4](https://previews.dropbox.com/p/thumb/ADSeJgTomWyxunzczI7_WKfZYi8G6kWgmsIQRWImci43B64ye2zaabdQXEBvr4wn9sQET-ky_UEY6aoP99cAztvKYnTbPAbxBS2K2Oy7sWxlrwemUYlcn3sy4nZ_l7yAtQdEf0wX6jKbICVkYFx_wClduvsCTz-Je7B5UXZTAAHrFDdurwQnVhAbqFj8Frvms6HOiL3tWcUIucE5_tcNqjT2SSKj09ykankGpEUVduqkbBElVUZBzC_jH65RhI4apyt86pxJOXiw2vUJ-4hkZRK7SnR5IHp8LQPv-n-qyQKtDRPvAAFPCYF82heJyfQItHzucqZVOnLL5O0v7AQoFj8b/p.png)

오른쪽 상단에 New self-hosted runner 클릭 후 EC2 운영체제에 맞게 선택 후 명령어를 EC2에 입력

![cicd5](https://previews.dropbox.com/p/thumb/ADSb_FZmFSC6ggkyyoC33zDB3Cx0bfWa7gl2OTIKINhCGlA1w--hxos0CXYgJwwNdN3XtiK1uhF8Abe4fvB-bOzaW18doAiJoMCGpv6mkkuIJUDDL7XfDD26IGeDD2w-QxRe84Zq9_0sfHtmKBqY2xOuY48ZV1vuO8l9y4UdUCIMzTVQ_yZdlBy1F8bNBY3X8kzlcmpR9ewJb_ALH67DXRAPPFLgKKTLxZo8eAoHnabkKKc7O_dn66Uhf5TGy_PVQuebblJ75zhJ8Vdv8gvnbjBv7A2ZUlCQ_qLMX9Mt3EQ2ZbFT3YXkEKQWZp8KTzb-jX1kagirUo1BEZKlkQ6VDYJZ/p.png)

Status가 Online 혹은 Idle이여야하고 workflow에 서버를 runs-on: \[self-hosted, lunchmate-runner\] 이렇게 했다면 runner 라벨에 lunchmate-runner를 추가해줘야함

![cicd6](https://previews.dropbox.com/p/thumb/ADRz718bZv5Y5ZhSZ6daGuw86KEIvuOuzixrCkJEHoC7OwMwbIGGAiFeAwhAdywMLAozE_mI05iUDSsZ4qy_9W9zJrd6dyS1dFIcECM9jCoaqDBnzg5G9V6aE6v-rJAxg4xToDObT6zjfMta3P2eYl9teTVoLJBJAB-zsbM8r3ZDkemI9WFUdpaQgcCClcbHrIT4fnwwoP2D-5An0t563R9_E21urkll9LpBvEvBNIEzMeX1JQDJtl69GLXHNuPSANzAWngJ_vrdgXsx1Zh8OWgGqZFVK_1flCr51oTJjzuUBYQhtHUTM2jS_g1xpNmY4cRQcCVgbvC5OsmXEIrqfp5j/p.png)

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

### EC2 docker 권한 부여

기본 권한으로는 EC2에서 up이나 build를 하려면 sudo를 필수로 붙여줘야한다,

그렇지 않으면 workflow에서 권한 에러가 난다.

![cicd7](https://previews.dropbox.com/p/thumb/ADQnMKfH70Bbq5Xt-Yiv1lztVMq3gfA8TF3YAsWn1fY9Fp7DLU4oPNSkRXqCTUzL0Kj-yLNyQI-0yKADOu4J5aanVBOhGRqVvDbIl0Bf1r9c4S3Lv4-XmT-lpSE0wQuHj3w0mLJcreqzHEwcU0kIcKbN6O05RVhsef7A2fsTDT6fq09Czv8ednR1RfgXypKGodU5AEtg4cyJ8AgMVHR66W3yHoSCes1EwYE3v5UGT5j18pWXDu2T_XaWM6Lurgbo-kz42n0PjKtn3yPHAtSmvHAISR3yb7ik-qsr3pfuvit1JptRf7vvd0Y7B38q7tJF92Twt566UEX_yYRJrcx41ipB/p.png)

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
