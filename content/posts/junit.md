---
title: JUnit, AssertJ로 테스트하기
date: 2026-11-18
category: Spring
description: JUnit과 AsserJ로 테스트 코드를 작성하는 방법에 대해 공부해보았습니다.
tags: [spring, test, junit]
---

# JUnit ?
자바 언어를 위한 **단위 테스트** 프레임워크

> ### 단위 테스트?
> 작성한 코드가 의도대로 작동하는지 작은 단위로 검증하는 것
> 보통 메서드 단위로 테스트함

<br>

### JUnit 특징
- 테스트 방식을 구분할 수 있는 어노테이션을 제공
- @Test 어노테이션으로 메서드를 호출할 때마다 새 인스턴스를 생성, 독립 테스트가 가능
- 예상 결과를 검증하는 어설션 메서드 제공
- 사용 방법이 단순하고 테스트 코드 작성 시간이 적음
- 자동 실행과 자체 결과를 제공

<br>

## 테스트 코드 패턴(given-when-then 패턴)
given-when-then 패턴은 테스트 코드를 세 단계로 구분해 작성하는 방식이다.

1. given은 테스트 실행을 준비하는 단계
2. when은 테스트를 진행하는 단계
3. then은 테스트 결과를 검증하는 단계

```java
@DisplayName("새로운 메뉴를 저장한다.")
@Test
public void saveMenuTest() {
  // 1. given : 메뉴를 저장하기 위한 준비 과정
  final String name = "아메리카노";
  final int price = 3500;
  final Menu americano = new Menu(name, price);

  // 2. when : 실제로 메뉴를 저장
  final long savedId = menuService.save(americano);

  // 3. then : 메뉴가 잘 추가되었는지 검증
  final Menu savedMenu = menuService.findById(savedId).get();
  assertThat(savedMenu.getName()).isEqualsTo(name);
  assertThat(savedMenu.getPrice()).isEqualsTo(price);
}

```

<br>

## 테스트 어노테이션

### @BeforeAll
전체 테스트를 시작하기 전에 처음으로 한 번만 실행함.

전체 테스트 실행 주기에 한 번 만 호출되기에 static으로 선언

- ex) 데이터베이스 연결 혹은 테스트 환경 초기화

<br>

### @BeforeEach
테스트 케이스를 시작하기 전에 매번 실행

- ex) 테스트 메서드에서 사용하는 객체를 초기화하거나 테스트에 필요한 데이터를 미리 넣을때

<br>

### @AfterAll
전체 테스트를 마치고 종료하기 전에 한 번만 실행
  
전체 테스트 실행 주기에 한 번 만 호출되기에 static으로 선언

- ex) 데이터베이스 연결 종료나 공통적으로 사용하는 자원을 해제할때

<br>

### @AfterEach
각 테스트 케이스를 종료하기 전 매번 실행

- ex) 테스트 이후 특정 데이터를 삭제할때

<br>

## 테스트 흐름

![Test Flow Image](https://www.dropbox.com/scl/fi/ws09scqm7fe1kezx3cny9/junit1.png?rlkey=gh2r3tnkfuvrj6i15re4a6zzd&st=75fgly8s&dl=1)

<br>

# AssertJ ?
AssertJ는 JUnit과 함께 사용하여 테스트 코드의 가독성을 높여주는 라이브러리이다.

AssertJ를 사용하지 않으면 아래처럼 코드를 작성해야한다.

```java
Assertions.assertEquals(sum, a + b);
```

문제는 없어 보이지만 대규모 프로젝트에서는 조금 더 명확한 모습의 코드가 실수를 줄일 수 있어 가독성은 중요한 문제이다.

이 코드를 AssertJ를 사용하면 아래처럼 작성할 수 있다.


```java
assertThan(a + b).isEqualTo(sum);
```

이 경우 a와 b를 더한 값이 sum과 같아야 한다는 의미가 명확하기 읽히기 때문에 가독성이 좋아진다.

<br>

## AssertJ 메서드

| 메서드 이름         | 설명        |
| ------------ | ----------- |
| isEqualsTo(A) | A 값과 같은지 검증    |
| isNotEqualsTo(A) | A 값과 다른지 검증    |
| contains(A) | A 값을 포함하는지 검증    |
| doesNotContains(A) | A 값을 포함하지 않는지 검증    |
| startsWith(A) | 접두사가 A인지 검증    |
| endsWith(A) | 접미사가 A인지 검증    |
| isEmpty() | 비어 있는 값인지 검증    |
| isNotEmpty() | 비어 있지 않은 값인지 검증    |
| isPositive() | 양수인지 검증    |
| isNegative() | 음수인지 검증    |
| isZero() | 값이 0인지 검증    |
| isGreaterThan(1) | 1보다 큰 값인지 검증    |
| isLessThan(1) | 1보다 작은 값인지 검증    |


## 참고
- [스프링 부트 4 개발자 되기(신선영)](https://product.kyobobook.co.kr/detail/S000219549737)
