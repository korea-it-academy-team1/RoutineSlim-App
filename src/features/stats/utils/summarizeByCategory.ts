import { CATEGORY_ORDER } from '@/features/subscription/categories';
import type { SubscriptionCategory } from '@/features/subscription/types';

/** 통계 한 줄 — 그 달 한 구독의 결제 금액 (청구 기록이든 예정이든 같은 모양) */
export type StatsItem = {
  /** 구독 id */
  id: string;
  name: string;
  category: SubscriptionCategory;
  /** 그 달 결제 금액 합계 */
  amount: number;
};

export type CategorySummary = {
  category: SubscriptionCategory;
  total: number;
  /** 0 ~ 1 */
  ratio: number;
  items: StatsItem[];
};

/** 카테고리 고정 순서대로 합계·비율을 낸다. 결제가 없는 카테고리는 제외 */
export function summarizeByCategory(items: StatsItem[]) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  const categories: CategorySummary[] = CATEGORY_ORDER.map((category) => {
    const categoryItems = items.filter((item) => item.category === category);
    const categoryTotal = categoryItems.reduce((sum, item) => sum + item.amount, 0);
    return { category, total: categoryTotal, ratio: total > 0 ? categoryTotal / total : 0, items: categoryItems };
  }).filter((c) => c.items.length > 0);

  return { total, count: items.length, categories };
}

export function formatPercent(ratio: number) {
  return `${(ratio * 100).toFixed(1)}%`;
}
