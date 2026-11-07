# 홈 화면 API 연동 가이드 (App ↔ RoutineSlim-Server)

각 파일의 `[홈 구현 N/8]` 주석에 할 일이 자세히 적혀 있다. **번호 순서대로** 구현한다
(뒤 번호가 앞 번호의 함수를 import 한다). 새 파일은 구현한 뒤 `export {};` 줄을 지운다.

## 먼저 해결할 것

1. **로그인 5번 `src/features/auth/authorizedRequest.ts` 구현** — 아직 `export {};` 만 있다. 홈 1번이 이 함수를 쓴다 (`docs/login-guide.md`)
2. **서버 403 문제** — 지금 `dev` 서버는 `SecurityConfig` 가 `/auth/**` 외 모든 요청에 인증을 요구하는데
   `X-Member-Id` 를 인증으로 인정하는 필터가 없어서 `/api/v1/subscriptions` 가 403 이다.
   서버 담당에게 `feat/auth-jwt` 머지나 `SecurityConfig` 수정을 요청한다. 그전에는 2·4·5·7번을 목업으로 먼저 만든다
3. **웹에서 테스트할 때는 CORS** — 서버에 CORS 설정이 없어 웹(`localhost:8081`)에서는 요청이 막힌다. 휴대폰·에뮬레이터로 확인한다

## 파일 목록

| 순서 | 파일 | 상태 | 할 일 |
|---|---|---|---|
| 1 | `src/features/subscription/api/subscriptionApi.ts` | 새 파일(주석만) | 서버 응답 타입 `SubscriptionDto`, `getSubscriptions()` |
| 2 | `src/features/subscription/serviceBrands.ts` | 새 파일(주석만) | 서비스 이름 → 로고·대표색 표, 없으면 첫 글자 로고 |
| 3 | `src/features/subscription/utils/toSubscription.ts` | 새 파일(주석만) | `SubscriptionDto` → 화면용 `Subscription` 변환 |
| 4 | `src/features/subscription/types.ts` | 기존 + 주석 | `cycle` 에 `weekly`, `monthlyPrice`, `status` 추가 (+ `SubscriptionRow.tsx` 라벨, 목업 값) |
| 5 | `src/features/subscription/utils/homeSummary.ts` | 새 파일(주석만) | 총액·개수·다가오는 결제(D-n)·안내 문구 계산 |
| 6 | `src/features/subscription/hooks/useHomeSubscriptions.ts` | 새 파일(주석만) | 불러오기 + 로딩·오류 상태, 화면 들어올 때마다 다시 불러오기 |
| 7 | `src/features/subscription/screens/HomeScreen.tsx` | 기존 화면 + 주석 | 목업 대신 props, 로딩·오류·빈 목록 화면 |
| 8 | `src/app/(tabs)/home.tsx` | 기존 라우트 + 주석 | 훅 → 화면 연결, 404 면 로그아웃 후 로그인 화면 |

추천 진행: 4 → 2 → 5 → 7 (목업으로 화면까지 확인) → 1 → 3 → 6 → 8 (서버 연결)

## 화면과 데이터

| 화면 부분 | 데이터 | 계산 |
|---|---|---|
| 상단 요약 카드 | 이번 달 총 구독료, 이용 중 n개, "다음 결제는 내일" | 총액 = ACTIVE 의 `monthlyAmount` 합 / 개수 = ACTIVE + TRIAL |
| 다가오는 결제 | 7일 이내 결제 구독 + `D-n` 배지 | `nextBillingDate` 가 오늘 ~ +7일 |
| 내 구독 | 나머지 구독 목록, "전체 n개 보기" | ACTIVE + TRIAL |
| 알림 벨 | — | 알림 테이블이 없어 이번 범위 아님 |

## 서버 API

| API | 요청 | 응답 |
|---|---|---|
| `GET /api/v1/subscriptions` | 헤더 `X-Member-Id: <UUID>`, 선택 `?status=ACTIVE` | `SubscriptionResponse[]` (DTO 그대로) |

- 관련 테이블: `subscription`(중심), `subscription_category`(1 OTT, 2 음악, 3 클라우드, 4 쇼핑), `service_preset`, `payment`
- `nextBillingDate` 는 서버 배치가 매일 00:05 에 지난 날짜를 다음 결제일로 넘긴다
- 서버에 없는 것: 로고 그림, 대표색, 요금제 이름(`plan`), 카테고리 문자열 키 → 앱이 2·3번에서 채운다

## 나중에 (서버 작업이 필요한 것)

- **요약 API** `GET /api/v1/subscriptions/summary` — `totalMonthlyAmount`, `activeCount`, `lastMonthTotal`(payment 테이블), `nextBillingDate`, `upcoming[]`.
  생기면 시안의 "지난달과 동일해요" 문구를 만들 수 있다
- 응답에 `categoryKey`(`subscription_category.icon`) 추가 → 3번의 번호 → 키 표 삭제

## 완료 확인 체크리스트

- [ ] `npx tsc --noEmit` 오류 없음
- [ ] 목업으로 `buildHomeSummary(mockSubscriptions, MOCK_TODAY)` 를 넘겼을 때 총액 61,690원, 이용 중 6개, 다가오는 결제 4개(D-1 두 개, D-4, D-7)
- [ ] 로그인 → 홈에 서버 구독이 보이고, 총액이 ACTIVE 구독 월 환산 합과 같음
- [ ] 7일 안에 결제되는 구독에 `D-n` 배지, 오늘이면 `D-Day`
- [ ] 구독 0개 계정 → 빈 목록 안내가 보이고 오류 없음
- [ ] 구독 추가 후 홈으로 돌아오면 새 구독이 보임
- [ ] 서버를 끄고 홈 진입 → 오류 안내 + 다시 시도 버튼, 서버 켜고 다시 시도 → 정상 표시
- [ ] 직접 입력한 서비스(표에 없는 이름) → 첫 글자 로고
