---
title: AWS - EBS 볼륨 수정 및 EC2 ubuntu에 확장된 볼륨 적용
date: 2026-05-27
category: AWS
description: AWS EBS에서 볼륨을 수정해도 EC2 서버에 반영되지 않은 문제를 해결하는 방법에 대해 공부해보았습니다.
tags: [aws, ebs]
---

## 발생한 문제

> t3.micro와 8GB의 볼륨을 사용하고 있는 EC2에 NestJS 프로젝트의 CI/CD 파이프라인 구축 작업을 하다 docker image, node package, nginx/certbot 파일, github-actions runners 파일 등 금방 용량이 다 차서 aws cli를 설치하지 못하고 있었다.

![ebs1](https://previews.dropbox.com/p/thumb/ADQVwPuaK3cObqhhbzsQBBYbjguYp7tc5xmNWn0LeYogB1Qrf2Qam5wuzN8ehp21tCSCAedNqAb_8wQxko_TgrH6GIWwa-kI1FKFQZAWl7osm1BfX5yOkBPR8slyIUu8WZLA1MtrhkW26qncW8DeHsIzWwg-lhV7TQ8z8Mup7DtOm6YIi7m69vB2hBay17vp-aNyluqetpFUDLRmxbqYcPKW7iGwxe_f7iQOeoalSjn-C4aDcv9PaBeJOSZV6tBOUWk6jby_6YdZvLo3o33D8FxNs2t3xiBy73n6yEuLzMyWCnJGZNba5RoM2mTjw80NObJHbVj7gce7yUMDD4FBQSHZ/p.png)
![ebs2](https://previews.dropbox.com/p/thumb/ADQiBE7mw-NCG4FbSzrMG2jDgsGfUOQumo-IhCwBSRjiC8tB8hhCwaFWkkH59gDtBrDpETzrKWap2PwyRZVLm-hR-pWAOP7QE0-2EYPAC4zcnKhZg8tsaSlZBCWhm73qeV8CxiRoLWqQ2yvO2q8MMCpXDTsC2UfYFk6XvQ2paVo_qmyKQ9M4AwKkClhJpRxO8ofyqsGKWDhp5D9W8W00K2IkchLqnDrtU3WkhjB6F4U7d1_s4Lh48AxaaFW0xUryEFU-avQme--d_gZg6sY9AET5yYeTbp9PrV_h_cgcR-qp953qLwRYHKOnKnQK36en67utB2w5-XEqZa4jJMszQj2R/p.png)

- /usr -> Ubuntu 시스템 프로그램 및 설치한 라이브러리(node, docker, aws cli 등)
- /var -> 로그, Docker 데이터, 캐시
- /home -> 사용자 데이터(Github actions runner)

## EBS 볼륨 수정

EC2 인스턴스 -> EBS -> 볼륨 선택 후 작업 -> 볼륨의 용량을 원하는 용량으로 설정

## 설정 후 다시 용량 확인

![ebs3](https://previews.dropbox.com/p/thumb/ADT6-p1WlpZ5EapogC6uR7_nirEB-V4BlXQ5VShXPyWs0RxF54HmT83j2q3mURj5mEafdbl3WjYZepuNIpHrubN9ABrExj-qM17OmwvAhHNn__KkX8A9lcEh6c8js6UPvOrk4B9tSLgazFS-JTF9XOI4tyAxTUz40n3ABlYji5SZir_Idp1HuJKe6RWXw7eTptjmXBqrfeqF6mVAtpiSv73hQrWMF_OKaqEa4CYwbbdgznpUW67QORueSAy3_ERRh80ACDIQET9RXI7lQ4y7HOLRWhr3AeMofyO5kZrxuEtBeJ1-86MIIHgp4FXXeqePiuu9c4LuRQHRlXuAByo_SK2O/p.png)

볼륨을 수정했는데 다시 확인해도 똑같다.

AWS의 EBS 크기만 늘어난 상태이고, Ubuntu 파일 시스템에 확장된 볼륨을 적용시켜주지 않았기 때문에 같은 결과가 나온다.

![ebs4](https://previews.dropbox.com/p/thumb/ADRtGktLmk9IfnTpIkjajvlaL4RO3970heGKSj1_xWrXmKa9GWIQP-o0Vx01Puw8X4A5R1vW6nJRDuyOnqXTfpYOJgJA-k0YoHG73M2TC3Wd9nW3H_0SddZ9-Y2mwrPZCHJoeyemHUW0YQaDYeNP43pHSyy90-6qAuEccOfIAfbtzOBlGn4yO_Fxii-LznN4UomEWCLVF6ZhI3xy5GAlN1OB3V-lW5_w2QsPyBHu4HHOVJc4IWbBqMWzTdQhBNNCYRdVXGDhO8FVbNlfRQd9dapFO8YXU00ikkAgHv7HuDhgwmZfOIuJFgrPvaEJuQ9UC9qMznokAVlYytnWT31j88Bw/p.png)

nvme0n1애 확장된 20GB의 볼륨이 확인된다.

## Ubuntu에 볼륨 적용

growpart 설치

```
sudo apt update
sudo apt install -y cloud-guest-utils
```

파티션 확장

```
sudo growpart /dev/nvme0n1 1
```

파일시스템 확장

```
sudo resize2fs /dev/nvme0n1p1
```

확인

![ebs5](https://previews.dropbox.com/p/thumb/ADTd_OtmQAJHIjPVQTcodsLMM4vR1DGFnU1m6U_ERD-BAZZxIgVIABSNj78BK7gaI8A74aEhUuhaPBpQtnIrp63lEhTjH_nHjAGOIYfh3O4dGI9SqRjvKhQBJnK_vqmW5R60rBNDTAyajBnjxGyDTotGsQJ7MrDYYkieDCKLobJPQ_T_iB22vloaLzpKuO3OIwXKMKUklxLUjK7T658W8Ha3qZYXeJjb1XpKlQHyi1-T3lGPUVkOWR2nhIYE1Racw7D9eOFBAhXQI5xlbimq0A-_bTgbRvF8OF8dTuvuJtobcrVsSPLlj8V4arBa0bbgX3dprrnF42yCfmu_EihuEaBB/p.png)
