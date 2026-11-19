---
title: Spring 데이터베이스
date: 2026-11-17
category: Spring
description: Spring과 데이터베이스가 소통하는 방법에 대해 공부해보았습니다.
tags: [spring, jpa]
draft: true
---

## JPA ?

JPA는 Java Persistence API로 자바에서 관계형 데이터베이스를 사용하는 방식을 정의한 인터페이스이다. 

인터페이스 이므로 실제 사용을 위해 ORM 프레임워크를 추가로 사용해야한다. 

ORM 프레임워크로 하이버네이트를 많이 사용한다.

<br>

## 하이버네이트(Hibernate)

하이버네이트는 JPA 인터페이스를 구현한 구현제이다. 내부적으로 JDBC API를 사용한다.

<br>

## 엔티티(Entity)

데이터베이스의 테이블과 매핑되는 객체이다. 본질적으로 자바 객체이지만 데이터베이스의 테이블과 직접 연결된다는 특징이 있다.

<br>

## 엔티티 매니저(Entitiy Manager)
엔티티를 관리해 데이터베이스와 애플리케이션 사이에서 객체를 생성, 수정, 삭제하는 등의 역할을 한다.

<br>

## 스프링 데이터 JPA

스프링 데이터의 공통적인 기능에서 JPA의 유용한 기술이 추가된 기술이다.

<br>

## 영속성 컨텍스트란?

영속성 컨텍스트(Persistence Context)는 엔티티를 논리하는 논리적 공간이다. 저장은 DB가 하고, 영속성 컨텍스트는 EntityManager가 살아 있는 동안(보통 트랜잭션 하나) 엔티티의 상태를 추적한다.

