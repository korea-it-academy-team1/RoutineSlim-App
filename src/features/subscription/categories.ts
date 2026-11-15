import { colors } from '@/theme';

import type { SubscriptionCategory } from './types';

/** 표시 순서 고정 — 금액 순으로 다시 정렬하지 않는다 (색이 순위가 아니라 카테고리를 따르도록) */
export const CATEGORY_ORDER: SubscriptionCategory[] = ['ott', 'music', 'cloud', 'shopping'];

export const CATEGORY_META: Record<SubscriptionCategory, { label: string; color: string }> = {
  ott: { label: 'OTT', color: colors.categoryOtt },
  music: { label: '음악', color: colors.categoryMusic },
  cloud: { label: '클라우드', color: colors.categoryCloud },
  shopping: { label: '쇼핑', color: colors.categoryShopping },
};

/** 서버 subscription_category 번호 (V2__seed_categories_presets.sql 의 입력 순서) */
export const CATEGORY_ID: Record<SubscriptionCategory, number> = { ott: 1, music: 2, cloud: 3, shopping: 4 };

/** 서버 카테고리 번호 → 앱 카테고리. 모르는 번호면 null */
export function categoryFromId(id: number | null | undefined): SubscriptionCategory | null {
  const found = CATEGORY_ORDER.find((c) => CATEGORY_ID[c] === id);
  return found ?? null;
}
