---
title: AWS SAA-C03 취득 후기
date: 2026-10-08
category: AWS
description: AWS Solutions Architect – Associate(SAA-C03) 취득 과정과 공부 방법, 그리고 공부하며 정리한 서비스별 핵심 내용입니다.
tags: [aws, certification]
---

## AWS Solutions Architect – Associate란?

AWS SAA 자격증은 개발자들이 많이 취득하는 AWS 자격증으로, 효율적이고 안정적인 솔루션을 설계하는 능력을 검증하는 자격증이다.

문항 수는 총 **65문제**, 시험 시간은 **130분**이며, 1000점 만점 중 **720점** 이상이면 합격이다.

이 65문제 중 15문제는 채점되지 않는 문제라고 들었다. **최고의 경우**(내가 틀린 문제가 모두 채점되지 않는 문제일 때) **36개** 정도만 맞히면 되고, **최악의 경우**(내가 틀린 문제가 모두 채점되는 문제일 때) **51개** 정도를 맞혀야 한다...

그래서 덤프를 풀 때 65문제씩 끊어서 풀고, 50문제 이상 맞히는 것을 목표로 연습했다.

한국어로 신청하면 한국어로 번역된 문제와 영어 원문을 바꿔가면서 볼 수 있어서 한국어로 신청하는 게 좋은 것 같다.

<br>

## 결과 및 시험 후기

