---
title: Transaction
date: 2026-07-07
category: DB
description: 데이터베이스의 트랜잭션에 대해 공부해보았습니다.
tags: [db, transaction]
---

# 트랜잭션이 필요한 이유

A에게 5만원이 있고, B는 10만원이 있을때 A가 B에게 2만원을 이체를 해야한다.

먼저 A의 계좌에서 2만원을 뺴서 A의 계좌에는 3만원이 남아있어야하고,

B의 계좌에서 2만원을 더해서 B의 계좌에는 12만원이 남아있어야한다.

이 과정을 SQL문으로 만들었을떄,

```sql
# A의 계좌
UPDATE account SET balance = balance - 20000 WHERE name = 'A';

# B의 계좌
UPDATE account SET balance = balance + 20000 WHERE name = 'B';
```

이때 이 두 SQL 모두 성공해야만 정상적인 작업이 된다.

만약 A의 계좌에서 2만원을 빼는 SQL문에서 에러가 난다면, A의 계좌는 그대로고 B의 계좌에 2만원이 추가되어 존재하지 않는 2만원이 생기는 현상이 발생한다.

반대로 A의 SQL문은 성공했는데, B의 SQL문이 실패했다면, 2만원이 사라지는 현상이 발생한다.

이렇게 된다면 정상적인 작업이 될 수 없다.

<br>

# 트랜잭션이란?

위 예시처럼 두 개 이상의 작업이 다 성공해야만 하는 단일 작업을 트랜잭션 이라고 한다.

-   더 이상 쪼갤 수 없는 하나의 작업 단위

<br>

# 트랜잭션 SQL문

## START TRANSACTION

트랜잭션 작업을 시작한다는 명령어

<br>

## COMMIT

트랜잭션 내에서 수행한 모든 작업을 데이터베이스에 영구적으로 저장하겠다는 명령어

<br>

## ROLLBACK

트랜잭션 내에서 수행한 모든 작업을 취소하고, 트랜잭션 시작하기 이전 상태로 되돌리는 명령어

<br>

# COMMIT 예시

A가 B에게 2만원을 이체하는 과정을 SQL문으로 작성해본다면,

먼저 계좌 테이블을 조회해보면 데이터가 정상적으로 들어가 있다.

