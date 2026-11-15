import { useMemo, useState } from 'react';

import { useMonthlyPayments } from '@/features/payment/hooks/useMonthlyPayments';
import { buildMonthPayments, getMonthKind } from '@/features/payment/utils/monthlyPayments';
import { StatsScreen } from '@/features/stats/screens/StatsScreen';
import { toStatsItems } from '@/features/stats/utils/monthlyStats';
import { useActiveSubscriptions } from '@/features/subscription/hooks/useSubscriptions';
import { parseDateKey, shiftMonth, todayKey, type YearMonth } from '@/utils/date';

/*
 * 통계 — 고른 달에 따라 데이터가 다르다 (features/payment/utils/monthlyPayments.ts, 캘린더와 같은 방식)
 * - 지난달 이전: 서버 청구 기록 (GET /payment/monthly)
 * - 이번 달    : 청구 기록 + 아직 청구되지 않은 결제 예정분
 * - 다음 달 이후: 지금 이용 중인 구독으로 계산한 예정분
 */
export default function StatsRoute() {
  const today = todayKey();
  const [visibleMonth, setVisibleMonth] = useState<YearMonth>(() => {
    const { year, month } = parseDateKey(today);
    return { year, month };
  });
  const kind = getMonthKind(visibleMonth, today);

  const { subscriptions, loaded, error: subscriptionsError, reload: reloadSubscriptions } = useActiveSubscriptions();
  const {
    payments,
    error: paymentsError,
    reload: reloadPayments,
  } = useMonthlyPayments(visibleMonth.year, visibleMonth.month, kind !== 'future');

  // 지난달은 청구 기록만, 나머지는 구독 목록도 있어야 계산할 수 있다
  const needsSubscriptions = kind !== 'past';
  const error = paymentsError ?? (needsSubscriptions ? subscriptionsError : null);

  const items = useMemo(() => {
    if (payments === null || (needsSubscriptions && !loaded)) return null;
    return toStatsItems(buildMonthPayments(kind, visibleMonth, payments, subscriptions));
  }, [kind, visibleMonth, payments, subscriptions, loaded, needsSubscriptions]);

  return (
    <StatsScreen
      year={visibleMonth.year}
      month={visibleMonth.month}
      kind={kind}
      items={items}
      errorMessage={error?.message}
      onRetry={() => {
        reloadPayments();
        void reloadSubscriptions();
      }}
      onChangeMonth={(delta) => setVisibleMonth((current) => shiftMonth(current, delta))}
    />
  );
}
