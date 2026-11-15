import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';

import { CalendarScreen } from '@/features/calendar/screens/CalendarScreen';
import { useMonthlyPayments } from '@/features/payment/hooks/useMonthlyPayments';
import { buildMonthPayments, getMonthKind } from '@/features/payment/utils/monthlyPayments';
import { useActiveSubscriptions } from '@/features/subscription/hooks/useSubscriptions';
import { parseDateKey, shiftMonth, todayKey, type YearMonth } from '@/utils/date';

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/*
 * 캘린더 — 통계와 같은 방식으로 고른 달에 따라 데이터가 다르다 (features/payment/utils/monthlyPayments.ts)
 * - 지난달 이전: 서버 청구 기록 (실제로 결제한 날짜·금액, 지금은 해지한 구독 포함)
 * - 이번 달    : 청구 기록 + 아직 청구되지 않은 결제 예정분
 * - 다음 달 이후: 지금 이용 중인 구독으로 계산한 예정분
 */
export default function CalendarRoute() {
  // /calendar?date=2026-10-12 → 해당 날짜의 결제 시트를 연 상태로 진입
  // /calendar?view=expanded → 확장(날짜별 금액) 보기로 진입
  const { date, view } = useLocalSearchParams<{ date?: string; view?: string }>();
  const initialSelectedDate = date && DATE_KEY_PATTERN.test(date) ? date : undefined;

  const today = todayKey();
  const [visibleMonth, setVisibleMonth] = useState<YearMonth>(() => {
    const { year, month } = parseDateKey(initialSelectedDate ?? today);
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

  const monthPayments = useMemo(() => {
    if (payments === null || (needsSubscriptions && !loaded)) return null;
    return buildMonthPayments(kind, visibleMonth, payments, subscriptions);
  }, [kind, visibleMonth, payments, subscriptions, loaded, needsSubscriptions]);

  return (
    <CalendarScreen
      subscriptions={subscriptions}
      year={visibleMonth.year}
      month={visibleMonth.month}
      kind={kind}
      monthPayments={monthPayments}
      errorMessage={error?.message}
      onRetry={() => {
        reloadPayments();
        void reloadSubscriptions();
      }}
      onChangeMonth={(delta) => setVisibleMonth((current) => shiftMonth(current, delta))}
      today={today}
      initialSelectedDate={initialSelectedDate}
      initialExpanded={view === 'expanded'}
    />
  );
}
