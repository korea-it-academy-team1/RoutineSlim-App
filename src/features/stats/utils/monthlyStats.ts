import type { MonthPayment } from '@/features/payment/utils/monthlyPayments';

import type { StatsItem } from './summarizeByCategory';

/**
 * 그 달 결제 목록(청구 기록 + 예정, features/payment/utils/monthlyPayments.ts) → 통계 줄.
 * 같은 구독이 여러 번 나오면(매주 결제 등) 한 줄로 합친다. 처음 나온 순서는 유지
 */
export function toStatsItems(monthPayments: MonthPayment[]): StatsItem[] {
  const map = new Map<string, StatsItem>();
  for (const { subscription: s } of monthPayments) {
    const prev = map.get(s.id);
    map.set(
      s.id,
      prev
        ? { ...prev, amount: prev.amount + s.price }
        : { id: s.id, name: s.name, category: s.category, amount: s.price },
    );
  }
  return [...map.values()];
}