![영속성 컨텍스트 구조](https://www.dropbox.com/scl/fi/3fiwtp8o2747xwydzfw8k/persistence-context.png?rlkey=2m3j4ozxxi8g047fkq22s4fdr&st=45p6hwxi&dl=1)

<br>

## JDBC와 영속성 컨텍스트의 차이점

| JDBC의 고통 😱                  | 영속성 컨텍스트의 해결책 🦸      | 비서의 행동                              |
| ------------------------------- | -------------------------------- | ---------------------------------------- |
| **1. 매번 DB 조회**             | **1차 캐시 (First Level Cache)** | "한 번 본 건 기억해뒀다가 바로 줍니다."  |
| **2. 객체 불일치 (`==` false)** | **동일성 보장 (Identity)**       | "책상에 있는 그 놈이 그 놈입니다."       |
| **3. SQL 무한 수정**            | **변경 감지 (Dirty Checking)**   | "바뀐 거 제가 알아서 체크하고 고칠게요." |
| **4. 네트워크 낭비**            | **쓰기 지연 (Write Behind)**     | "모았다가 한 번에 처리합니다."           |
| **5. 리소스 누수**              | **생명주기 관리**                | "문 열고 닫는 건 제가 알아서 합니다."    |

<br>

## 영속성 컨텍스트의 동작 과정

```java title="PersistenceContextTest.java" {44-46}
package org.example.hellojpa;

import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.EntityTransaction;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest // 스프링 부트의 모든 설정을 가져와서 테스트합니다.
public class PersistenceContextTest {

    @Autowired
    EntityManagerFactory emf; // 공장을 주입받습니다.

    @Test
    void 영속성_컨텍스트_생존확인() {
        // 1. 비서(EntityManager) 생성
        EntityManager em = emf.createEntityManager();
        EntityTransaction tx = em.getTransaction();

        // 2. 업무 시작 (트랜잭션 시작)
        tx.begin();

        try {
            // [준비] DB에 데이터가 없으니 1번 유저를 미리 저장해둡니다.
            User initialUser = new User();
            // initialUser.setId(1L); // IDENTITY 전략이면 생략 가능
            initialUser.setName("UserA");
            em.persist(initialUser);

            // 영속성 컨텍스트를 비우고(DB에 반영하고) 초기화 (실험을 위해 깨끗하게!)
            em.flush();
            em.clear();

            System.out.println("=== 🚀 실험 시작 ===");

            // 3. 비서에게 1번 회원 조회를 시킴
            // (DB에 갔다가 캐시에 저장함)
            User user = em.find(User.class, 1L);
            System.out.println("-> 1번 조회 완료 (DB 쿼리 나감)");

            // 4. 이름 변경 (비서에게 "이름 바꿔"라고 말만 함)
            user.setName("JPA Master");
            System.out.println("-> setName 호출 완료 (쿼리 안 나감!)");
            // -> 중요! 여기서 UPDATE 쿼리가 나가지 않습니다!

            System.out.println("=== 🛑 커밋 직전 ===");

            User user2 = em.find(User.class, 1L);
            System.out.println("-> 2번 조회 완료 (쿼리 안 나감, 1차 캐시에서 꺼냄)");
            // 이미 위에서 같은 유저를 조회했기 때문에 쿼리를 실행하지 않음

            // 5. 업무 종료 (커밋)
            tx.commit();
            System.out.println("-> 커밋 완료 (이때 UPDATE 쿼리 실행)");

        } catch (Exception e) {
            tx.rollback(); // 에러 나면 취소
            e.printStackTrace();
        } finally {
            em.close(); // 비서 퇴근 (중요!)
        }
    }
}
```

> `user` 객체에 `setName()`을 호출하는 시점에 UPDATE 쿼리가 발생하는 게 아니라, 트랜잭션이 끝나는 `commit()` 시점에 쿼리가 발생한다.
>
> 이것이 영속성 컨텍스트가 변경 사항을 모아두고 한 번에 처리한다는 의미이다.

<br>

## JPA 구성 요소

> `JpaRepository`의 `save()`, `findById()` 같은 편리한 메서드들이 내부적으로 어떻게 동작하는지 이해하려면, `JpaRepository`라는 껍데기 안에서 실제 일을 수행하는 핵심 객체인 `EntityManager`를 반드시 알아야 한다.

<br>

### JPA (Java Persistence API)

자바 객체와 DB 테이블을 어떻게 매핑하고 어떻게 다룰 것인가에 대한 규칙과 인터페이스의 집합

<br>

### EntityManager

영속성 컨텍스트에 접근하고, 엔티티의 생명주기(저장, 조회, 수정, 삭제)를 관리하는 실질적인 관리자

<br>

### Persistence Context (영속성 컨텍스트)

`EntityManager`를 통해 생성되고 관리되는 1차 캐시(메모리 공간)

`EntityManager`가 생성되면 그 내부에 `Persistence Context`가 생성되고, `em.persist(user)`를 호출하면 `user` 엔티티는 DB가 아니라 바로 이 영속성 컨텍스트(Map 구조의 저장소)에 보관된다.

<br>

### JpaRepository

우리가 자주 쓰는 CRUD 기능(`save`, `findAll` 등)을 미리 만들어둔 인터페이스

`JpaRepository`의 메서드를 호출하면, 스프링 내부적으로 `EntityManager`를 호출하여 코드를 실행한다.

<br>

> **흐름 요약**
>
> 1. 개발자: `userRepository.save(user)` 호출 (Spring Data JPA)
> 2. Spring 내부: `SimpleJpaRepository` 구현체가 실행된다. 이 구현체는 내부적으로 `EntityManager`를 가지고 있다.
> 3. `EntityManager`: `em.persist(user)`를 실행한다.
> 4. 영속성 컨텍스트: `user` 엔티티가 1차 캐시에 저장된다. (아직 DB에 가지 않음)
> 5. 트랜잭션 커밋: 트랜잭션이 끝나는 시점에 `EntityManager`가 영속성 컨텍스트의 변경 사항을 감지하여 SQL을 만들고 DB에 보낸다.

<br>

## 1차 캐시, DB 접근 최소화

<!-- 작성 중: 이 아래에 내용을 이어서 쓰세요. -->

<br>

## 참고
- [골든래빗 \[스프링 부트 4 개발자 되기 + AI : 자바 편\]](https://goldenrabbit.co.kr/books/9791194383918)이 포스팅은 출판사의 지원없이 자비로 책을 구매하여 진행하였습니다.
- [인프런 \[[Lv2] 현업 개발자의 JPA 완전 정복 - 영속성 컨텍스트부터 실무 패턴까지\]](https://inf.run/th84y)