![SAA-C03 합격 점수 812점](https://www.dropbox.com/scl/fi/7gf3lbal3pawx7hbqocbc/aws-saa1.png?rlkey=gkp5wu114w2937wl4503k8853&st=s4cbn8eq&dl=1)

다행히 812점으로 나쁘지 않게 합격을 했다.

덤프에서 풀었던 비슷한 유형의 문제는 30% 정도 나왔다.

처음 보는 문제들도 서비스 개념을 제대로 공부했다면 충분히 맞힐 수 있는 수준이었다. 다만 3문제 정도는 완전히 처음 보는 개념의 문제였다.

<br>

## 기본 베이스

2025년 8월에 AWS CLF-C02를 취득했었다. 그때 AWS의 기본적인 서비스들의 개념이나 EC2, RDS 등 대표적인 서비스에 대해서는 조금 자세히 알고 있었다.

또한 학교 개발 동아리 테크톡에서 AWS 발표를 준비하면서 공부를 했던 덕분에 AWS에 대한 전반적인 흐름 정도는 알고 있었다.

[AWS 테크톡 발표 영상](https://youtu.be/F2qcxAU0UjM)

<br>

## 준비 과정 및 공부 방법

총 기간은 3주 정도 걸렸다. 1주는 개념 정리를 했고, 나머지 2주는 계속 덤프를 풀었다.

하루에 많게는 3~4시간, 평균적으로 1~2시간 정도 공부를 한 것 같다.

먼저 SAA에서 출제되는 AWS 서비스들의 개념을 다시 공부했다. 서비스마다 "이런 상황이면 이 서비스"라는 기준으로 정리했고, 정리한 내용은 글 아래 [부록](#부록-서비스별-핵심-정리)에 모아 두었다.

개념 정리를 마친 뒤에는 덤프를 풀었다. 한국어와 영어를 바꿔가면서 800문제 정도 풀었던 것 같다.

65문제씩 풀고 틀린 문제는 노션에 따로 모아두었다가 다시 풀고 정리하면서 공부했다.

<br>

## 후기 및 팁

시험은 강남 엔아버어학원 시험장에 가서 봤다. 시험장은 3~4평 정도의 사무실 같은 곳에서 봤다.

확실히 CLF-C02보다 어려웠다. 덤프를 풀면서도 계속 새로운 개념들과 헷갈리는 문제들을 많이 마주했다.

이 자격증을 취득하면 AWS에 대해 전문가 수준의 지식과 실력을 얻을 거라 기대했지만, 그렇지는 않은 것 같다. 그래도 어떤 상황에서 어떤 서비스를 골라야 하는지 판단하는 기준이 생긴 것 같다.

다음은 AWS 비용 최적화하는 방법에 대해 공부를 해봐야겠다.

작은 팁으로는 문제에 플래그를 달 수 있어서 시험 문제를 다 풀고 다시 플래그를 달았던 문제로 돌아가서 수정할 수 있다.

먼저 고민되는 문제는 오래 붙잡고 있지 말고 빠르게 모두 풀어본다음에 헷갈리는 문제는 플래그를 통해 검수하는게 시간이 효율적인 것 같다.

130분이라 천천히 풀어도 시간은 넉넉하다.

<br>

## 부록: 서비스별 핵심 정리

### 1. 컴퓨트

**실행 방식**

- **Lambda:** 15분 이하, 이벤트 기반, 상태 비저장, 안 쓸 때 비용 0
- 15분 초과 시 컨테이너는 **Fargate**, 배치는 **Batch**, 체이닝은 **Step Functions**
- OS 제어, GPU, 상시 실행이 필요하면 **EC2**
- **Batch:** 무거운 대량 작업을 큐에 넣고 자동 실행 (+ EC2/Spot, ECR)
- **Step Functions:** 여러 단계의 순서·분기·재시도·상태를 관리

**컨테이너**

- **ECS:** AWS 네이티브, 단순함
- **EKS:** Kubernetes 표준, 멀티클라우드 이식성
- **Fargate:** 서버 관리 없음, 운영 최소
- **EC2 Launch Type:** 커스텀 AMI, 특수 커널, privileged 컨테이너, 데몬 에이전트, GPU가 필요할 때

**EC2 구매 옵션**

| 옵션 | 할인 | 언제 |
| --- | --- | --- |
| On-Demand | 0% | 단기, 예측 불가 |
| Reserved Instance | 최대 72% | 24/7 고정 워크로드 |
| Compute Savings Plans | 최대 66% | 타입·리전 변경, Fargate·Lambda까지 유연 |
| Spot | 최대 90% | 중단을 허용하는 배치·ML (프로덕션 DB는 절대 금지) |
| Capacity Reservation | 할인 없음 | 특정 AZ에 용량 확보가 목적 |
- 기본 트래픽은 RI, 피크는 On-Demand로 처리하는 조합이 흔함
- **Spot Fleet**은 최저가 우선, **EC2 Fleet**은 Spot·On-Demand·RI를 혼합

**Auto Scaling**

- **Target Tracking:** "CPU 50% 유지"처럼 목표값을 정함. 가장 권장되는 방식
- **Step Scaling:** 초과 폭에 따라 단계적으로 증감
- **Scheduled Scaling:** "매일 9시"처럼 예측 가능한 패턴
- **Simple Scaling:** 쿨다운 튜닝이 필요해 정답으로는 덜 선호됨

**기타**

- **ASG Health Check를 ELB와 연동**하면 비정상 인스턴스가 자동 교체됨
- **AMI:** 골든 이미지, 동일 환경 복제
- **Launch Template:** ASG 설정 묶음
- **Placement Group:** Cluster(HPC, 초저지연) / Spread(AZ당 7개, 장애 격리) / Partition(Hadoop·Kafka)
- **EBS vs Instance Store:** 데이터를 유지해야 하면 EBS, 휘발돼도 되는 캐시는 Instance Store

### 2. 스토리지

**S3 스토리지 클래스**

| 클래스 | 언제 |
| --- | --- |
| Standard | 자주 사용, 기본값 |
| Intelligent-Tiering | 접근 패턴을 모를 때 |
| Standard-IA | 가끔 보지만 즉시 필요 (읽기 요금 별도) |
| One Zone-IA | 위와 같지만 재생성 가능한 데이터 (단일 AZ) |
| Glacier Instant | 아카이브인데 ms 단위 접근 필요 |
| Glacier Flexible | 분~시간 대기 허용 (Expedited 1~5분, Standard 3~5시간, Bulk 5~12시간) |
| Deep Archive | 12~48시간 대기 허용, 최저가, 장기 규제 보관 |

**S3 보호**

- 실수로 인한 삭제 방지 → Versioning
- 관리자 실수까지 방지 → Versioning + MFA Delete
- 누구도 삭제 불가 → Object Lock Compliance 모드
- 관리자 예외 허용 → Object Lock Governance 모드

**S3 조합**

| 조합 | 용도 |
| --- | --- |
| S3 + CloudFront (+ OAC) | 정적 콘텐츠 전 세계 배포 |
| S3 + VPC Gateway Endpoint | NAT 없이 프라이빗 접근 (무료) |
| S3 + Athena | S3 데이터를 SQL로 바로 조회 |
| S3 Event + Lambda/SQS/SNS | 업로드 이벤트 처리 |
| S3 + SSE-KMS | 키 통제·감사 |
| CRR / SRR | 리전 간 / 리전 내 복제 (Versioning 필수, 기존 객체는 Batch Replication) |
| Transfer Acceleration + Multipart Upload | 대용량·원거리 업로드 |
| Byte-Range Fetches | 병렬 다운로드, 중단 지점부터 재개 |
| Pre-signed URL | 임시 접근, 클라이언트가 S3에 직접 업로드 |
| Requester Pays | 다운로드 비용을 요청자가 부담 |

**블록·파일 스토리지**

| 신호 | 정답 |
| --- | --- |
| 단일 EC2 디스크, 부팅, DB | EBS (gp3 기본, 쓰기 병목·미션 크리티컬이면 io2) |
| 여러 EC2 공유, Linux NFS, POSIX | EFS |
| Windows SMB + AD | FSx for Windows |
| NFS와 SMB 동시 | FSx for NetApp ONTAP |
| HPC·ML 병렬 처리, S3 연동 | FSx for Lustre |
| 스냅샷 복원 직후 바로 풀 I/O | EBS Fast Snapshot Restore |

### 3. 데이터베이스

**선택 기준**

- **RDS:** 전통적인 관계형 DB. 연결 수와 확장성에 한계
- **Aurora:** RDS의 상위 호환. 3AZ에 6복제본, 복제 지연이 거의 없음
- **DynamoDB:** 키-값 NoSQL. 무제한 확장, 서버리스

**상황별 해결책**

| 상황 | RDS | Aurora | DynamoDB |
| --- | --- | --- | --- |
| 연결 폭주 | RDS Proxy | RDS Proxy | (해당 없음) |
| 읽기 폭주 | Read Replica, ElastiCache | Aurora Replicas | DAX |
| 쓰기 병목 | Scale up, io2 | Serverless v2 | On-Demand, 파티션 키 재설계 |
| 고가용성 | Multi-AZ를 명시적으로 구성 | 기본 내장 | 기본 내장 |
| DR·글로벌 | Cross-Region Read Replica (수동 승격) | Global Database (Writer 1개, 1분 내 승격) | Global Tables (전 리전 쓰기 가능) |

**자주 비교되는 항목**

- **Multi-AZ:** 동기 복제, 자동 Failover, Standby는 읽기 처리 안 함
- **Read Replica:** 비동기, 읽기 분산 전용
- **캐시:** Memcached(단순) / Redis(복제·고가용성·자료구조) / MemoryDB(내구성 있는 주 DB)
- **DynamoDB 용량 모드:** 예측 불가 → On-Demand, 안정적 → Provisioned + Auto Scaling
- **DynamoDB 인덱스:** GSI(다른 파티션 키, 나중에 추가 가능) / LSI(생성 시에만 추가, 강한 일관성)
- **DynamoDB 부가 기능:** Streams(변경 이벤트) / TTL(자동 삭제)
- 암호화 안 된 RDS를 암호화하려면: 스냅샷 → 암호화 복사 → 복원

**목적별 DB**

| 워크로드 | 정답 |
| --- | --- |
| MongoDB 호환 | DocumentDB |
| 그래프 | Neptune |
| Cassandra 호환 | Keyspaces |
| 시계열 | Timestream |
| OLAP·데이터 웨어하우스 | Redshift |
| OS 접근이 필요한 Oracle·SQL Server | RDS Custom |

### 4. 메시징·스트리밍

- **SQS:** 버퍼, 1:1, 소비하면 삭제. 부하를 흡수하고 처리를 안정화
    - FIFO는 순서 보장과 중복 제거 (MessageGroupId 단위)
    - DLQ로 실패 메시지 격리
    - Visibility Timeout이 짧으면 중복 처리 발생
    - Long Polling으로 비용 절감
- **SNS:** 1:N 즉시 팬아웃
    - SNS + SQS는 팬아웃 + 각자 안정적 처리
    - Message Filtering으로 구독자별 분기
- 처리 방식별 조합: SQS + Lambda(서버리스) / SQS + EC2·ECS 워커(오래 걸리는 작업, 커스텀 런타임)
- **이메일 발송은 SES** (SNS가 아님). JMS·AMQP 레거시 브로커는 **Amazon MQ**
- **Kinesis**
    - **Data Streams:** 샤드에 저장하고 소비자가 직접 처리. 여러 소비자, 재처리 가능
    - **Firehose:** S3·Redshift·OpenSearch로 자동 적재. 처리 로직 없이 쌓기만 할 때
    - **Managed Service for Apache Flink** (기존 Kinesis Data Analytics): 실시간 집계·이상 탐지

### 5. 네트워크

**VPC 기본**

- **Public Subnet:** 라우팅 테이블에 0.0.0.0/0 → IGW 경로가 있음
- **Private Subnet:** 나가야 하면 NAT Gateway 경유 (아웃바운드만 가능)
- **NAT Gateway:** 퍼블릭 서브넷에 두고, AZ마다 하나씩
- **IPv6 아웃바운드 전용:** Egress-Only IGW
- **Security Group:** 인스턴스 단위, Stateful, 허용 규칙만. 다른 SG를 소스로 참조 가능
- **NACL:** 서브넷 단위, Stateless, 허용·거부 모두. "IP 차단", "서브넷 전체"가 명시될 때만 정답

**엔드포인트**

- S3·DynamoDB → **Gateway Endpoint** (라우팅 테이블에 붙음, 무료)
- 그 외 서비스(SSM, Secrets Manager, KMS 등) → **Interface Endpoint** (ENI 생성, SG 부착)

**VPC 간 연결**

- 2개 → Peering (전이 라우팅 불가, CIDR 겹치면 불가)
- 3개 이상, 중앙 허브 → Transit Gateway
- 특정 서비스만 단방향 공개 → PrivateLink
- 리소스를 다른 계정과 공유 → RAM

**운영자 접속**

- Bastion Host는 운영 부담과 키 관리 부담이 있음
- **SSM Session Manager**가 더 선호됨: 인바운드 포트 없이 IAM + CloudTrail로 접속

**로드밸런서**

| LB | 정답 신호 |
| --- | --- |
| ALB (L7) | HTTP·HTTPS, 경로·호스트·헤더 라우팅, WAF, Lambda 대상 |
| NLB (L4) | TCP·UDP, 고정 IP, 초저지연, 대량 연결, 게임·스트리밍 |
| GWLB | 방화벽·IDS/IPS 어플라이언스를 투명하게 삽입 |

**CloudFront**

- 조합: + S3(정적 콘텐츠) / + ALB(동적 콘텐츠) / + API Gateway / + WAF(엣지에서 공격 차단)
- S3 잠금: OAC(구 OAI)로 CloudFront만 S3에 접근
- 사용자 제한: Signed URL(파일 단위) / Signed Cookie(여러 파일)
- CloudFront vs **Global Accelerator:** Global Accelerator는 UDP·비HTTP, 고정 Anycast IP, 빠른 리전 Failover

**Route 53 라우팅 정책**

| 정책 | 용도 |
| --- | --- |
| Simple | 단일 엔드포인트 |
| Weighted | 비율 배포, A/B 테스트, 카나리 |
| Latency | 가장 빠른 리전으로 (성능 기준) |
| Geolocation | 국가·지역 정책, 규제 (정책 기준) |
| Geoproximity | 거리 + bias로 트래픽 이동 |
| Failover | Primary/Secondary, Active-Passive DR |
| Multi-value | DNS 수준의 단순 분산 |

**Route 53 Health Check vs ALB Health Check**

| 항목 | Route 53 | ALB |
| --- | --- | --- |
| 판단 단위 | 엔드포인트, 리전 | 인스턴스, 타깃 |
| 리전 장애 대응 | 가능 | 불가 |
| 반응 속도 | 느림 (DNS TTL) | 빠름 |
| 용도 | DR, 리전 전환 | 고가용성, 인스턴스 교체 |

**온프레미스 연결**

- **Direct Connect:** 전용선, 일관된 지연. 장기적·미션 크리티컬 연결
- **Site-to-Site VPN:** IPsec, 빠르고 저렴. 임시 연결이나 백업 경로
- **DX + VPN 이중화**가 AWS 모범 답안 (DX가 주 경로, VPN이 백업)
- 여러 지사를 VPN으로 연결 → CloudHub
- 재택근무 개인 PC → Client VPN

### 6. 보안·권한·감사

**IAM**

- **User:** 사람, 장기 자격 증명. 정답이 되는 경우는 드묾
- **Role:** 앱·서비스·크로스 계정·임시 권한. 대부분 이쪽이 정답
    - 형태: EC2 Instance Profile / Lambda Execution Role / ECS Task Role
- **Group:** 사람 묶음에 같은 권한 부여
- **Policy:** 조건부 접근 (IP, MFA, 태그)
- **정책 평가 순서:** 명시적 Deny가 최우선 → Allow가 하나라도 있으면 허용 → 아무것도 없으면 암묵적 Deny
- **Identity policy vs Resource policy**
    - Identity policy: "이 신원이 무엇을 할 수 있나"
    - Resource policy: "이 리소스(S3, KMS, SQS)에 누가 접근하나"
    - 다른 계정에서 접근 → Resource policy + AssumeRole

**Organizations**

- **SCP:** 계정·OU의 최대 권한 한계선. 권한을 부여하지는 않음. 멤버 계정의 관리자·루트 권한도 막음 (단, **관리 계정에는 적용되지 않음**)
- 조합 예시
    - 리전 제한·서비스 금지 → SCP
    - Prod/Dev 분리 → OU + SCP + IAM
    - 결제 통합 → Consolidated Billing
- 관련 서비스
    - Control Tower: 멀티 계정 거버넌스 자동화
    - IAM Identity Center: SSO
    - Permission Boundary: 개인 단위 권한 상한
    - `aws:PrincipalOrgID`: 조직 소속 계정만 허용

**KMS / Secrets Manager / Parameter Store**

| 서비스 | 한 줄 요약 | 신호 |
| --- | --- | --- |
| KMS | 키 관리 | CMK, 키 교체 정책, 키 사용 권한, 규정 준수 |
| Secrets Manager | 비밀 + 자동 교체 | DB 자격 증명, API 키, rotation, 하드코딩 금지 |
| Parameter Store | 설정 저장, 저렴 | 구성 값, SecureString, 교체 불필요, 비용 최소 |
- S3 암호화: SSE-S3(키 관리 불필요) / SSE-KMS(키 통제·감사) / 클라이언트 측(S3가 평문을 볼 수 없어야 할 때)
- 리전 간 복호화 → KMS Multi-Region Key

**감사·모니터링**

- **CloudTrail:** 누가(Who) 무엇을(What) 했나. API 기록, 포렌식
- **Config:** 설정이 어떻게 바뀌었나(What it is). 규정 준수, 드리프트
- **CloudWatch:** 지금 어떤 상태인가(How it runs). 지표, 로그, 알람, 자동 조치
    - 로그에서 알람을 트리거하려면 Logs + Metric Filter
    - 여러 경보를 AND·OR로 결합하려면 Composite Alarm
    - 이벤트 기반 자동화는 EventBridge

**위협 대응**

| 위협 | 정답 |
| --- | --- |
| DDoS 기본 방어 | Shield Standard (무료, 자동) |
| 대규모 DDoS, 비용 보호, 전문 대응팀 | Shield Advanced |
| SQLi, XSS, 봇, 국가 차단 (L7) | WAF (+ Bot Control) |
| VPC 경계 딥패킷 검사 | Network Firewall |
| 여러 계정에 방화벽 규칙 배포 | Firewall Manager |
| 계정 이상 행위 탐지 | GuardDuty (탐지만 함, 차단은 EventBridge + Lambda) |
| CVE 취약점 | Inspector |
| S3 개인정보 | Macie |
| 보안 결과 통합 | Security Hub |
| 컴플라이언스 보고서 | Artifact |

### 7. 마이그레이션·데이터 전송

| 신호 | 정답 |
| --- | --- |
| DB 이전, CDC, 다운타임 최소 | DMS (데이터 이동 담당, 스키마 변환은 못 함) |
| DB 엔진 변경 | SCT (구조 변환 담당, 데이터 복제는 못 함) → DMS와 함께 사용 |
| NAS·NFS·SMB 파일, 증분·주기 동기화, 대역폭 제어 | DataSync |
| 온프레를 유지하면서 AWS를 확장 스토리지로 사용 | Storage Gateway |
| ├ 파일 서버 → S3 | File Gateway |
| ├ iSCSI 블록 스토리지 | Volume Gateway (Cached: 확장 목적 / Stored: 전체를 로컬에 유지) |
| └ 기존 테이프 백업 | Tape Gateway → S3 Glacier |
| SFTP 서버 이전 | Transfer Family |
| 서버를 통째로 이전 | MGN (Rehost) |
| 의존성 조사 / 진행 상황 추적 | Application Discovery Service / Migration Hub |

**Snow 계열** (회선 한계, 초대용량, 일회성 이전)

- **Snowball / Snowball Edge:** 수십~수백 TB. Edge는 현장에서 EC2·Lambda로 처리 가능
- **Snowmobile:** 데이터센터 단위 (10PB 이상). 2024년 서비스 종료
- **Snowcone:** 소형, 수 TB. 2024년 판매 종료

### 8. 비용 모델

| 축 | 서버를 유지하는 모델 | 요청 기반 모델 |
| --- | --- | --- |
| 컴퓨팅 | EC2 (시간당 과금) | Lambda (실행 횟수 + 실행 시간) |
| 데이터 | RDS·Aurora (인스턴스 시간 + 스토리지) | DynamoDB (읽기·쓰기 요청 수) |
| 판단 질문 | "항상 켜져 있어야 하나?" | "안 쓸 때 0원이어야 하나?" |

> ⚠️ **On-Demand라는 이름의 함정**
> 
> - EC2 On-Demand = 인스턴스를 시간 단위로 빌림. 유휴 상태에도 비용 발생
> - DynamoDB On-Demand = 요청이 올 때만 과금. "트래픽을 예측할 수 없음"의 정답

**기타 비용 도구**

- Cost Explorer: 비용 분석
- Budgets: 예산 초과 알림·통제
- Trusted Advisor: 비용·성능·보안 점검
- Gateway Endpoint로 NAT 비용 절감

### 9. 분석

| 신호 | 정답 |
| --- | --- |
| S3 데이터를 SQL로 조회 (서버리스) | Athena |
| 스키마 크롤링, ETL | Glue |
| Redshift에서 S3 데이터 조회 | Redshift Spectrum |
| Spark·Hadoop, 세밀한 제어 | EMR |
| 테이블·열·행 단위 권한 | Lake Formation |
| 로그 검색·분석 | OpenSearch |
| BI 대시보드 | QuickSight |
