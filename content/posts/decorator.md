---
title: NestJS - 데코레이터와 메타데이터
date: 2026-05-31
category: NestJS
description: NestJS에서의 데코레이터와 메타데이터에 대해 공부해보았습니다.
tags: [aws, ebs]
---

## 발생한 문제

> NestJS로 RoleGuard를 구현 중 허용 권한을 처리하는 데코레이터를 구현하는 중
> 데코레이터와 메타데이터가 어떤 느낌인지는 알고있었지만 정확히 무엇인지 설명을 하지는 못하고 있었다.

## 데코레이터

테코레이터는 다른 함수를 인수로 받아, 기존 코드(클래스, 함수, 메소드, 프로퍼티)를 명시적으로 수정하지 않고도 그 동작을 확장하는 함수이다.

간단히 기존 함수 코드는 건드리지 않고, 함수 실행 전후에 추가 기능을 붙이는 것이다.

## 왜 필요한가?

공통 로직을 여러 곳에서 반복해서 작성하지 않고 재사용하기 위해서이다.

예시

- 읽기 전용 설정(readonly)
- 로깅(logging)
- 권한 검사(authentication)
- 캐싱(memoization)
- 의존성 주입(DI)

## 메타데이터

메타 데이터는 간단히 데이터에 대한 데이터이다.

```ts
{
	"name": "Lim",
    "age": 24,
}
```

이런 데이터가 있다면 이건 실제 데이터이다.

```ts
{
	"tableNames": "users",
    "primaryKey": "id",
    "createdAt": "2026-05-31"
}
```

이런 데이터를 설명하는 데이터를 메타데이터라고 한다.

## 데코레이터와 메타데이터의 관계

데코레이터가 정보를 붙이는 도구이면, 메타데이터는 붙여진 정보이다.

데코레이터가 메타데이터를 생성하거나 등록을 하면 나중에 프레임워크가 해당 메타데이터를 읽게 된다.

## NestJS에서의 데코레이터와 메타데이터

권한 체크로 예시를 든다면 

```ts
import { SetMetadata } from "@nestjs/common";
import { UserRole } from "src/users/entities/user.entity";

export const ROLES_KEY = "roles";

export const Roles = (...roles: UserRole[]) => {
  return SetMetadata(ROLES_KEY, roles);
};
```

이 코드는 권한 메타데이터를 붙이는 커스텀 데코레이터이다.

`SetMetadata`는 NestJS에서 제공하는 함수로 클래스나 메서드에 메타데이터를 저장하는 데코레이터를 만들어주는 함수이다.

`ROLES_KEY`는 메타데이터를 저장하고 읽은대 쓰는 키 이름이다.

메타데이터는 보통 `key-value` 형태로 저장되어 `key: 'roles, values: \[UserRole.ADMIN\]`으로 저장된닫.

이후 Guard에서는 아래 코드로 가져올 수 있다.

```ts
this.reflector.get<UserRole[]>(ROLES_KEY, context.getHandler());
```

```ts
@Roles(User.Role.ADMIN)
@Get('admin')
getAdminPage() {
	return 'admin only';
}
```

이렇게 적용시킨 다면 NestJS는 해당 메서드에 이런 메타데이터를 저장한다.

```ts
{
  roles: [UserRole.ADMIN];
}
```

이 코드의 요청 흐름은

1.  `@Roles(UserRole.ADMIN)`
2.  `Roles` 함수를 실행
3.  `SetMetadata('roles', \[UserRole.ADMIN\])` 반환
4.  해당 메서드에 `roles` 메타데이터 저장
5.  요청 발생
6.  `RolesUard`가 `Reflector`로 `roles` 메타데이터를 읽음
7.  현재 유저와 `role` 비교
8.  접근 허용 또는 거부
