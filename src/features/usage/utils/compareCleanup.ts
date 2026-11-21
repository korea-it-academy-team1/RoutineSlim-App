import { CATEGORY_ORDER } from '@/features/subscription/categories';
import type { Subscription, SubscriptionCategory } from '@/features/subscription/types';
import { parseDateKey } from '@/utils/date';
import { formatMonthDay } from '@/utils/format';

import type { UsageCheckDto } from '../api/usageApi';
import type { CleanupOptionInfo } from '../types';
import { getCleanupChoices, type CleanupAction } from './cleanupPlan';
import { LEVEL_RANK, usageLevelLabel } from './usageLevels';

export type DiffRow = {
  subscription: Subscription;
  kind: 'removed' | 'changed' | 'unchanged';
  /** 예: '해지 · 안 씀', '프리미엄 → 광고형 스탠다드', '자주 씀' */
  detail: string;
  /** 지금 월 금액 (월 환산) */
  price: number;
  /** 정리 후 월 금액 */
  newPrice: number;
};

export type CategoryChange = { category: SubscriptionCategory; before: number; after: number };

export type ChangeNote = { kind: 'warning' | 'schedule'; text: string };

/**
 * 선택한 정리 방법을 적용했을 때 전후 비교 데이터. 금액은 모두 월 환산(monthlyPrice).
 * 이용 중인 구독 전체가 대상이고, selection 에 있는 구독만 바뀐다.
 */
export function compareCleanup(
  subscriptions: Subscription[],
  checks: UsageCheckDto[],
  options: Record<string, CleanupOptionInfo>,
  selection: Record<string, CleanupAction>,
) {
  const levelOf = new Map(checks.map((c) => [c.subscriptionId, c.usageLevel]));
  const levelText = (s: Subscription) => {
    const level = levelOf.get(s.id);
    return level ? usageLevelLabel(level) : '체크 안 함';
  };
  // 체크 안 한 구독은 '자주 씀' 다음(맨 뒤)
  const rank = (s: Subscription) => {
    const level = levelOf.get(s.id);
    return level ? LEVEL_RANK[level] : Object.keys(LEVEL_RANK).length;
  };

  const rows: DiffRow[] = [];
  const notes: ChangeNote[] = [];

  // 정리 대상(선택한 구독) → 덜 쓰는 순, 나머지 → 금액 큰 순
  const selected = subscriptions
    .filter((s) => selection[s.id])
    .sort((a, b) => rank(a) - rank(b) || b.monthlyPrice - a.monthlyPrice);
  const rest = subscriptions.filter((s) => !selection[s.id]).sort((a, b) => b.monthlyPrice - a.monthlyPrice);

  for (const subscription of selected) {
    const price = subscription.monthlyPrice;
    const info = options[subscription.id] ?? {};
    const action = selection[subscription.id];
    const choice = getCleanupChoices(subscription, info).find((c) => c.action === action);

    if (!choice || action === 'keep') {
      rows.push({ subscription, kind: 'unchanged', detail: levelText(subscription), price, newPrice: price });
      continue;
    }
    if (action === 'cancel') {
      rows.push({ subscription, kind: 'removed', detail: `해지 · ${levelText(subscription)}`, price, newPrice: 0 });
      if (info.cancelEffect) notes.push({ kind: 'warning', text: info.cancelEffect });
      continue;
    }

    const detail =
      action === 'downgrade' && info.cheaperPlan
        ? `${subscription.plan ?? '현재 요금제'} → ${info.cheaperPlan.name}`
        : `파티원 ${info.partyMembers}명과 나눠 내기`;
    rows.push({ subscription, kind: 'changed', detail, price, newPrice: choice.newPrice });
    if (action === 'downgrade' && info.cheaperPlan?.note) notes.push({ kind: 'warning', text: info.cheaperPlan.note });

    // 이번 결제는 기존 요금, 다음 달 결제부터 변경 요금
    const { month } = parseDateKey(subscription.nextBillingDate);
    notes.push({
      kind: 'schedule',
      text: `${formatMonthDay(subscription.nextBillingDate)} ${subscription.name} 결제는 그대로 나가고, 변경 요금은 ${(month % 12) + 1}월 결제부터 적용돼요.`,
    });
  }

  for (const subscription of rest) {
    const price = subscription.monthlyPrice;
    rows.push({ subscription, kind: 'unchanged', detail: levelText(subscription), price, newPrice: price });
  }

  const before = rows.reduce((sum, r) => sum + r.price, 0);
  const after = rows.reduce((sum, r) => sum + r.newPrice, 0);

  const categories: CategoryChange[] = CATEGORY_ORDER.map((category) => {
    const inCategory = rows.filter((r) => r.subscription.category === category);
    return {
      category,
      before: inCategory.reduce((sum, r) => sum + r.price, 0),
      after: inCategory.reduce((sum, r) => sum + r.newPrice, 0),
    };
  })
    .filter((c) => c.before > 0)
    .sort((a, b) => b.before - a.before);

  // 경고(달라지는 점)를 먼저, 결제 일정 안내는 뒤에
  notes.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'warning' ? -1 : 1));

  return { before, after, saving: before - after, rows, categories, notes };
}

/** 'id:action,id:action' ↔ 선택 객체 (경로 파라미터용) */
export function encodeSelection(selection: Record<string, CleanupAction>) {
  return Object.entries(selection)
    .map(([id, action]) => `${id}:${action}`)
    .join(',');
}

const ACTIONS: CleanupAction[] = ['cancel', 'downgrade', 'party', 'keep'];

export function decodeSelection(text: string | undefined): Record<string, CleanupAction> {
  if (!text) return {};
  return Object.fromEntries(
    text
      .split(',')
      .map((pair) => pair.split(':'))
      .filter((pair): pair is [string, CleanupAction] => pair.length === 2 && ACTIONS.includes(pair[1] as CleanupAction)),
  );
}
