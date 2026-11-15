import { categoryFromId } from '@/features/subscription/categories';
import { getServiceBrand } from '@/features/subscription/serviceBrands';
import type { Subscription } from '@/features/subscription/types';
import { getRenewalDateInMonth } from '@/features/subscription/utils/renewal';
import { parseDateKey, type DateKey, type YearMonth } from '@/utils/date';

import type { PaymentDto } from '../api/paymentApi';

/**
 * 고른 달이 오늘 기준 언제인지
 * - past    : 지난달 이전 → 청구 기록만 (실제로 결제한 내역)
 * - current : 이번 달     → 청구 기록 + 아직 청구되지 않은 예정분
 * - future  : 다음 달 이후 → 예정분만 (지금 이용 중인 구독 기준)
 */
export type MonthKind = 'past' | 'current' | 'future';

export function getMonthKind({ year, month }: YearMonth, today: DateKey): MonthKind {
  const now = parseDateKey(today);
  const diff = year * 12 + month - (now.year * 12 + now.month);
  if (diff < 0) return 'past';
  return diff === 0 ? 'current' : 'future';
}

/**
 * 그 달의 결제 1건. 통계·캘린더가 함께 쓴다.
 * subscription 은 화면 표시용이라 price 가 이 결제의 금액, nextBillingDate 가 이 결제일이다
 * (SubscriptionRow 가 'MM.DD 결제 · 매월' 로 보여 준다).
 */
export type MonthPayment = {
  date: DateKey;
  subscription: Subscription;
  /** true: 청구 기록(결제 완료), false: 예정 */
  paid: boolean;
};

const CYCLE: Record<PaymentDto['billingCycle'], Subscription['cycle']> = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

/** 청구 기록 → 결제 1건 */
function fromPayment(p: PaymentDto): MonthPayment {
  return {
    date: p.billedOn,
    paid: true,
    subscription: {
      id: p.subscriptionId,
      name: p.subscriptionName,
      // 알 수 없는 번호면 toSubscription 과 같이 'shopping'
      category: categoryFromId(p.categoryId) ?? 'shopping',
      ...getServiceBrand(p.subscriptionName), // logo, accent
      price: p.amount,
      monthlyPrice: p.amount,
      status: p.status,
      nextBillingDate: p.billedOn,
      cycle: CYCLE[p.billingCycle],
    },
  };
}

/**
 * 구독 목록으로 그 달 결제 예정분을 계산한다 (등록 순서).
 * nextBillingDate 는 아직 청구되지 않은 다음 결제일이라, 그보다 앞선 날짜는 이미 청구됐거나(청구 기록에 있음) 시작 전이다 → 뺀다.
 * 그래서 이번 달은 청구 기록과 더해도 겹치지 않는다. 서버 배치(매일 00:05)가 오늘 결제분을 아직 기록하지 않았어도
 * nextBillingDate 가 오늘로 남아 있으니 예정분으로 잡힌다.
 */
function scheduledPayments(subscriptions: Subscription[], year: number, month: number): MonthPayment[] {
  return subscriptions.flatMap((s) => {
    const date = getRenewalDateInMonth(s, year, month);
    if (!date || date < s.nextBillingDate) return [];
    return [{ date, paid: false, subscription: { ...s, nextBillingDate: date } }];
  });
}

/** 고른 달의 결제 목록. 청구 기록이 먼저, 예정분이 뒤 (날짜순 정렬은 쓰는 쪽에서) */
export function buildMonthPayments(
  kind: MonthKind,
  { year, month }: YearMonth,
  payments: PaymentDto[],
  subscriptions: Subscription[],
): MonthPayment[] {
  if (kind === 'past') return payments.map(fromPayment);
  if (kind === 'future') return scheduledPayments(subscriptions, year, month);
  return [...payments.map(fromPayment), ...scheduledPayments(subscriptions, year, month)];
}

/** 날짜별로 묶는다 (캘린더 점·칩, 날짜 시트) */
export function groupByDate(monthPayments: MonthPayment[]) {
  const map = new Map<DateKey, MonthPayment[]>();
  for (const payment of monthPayments) {
    map.set(payment.date, [...(map.get(payment.date) ?? []), payment]);
  }
  return map;
}
