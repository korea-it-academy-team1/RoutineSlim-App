import type { Subscription } from '@/features/subscription/types';
import { diffInDays, parseDateKey, type DateKey } from '@/utils/date';

import type { UsageCheckDto, UsageLevelDto } from '../api/usageApi';

/** 체크한 지 이만큼 지나면 다시 체크해 달라고 한다 */
export const RECHECK_DAYS = 30;

export const USAGE_LEVELS: { value: UsageLevelDto; label: string }[] = [
  { value: 'OFTEN', label: '자주 씀' },
  { value: 'SOMETIMES', label: '가끔 씀' },
  { value: 'RARELY', label: '거의 안 씀' },
  { value: 'NEVER', label: '안 씀' },
];

/** '거의 안 씀'·'안 씀' 은 정리 후보 */
export const isCandidateLevel = (level: UsageLevelDto) => level === 'RARELY' || level === 'NEVER';

/** 덜 쓰는 순서 (정렬용) */
export const LEVEL_RANK: Record<UsageLevelDto, number> = { NEVER: 0, RARELY: 1, SOMETIMES: 2, OFTEN: 3 };

export const usageLevelLabel = (level: UsageLevelDto) => USAGE_LEVELS.find((l) => l.value === level)?.label ?? '';

/** 'YYYY-MM-DD' → '9.11' */
export function formatShortDate(date: DateKey) {
  const { month, day } = parseDateKey(date);
  return `${month}.${day}`;
}

/** 정리 화면에 보여 줄 사용 정도. 예: '안 씀 · 11.3 체크', 체크 전이면 '체크 안 함' */
export function describeCheck(check: UsageCheckDto | null | undefined) {
  return check ? `${usageLevelLabel(check.usageLevel)} · ${formatShortDate(check.checkedOn)} 체크` : '체크 안 함';
}

export type UsageRow = {
  subscription: Subscription;
  /** 아직 체크하지 않았으면 null */
  check: UsageCheckDto | null;
  /** 체크한 지 RECHECK_DAYS 가 지났다 */
  stale: boolean;
};

/**
 * 구독별 체크를 붙이고 정리 후보를 고른다.
 * 오래된 체크도 후보 판단에는 쓰되(마지막으로 안 쓴다고 했으니) 다시 체크하라고 표시한다.
 */
export function analyzeChecks(subscriptions: Subscription[], checks: UsageCheckDto[], today: DateKey) {
  const bySubscription = new Map(checks.map((c) => [c.subscriptionId, c]));
  const rows: UsageRow[] = subscriptions.map((subscription) => {
    const check = bySubscription.get(subscription.id) ?? null;
    return { subscription, check, stale: !!check && diffInDays(check.checkedOn, today) > RECHECK_DAYS };
  });

  const candidates = rows.filter((r) => r.check && isCandidateLevel(r.check.usageLevel));
  return {
    rows,
    candidates,
    checkedCount: rows.filter((r) => r.check).length,
    candidateTotal: candidates.reduce((sum, r) => sum + r.subscription.price, 0),
  };
}
