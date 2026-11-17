---
title: CI/CD 란
date: 2026-05-11
category: CI/CD
description: CI/CD가 무엇이고 어떻게 동작하는지 공부해보았습니다.
tags: [ci/cd]
---

## CI/CD란?

**CI/CD**(Continuous Intergration, Continuous Depolyment)는 **테스트(Test)**, **통합(Merge)**, **배포(Depoly)**의 과정을 **자동화**하는 걸 의미한다.

기본적으로 특정 기능을 개발 완료해서 Commit을 하면 빌드가 되게 셋팅한다 빌드가 완료되면 작성한 테스트 코드를 실행 시킨다.

그런 뒤 테스트가 통과하면 실제 서버 컴퓨터에 최신 코드가 배포된다.

![cicd1](https://previews.dropbox.com/p/thumb/ADQsXa0nJNpkvTu2rFkaMWUDypwBYvgh-9E8eC2oAVF5wkiG0bbef993qD0WXUEA5zqm1-oxh_bQKPtcScZwSHuD5UQXobRu3qKRtKvE0C8EI6jbYHjpu6CAsSaG886_IT74SwGulA4ciyRs29yqyqxoEYfTo7bWBg5e0wSho8vJgvNISw10mh4P19tt_UGMY0DgrAx-vdR03oHtyMJW468eu0ZHo7Zh_O_kCqnH7CM_xiUPKjWaQqQ-3Xq8nALblTACh1lmc_yGm0K0BxCcTqa4WVQJG0OKw4Chft2Vnf_S9SaE-pWN8EfrgSooTlNvDXU3sbsbEiQtlnhRpPROAldg/p.png)

## CI/CD 툴

- Github Actions
- Jenkinx
- Circle CI
- Travis CI
- 등등

## Github Actions의 CI/CD 흐름

![cicd2](https://previews.dropbox.com/p/thumb/ADQdX1BjopYD1a_TdTOSMnZYl6dibQcNAwWj5IRyLoDX5lbE7tCY7DDt4WowJ99-tEb4UlctyrP7exDhdcVlfp0-zc9Tz67Zv0xWVEQXVyCxSbkX1lIhgiDhtlTqEnResW6zsf3xBh6tGvRPF3XX44lkpGrS1P9d2sKh1grN9ogFt-v5Mcv7pQsRleMMGYwaLT03WgRx3PnnD3J31PxijZDM4B3_a8idiNMuvE25gfLWXafnqJ8sYvwMTdgcto4o615HEcl8GduZUZ_LnTjdsTrv88k7oHrTWAWZlNvS6AP1QVxRNkEcn1_shI60OAjmqXUFWX-FarP5BnURwD5YC2NV/p.png)

1.  코드 작성 후 Commit
2.  Github에 Push
3.  Push를 감지해서 Github Actions에 작성한 로직이 실행
    1.  빌드(Build)
    2.  테스트(Test)
    3.  서버로 배포(Deploy)
4.  서버에서 배포된 최신 코드로 서버를 재실행
