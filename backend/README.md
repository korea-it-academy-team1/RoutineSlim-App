# RoutineSlim — backend (서버)

앱(`frontend/`)이 쓰는 API 서버입니다. 아래 명령은 모두 이 `backend` 폴더에서 실행합니다.

- Spring Boot 4.1 / Java 17 / Gradle (wrapper 포함, 따로 설치할 필요 없음)
- DB: 로컬은 H2 파일 DB(설치 불필요), 배포는 MySQL
- 테이블 변경은 Flyway SQL(`src/main/resources/db/migration`)로만 한다

## 실행

    ./gradlew bootRun        # Windows: gradlew.bat bootRun
    ./gradlew test

- 서버: http://localhost:8080
- 상태 확인: http://localhost:8080/actuator/health → `{"status":"UP"}`
- H2 콘솔: http://localhost:8080/h2-console (JDBC URL `jdbc:h2:file:./data/routineslim`, 사용자 `sa`, 비밀번호 없음)

IntelliJ: 저장소 루트를 연 상태에서 `backend/build.gradle` 을 오른쪽 클릭 → **Link Gradle Project**.
그다음 `RoutineSlimApplication` 의 ▶ 로 실행합니다. (JDK 17 선택)

## 폴더 구조

```
src/main/java/com/routineslim/
├─ RoutineSlimApplication.java
├─ global/                      모든 도메인이 같이 쓰는 것
│  ├─ common/                   ApiResponse(공통 응답), BaseTimeEntity(생성일·수정일)
│  ├─ config/                   SecurityConfig(인증·CORS), JpaConfig
│  └─ exception/                ErrorCode, BusinessException, GlobalExceptionHandler
└─ domain/                      기능별 코드 (앱 features 와 1:1)
   ├─ auth/  user/  catalog/  subscription/  payment/  community/  scan/  usage/
   └─ <도메인>/controller · service · repository · entity · dto

src/main/resources/
├─ application.yml              공통
├─ application-local.yml        로컬 (기본값, H2)
├─ application-prod.yml         배포 (MySQL, 값은 환경 변수 → .env.example)
└─ db/migration/                Flyway SQL: V1__xxx.sql, V2__xxx.sql ...
```

## 규칙

- URL: `/api/v1/<복수형 명사>` (예: `/api/v1/subscriptions`)
- 응답: 항상 `ApiResponse` 로 감싼다 → `{ "success", "data", "error" }`
- JSON 필드 이름은 앱 TypeScript 타입과 똑같이 (`nextBillingDate`, `cycle: "monthly"`)
- 날짜만은 `YYYY-MM-DD`, 시각은 ISO 8601
- 컨트롤러는 엔티티를 직접 돌려주지 않고 DTO 로 바꿔서 돌려준다
- 에러는 서비스에서 `throw new BusinessException(ErrorCode.XXX)` — 코드는 `ErrorCode` 에 추가

## 어디서부터 시작하나 — 첫 기능: 내 구독(subscription)

홈·달력·통계·사용량 화면이 모두 구독 목록 하나로 계산되므로 `subscription` 부터 만듭니다.
로그인은 그다음에 붙이고, 그 전까지는 SecurityConfig 가 `/api/**` 를 열어 둡니다.

1. **테이블**: `db/migration/V1__create_subscription.sql`
   앱 `frontend/src/features/subscription/types.ts` 의 `Subscription` 에서 화면용 값(logo, accent)을 뺀 것이 컬럼이 된다
   → id, service_code, name, category, plan, price, cycle, next_billing_date, created_at, updated_at
2. **엔티티**: `domain/subscription/entity/Subscription.java` (`BaseTimeEntity` 상속), `BillingCycle` · `SubscriptionCategory` enum
3. **리포지토리**: `domain/subscription/repository/SubscriptionRepository.java` (`JpaRepository`)
4. **DTO**: `domain/subscription/dto/` — `SubscriptionResponse`, `SubscriptionCreateRequest`, `SubscriptionUpdateRequest`
5. **서비스**: `domain/subscription/service/SubscriptionService.java` — 없으면 `ErrorCode.SUBSCRIPTION_NOT_FOUND`
6. **컨트롤러**: `domain/subscription/controller/SubscriptionController.java`
   `GET /api/v1/subscriptions`, `POST`, `PATCH /{id}`, `DELETE /{id}`
7. **테스트**: 서비스 단위 테스트 + 컨트롤러 테스트, 확인은 `./gradlew test` 와 H2 콘솔

그다음 순서: `auth`·`user`(로그인·JWT, 구독에 user_id 연결) → `catalog` → `payment` → `community` → `scan` → `usage`
