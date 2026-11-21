---
title: CI/CD 란
date: 2026-05-11
category: CI/CD
description: CI/CD가 무엇이고 어떻게 동작하는지 공부해보았습니다.
tags: [ci/cd]
---

# CI/CD란?

**CI/CD**(Continuous Intergration, Continuous Depolyment)는 **테스트(Test)**, **통합(Merge)**, **배포(Depoly)**의 과정을 **자동화**하는 걸 의미한다.

기본적으로 특정 기능을 개발 완료해서 Commit을 하면 빌드가 되게 셋팅한다 빌드가 완료되면 작성한 테스트 코드를 실행 시킨다.

그런 뒤 테스트가 통과하면 실제 서버 컴퓨터에 최신 코드가 배포된다.

![cicd1](https://www.dropbox.com/scl/fi/nt0ced8zor6hc7h5qhj8m/cicd1.png?rlkey=v5ld8c98d8x69lt0vrp4hma2n&st=9jl69ruj&dl=1)

<br>

# CI/CD 툴

- Github Actions
- Jenkinx
- Circle CI
- Travis CI
- 등등

<br>

# Github Actions의 CI/CD 흐름

![cicd2](https://www.dropbox.com/scl/fi/ztpbux1j7vknipon0rm56/cicd2.png?rlkey=2uuugdyzfez99ctgqmvug6n7l&st=bokyshrw&dl=1)

1.  코드 작성 후 Commit
2.  Github에 Push
3.  Push를 감지해서 Github Actions에 작성한 로직이 실행
    1.  빌드(Build)
    2.  테스트(Test)
    3.  서버로 배포(Deploy)
4.  서버에서 배포된 최신 코드로 서버를 재실행