![image1](https://www.dropbox.com/scl/fi/8yew5qxeqfhn4z3z8j0o4/transaction1.png?rlkey=833mris0khfqzw5lzruv2bket&st=wn26x5tp&dl=1)

```sql
# 트랜잭션 시작 명령어
START TRANSACTION;

# A 계좌에서 2만원 제거
UPDATE account SET balance = balance - 20000 WHERE name = 'A';

# B 계좌에서 2만원 추가
UPDATE account SET balance = balance + 20000 WHERE name = 'B';

# 지금까지 적업한 내용을 데이터베이스에 영구적으로 저장하는 명령어(트랜잭션 작업을 종료)
COMMIT;
```

![image2](https://www.dropbox.com/scl/fi/yy392urg569dh7o8sda3g/transaction2.png?rlkey=34nvs425k7eovyajop6hw399k&st=1r1gij35&dl=1)

이렇게 트랜잭션 과정이 정상적으로 처리되어 DB에 반영되는 것을 볼 수 있다.

<br>

# ROLLBACK 에시

위와 같은 테이블에서 ROLLBACK을 사용하는 SQL문을 작성한다면,

![image3](https://www.dropbox.com/scl/fi/wgh8itsj0jlc42khcbcrg/transaction3.png?rlkey=d3bn017gva7qaf31gs59vvl33&st=ux2thyqp&dl=1)

```sql
# 트랜잭션 시작 명령어
START TRANSACTION;

# A 계좌에서 2만원 제거
UPDATE account SET balance = balance - 20000 WHERE name = 'A';

# 수정된 테이블 조회
SELECT * FROM account;

# 트랜잭션 이전 상태로 되돌림
ROLLBACK;
```

![image4](https://www.dropbox.com/scl/fi/bu6vzuxj6jfpr7923wq7w/transaction4.png?rlkey=cgftvxjx1kwmaho3l53th4f14&st=xsiqu5mc&dl=1)

먼저 2만원을 빼고 ROLLBACK을 하면 2만원을 빼기 전 상태(트랜잭션을 시작하기 전 상태)로 되돌아간다.

<br>

# ACID 원칙

ACID는 트랜잭션의 4가지 원칙을 의미한다.

## Atomictcy(원자성)

트랜잭션의 작업들의 모두 실행되거나, 실행되지 말아야하는 원칙

SQL문이 모두 실행되어 COMMIT되거나, 하나라도 실패하면 ROLLBACK해야함

일부만 성공하는 상태는 존재하지 않음

위 이체 예시처럼 모든 작업이 실행되어 COMMIT 되거나, 하나라도 실패하면 ROLLBACK하여 트랜잭션 시작 전 상태로 되돌려야 함

<br>

## Consistency(일관성)

트랜잭션 작업 이전과 이후에 데이터들이 데이터베이스의 정해진 규칙(제약 조건)을 만족해야하는 원칙

PRIMARY KEY, FOREIGN KEY, CHECK, NOT NULL 등의 제약 조건을 위반하면 안됨

트랜잭션 도중에는 일시적으로 규칙이 맞지 않을 수 있어도, 종료된 후에는 반드시 규칙을 지켜야 함

계좌 테이블에 balance >= 0 이라는 제약조건이 있다면,

A의 잔액이 5만원인 상태에서 10만원을 이체하려는 트랜잭션에서 A의 잔액에서 10만원을 제거하면 -5만원이 되어벼러 해당 제약조건을 위반한다.

결과적으로 알관성 원칙에 따라 해당 트랜잭션은 ROLLBACK 되어야 한다.

<br>

## Isolation(고립성)

동시에 여러 트랜잭션이 실행되어도, 서로의 작업에 영향을 주지 않아야 하는 원칙

커밋되지 않은 데이터는 다른 트랜잭션이 접근할 수 없어야 함

동시에 실행되어도 결과적으로는 순서대로 실행한 것과 같은 결과가 나와야 함

만약 트랜잭션1에서 A가 B에게 2만원을 이체하는 작업을 하는데 COMMIT 되지 않은 상태에서 트랜잭션2가 해당 테이블을 조회해도 트랜잭션1이 시작하기 전 상태(2만원이 이체되기 전 상태)를 보여줘야 한다.

<br>

## Durability(지속성)

트랜잭션이 COMMIT되면, 그 결과는 시스템 장애가 발생해도 사라지지 않아야하는 원칙

정전이나 서버 다운이 발생해도 이미 커밋된 데이터는 보존되어야 함

커밋 후에는 데이터가 디스크 등 비휘발성 저장장치에 반영되어 안전하게 남아 있음

<br>

# 동시성 문제

트랜잭션이 동시에 실행될때 생길 수 있는 문제

## Dirty Read

아직 커밋되지 않은 데이터를 다른 트랜잭션이 읽어버리는 문제

![image5](https://www.dropbox.com/scl/fi/2mzagpqdw3lhdzseh0w9m/transaction5.png?rlkey=uddmcbjyqjap85ixuvu76bf2q&st=vei0xj90&dl=1)

<br>

## Non-repeatable Read

같은 데이터를 두 번 조회 했는데,  드 가이 값이 바뀌어서 결과가 달라지는 문제

![image6](https://www.dropbox.com/scl/fi/1qf0d2rurx1xmvuf6fqzb/transaction6.png?rlkey=3m37mi75w0sbw9tizd3lmzpya&st=zdt0xx29&dl=1)

<br>

## Phantom Read

데이터를 조회하는 도중, 새로운 데이터가 추가되어 없던 결과가 나타나는 문제

![image7](https://www.dropbox.com/scl/fi/ofdpdimq4eg3st5c34svi/transaction7.png?rlkey=b34qccfz3i4qa9ftb3m82fd1z&st=crap0wo5&dl=1)

<br>

# 격리 수준

동시성 문제를 해결하기 위한 단계별 규칙

## READ UNCOMMITTED

- 가장 낮은 격리 수준, 커밋되지 않은 데이터를 그대로 보여줌
- 격리를 하지 않아 속도는 가장 빠르지만, 모든 동시성 문제가 발생할 수 있어 실무에서는 거의 사용하지 않음

<br>

## READ COMMITTED

- 커밋된 데이터만 보여줌
- Dirty Read는 막아주지만, Non-repeatable Read는 발생할 수 있음.
- 오라클, PostgreSQL의 기본 격리 수준

<br>

## REPEATABLE READ

- 트랜잭션이 시작된 시점의 데이터를 계속 유지해서 보여줌
- Non-repeatable Read까지 막지만, Phantom Read는 발생 가능
- MySQL의 기본 격리 수준, 기존 값은 안정적으로 보장하지만, 새로 추가된 행까지는 막지 못함

<br>

## SERIALIZABLE

- 가장 높은 격리 수준으로, 모든 트랜잭션을 마치 순서대로 실행한 것 처럼 처리
- 모든 동시성 문제 방지하지만 성능은 가장 느림

<br>

참고 : [https://www.youtube.com/watch?v=sLJ8ypeHGlM](https://www.youtube.com/watch?v=sLJ8ypeHGlM)