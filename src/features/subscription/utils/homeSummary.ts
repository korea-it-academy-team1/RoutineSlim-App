/*
 * ============================================================================
 * [홈 구현 5/8] 홈 화면 숫자 계산 (총액, 개수, 다가오는 결제)
 * ============================================================================
 * 구독 목록(Subscription[])과 오늘 날짜를 받아 홈에 그릴 값을 만든다. 서버를 부르지 않는 순수 함수라
 * 목업 데이터로 먼저 만들고 확인할 수 있다 (mockSubscriptions + MOCK_TODAY).
 *
 * 날짜 함수는 src/utils/date.ts 를 쓴다: toDateKey, diffInDays, parseDateKey
 *
 * ----------------------------------------------------------------------------
 * 만들 것
 * ----------------------------------------------------------------------------
 *   export type UpcomingPayment = { subscription: Subscription; dDay: number };   // dDay 0 = 오늘
 *
 *   export type HomeSummary = {
 *     month: number;                 // 이번 달 (1~12)
 *     totalPrice: number;            // ACTIVE 구독의 monthlyPrice 합 (TRIAL 은 아직 돈이 안 나가서 뺀다)
 *     activeCount: number;           // ACTIVE + TRIAL 개수 ("이용 중 n개")
 *     description: string;           // 카드 아래 한 줄 (아래 (3))
 *     upcoming: UpcomingPayment[];   // 다가오는 결제
 *     myList: Subscription[];        // 내 구독 (ACTIVE + TRIAL)
 *   };
 *
 *   export function buildHomeSummary(subscriptions: Subscription[], today: DateKey, upcomingDays = 7): HomeSummary
 *
 *   (1) 거르기: status 가 ACTIVE 또는 TRIAL 인 것만 쓴다 (PAUSED, CANCELED 는 홈에 안 나온다)
 *
 *   (2) upcoming: nextBillingDate 가 오늘 ~ 오늘 + upcomingDays 사이인 것
 *       - dDay = diffInDays(today, nextBillingDate)
 *       - dDay 오름차순, 같으면 이름순
 *
 *   (3) description: "다음 결제는 ___" 부분만 만든다
 *       - 가장 가까운 결제의 dDay 가 0 → '다음 결제는 오늘', 1 → '다음 결제는 내일', 그 밖 → '다음 결제는 n일 뒤'
 *       - 구독이 없으면 '등록된 구독이 없어요'
 *       - 시안의 '지난달과 동일해요' 부분은 지난달 결제 기록(payment 테이블)이 필요해서 지금 API 로는 못 만든다.
 *         서버에 요약 API 가 생기면 그때 붙인다 (docs/home-guide.md "나중에")
 *
 *   (4) myList: 시안처럼 일부만 보여 줄지(예: upcoming 에 없는 것 3개) 전부 보여 줄지는 디자인과 정한다.
 *       정하기 전에는 upcoming 에 없는 것을 다음 결제일 순으로 전부 넣는다
 *
 * ----------------------------------------------------------------------------
 * 확인 방법
 * ----------------------------------------------------------------------------
 *   buildHomeSummary(mockSubscriptions, MOCK_TODAY) 결과를 console.log 로 본다
 *   (목업에는 status, monthlyPrice 가 없으니 4번에서 목업에도 값을 채워 둔다)
 *   - upcoming: 넷플릭스·iCloud+ (D-1), 스포티파이 (D-4), 디즈니+ (D-7)
 *     시안은 D-1 두 개만 그려져 있다. 7일 기준을 그대로 둘지 디자인과 정한다
 *   - myList: YouTube Premium, 쿠팡 와우
 *   - totalPrice: 61,690 / activeCount: 6
 *   - description: '다음 결제는 내일'
 */

// 아직 구현 전. 구현하면 이 줄은 지운다
export {};
