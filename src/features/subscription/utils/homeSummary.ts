/*
 * ============================================================================
 * [홈 구현 5/8] 홈 화면 숫자 계산 (총액, 개수, 다가오는 결제)
 * ============================================================================
 * 구독 목록(Subscription[])과 오늘 날짜를 받아 홈에 그릴 값을 만든다. 서버를 부르지 않는 순수 함수라
 * 테스트 데이터로 바로 확인할 수 있다.
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
 *   (4) myList: 이용 중인 구독 전부를 다음 결제일 순으로 넣는다 (다가오는 결제에 있는 것도 포함, 2026-11-14 결정)
 *
 * ----------------------------------------------------------------------------
 * 확인 방법
 * ----------------------------------------------------------------------------
 *   buildHomeSummary(테스트용 구독 배열, '2026-10-11') 결과를 console.log 로 본다
 *   (목업에는 status, monthlyPrice 가 없으니 4번에서 목업에도 값을 채워 둔다)
 *   - upcoming: 넷플릭스·iCloud+ (D-1), 스포티파이 (D-4), 디즈니+ (D-7)
 *     시안은 D-1 두 개만 그려져 있다. 7일 기준을 그대로 둘지 디자인과 정한다
 *   - myList: 6개 전부 (다음 결제일 순)
 *   - totalPrice: 61,690 / activeCount: 6
 *   - description: '다음 결제는 내일'
 */
import { diffInDays, parseDateKey, type DateKey } from '@/utils/date';

import type { Subscription } from '../types';

export type UpcomingPayment = { subscription: Subscription; dDay: number };

export type HomeSummary = {
  month: number;
  totalPrice: number;
  activeCount: number;
  description: string;
  upcoming: UpcomingPayment[];
  myList: Subscription[];
};

const isInUse = (s: Subscription) => s.status === 'ACTIVE' || s.status === 'TRIAL';

function describeNext(dDay: number | null) {
  if (dDay === null) return '다가오는 결제가 없어요';
  if (dDay === 0) return '다음 결제는 오늘';
  if (dDay === 1) return '다음 결제는 내일';
  return `다음 결제는 ${dDay}일 뒤`;
}

export function buildHomeSummary(subscriptions: Subscription[], today: DateKey, upcomingDays = 7): HomeSummary {
  const inUse = subscriptions.filter(isInUse);

  const upcoming = inUse
    .map((subscription) => ({ subscription, dDay: diffInDays(today, subscription.nextBillingDate) }))
    .filter(({ dDay }) => dDay >= 0 && dDay <= upcomingDays)
    .sort((a, b) => a.dDay - b.dDay || a.subscription.name.localeCompare(b.subscription.name, 'ko'));

  const myList = [...inUse].sort((a, b) => a.nextBillingDate.localeCompare(b.nextBillingDate));

  // 오늘 이후 가장 가까운 결제 (7일 밖이어도)
  const nextDDay = inUse
    .map((s) => diffInDays(today, s.nextBillingDate))
    .filter((d) => d >= 0)
    .reduce<number | null>((min, d) => (min === null || d < min ? d : min), null);

  return {
    month: parseDateKey(today).month,
    totalPrice: inUse.filter((s) => s.status === 'ACTIVE').reduce((sum, s) => sum + s.monthlyPrice, 0),
    activeCount: inUse.length,
    description: inUse.length === 0 ? '등록된 구독이 없어요' : describeNext(nextDDay),
    upcoming,
    myList,
  };
}
