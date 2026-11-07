/*
 * ============================================================================
 * [홈 구현 3/8] 서버 응답 → 화면용 Subscription 변환
 * ============================================================================
 * 서버 SubscriptionDto(1번)를 화면 컴포넌트(SubscriptionRow 등)가 쓰는 Subscription(../types) 으로 바꾼다.
 * 화면은 지금처럼 Subscription 만 알면 되고, 서버 필드 이름이 바뀌어도 이 파일만 고치면 된다.
 *
 * 먼저 할 것: types.ts(4번)에 cycle 'weekly', monthlyPrice, status 를 추가한다.
 *
 * ----------------------------------------------------------------------------
 * 만들 것
 * ----------------------------------------------------------------------------
 *   (1) 카테고리 번호 → 앱 키
 *       const CATEGORY_BY_ID: Record<number, SubscriptionCategory> = { 1: 'ott', 2: 'music', 3: 'cloud', 4: 'shopping' };
 *       - 서버 V2 시드가 OTT, 음악, 클라우드, 쇼핑 순서로 넣어서 번호가 1~4 다
 *       - 표에 없는 번호면 'ott' 가 아니라 눈에 띄게 처리한다 (예: console.warn 후 'shopping')
 *       - 서버가 나중에 categoryKey('ott' 등, subscription_category.icon)를 응답에 넣어 주면 이 표는 지운다
 *
 *   (2) 결제 주기
 *       'WEEKLY' → 'weekly', 'MONTHLY' → 'monthly', 'YEARLY' → 'yearly'  (소문자로)
 *       cycleInterval 이 1 이 아닌 경우(3개월마다 등)는 이번에는 화면에 따로 표시하지 않는다
 *
 *   (3) export function toSubscription(dto: SubscriptionDto): Subscription
 *       {
 *         id: dto.id,
 *         name: dto.name,
 *         category: CATEGORY_BY_ID[dto.categoryId],
 *         ...getServiceBrand(dto.name),        // logo, accent (2번)
 *         price: dto.amount,                   // 1회 결제 금액 (행에 표시)
 *         monthlyPrice: dto.monthlyAmount,     // 월 환산 금액 (총액 계산)
 *         nextBillingDate: dto.nextBillingDate,
 *         cycle: (2)의 값,
 *         status: dto.status,
 *       }
 *       - plan(요금제 이름)은 DB 에 없어서 넣지 않는다 (types 에서 이미 선택 항목)
 *
 * ----------------------------------------------------------------------------
 * 확인 방법
 * ----------------------------------------------------------------------------
 *   getSubscriptions() 결과를 .map(toSubscription) 해서 console.log → category 가 'ott' 같은 문자열,
 *   logo 가 들어 있으면 성공.
 */

// 아직 구현 전. 구현하면 이 줄은 지운다
export {};
