import { router } from 'expo-router';
import { useMemo, useState } from 'react';

import { updateMonthlyBudget } from '@/features/my/api/userApi';
import { useMyInfo } from '@/features/my/hooks/useMyInfo';
import { BudgetScreen } from '@/features/my/screens/BudgetScreen';
import { useMonthlyPayments } from '@/features/payment/hooks/useMonthlyPayments';
import { buildMonthPayments } from '@/features/payment/utils/monthlyPayments';
import { useActiveSubscriptions } from '@/features/subscription/hooks/useSubscriptions';
import { parseDateKey, todayKey } from '@/utils/date';

/** 마이 > 월 예산 */
export default function BudgetRoute() {
  const { info, error, reload } = useMyInfo();
  const { subscriptions, loaded } = useActiveSubscriptions();
  const { year, month } = parseDateKey(todayKey());
  // 이번 달 구독료 = 통계·캘린더의 이번 달과 같은 값 (청구 기록 + 남은 예정)
  const { payments } = useMonthlyPayments(year, month, true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  const spent = useMemo(() => {
    if (payments === null || !loaded) return null;
    return buildMonthPayments('current', { year, month }, payments, subscriptions).reduce(
      (sum, p) => sum + p.subscription.price,
      0,
    );
  }, [payments, loaded, subscriptions, year, month]);
  const monthlyTotal = subscriptions.reduce((sum, s) => sum + s.monthlyPrice, 0);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/my'));

  const save = async (budget: number | null) => {
    setSaving(true);
    setSaveError(undefined);
    try {
      await updateMonthlyBudget(budget);
      goBack(); // 마이 탭은 다시 보일 때 내 정보를 새로 불러온다
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : '저장하지 못했어요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BudgetScreen
      budget={info ? info.monthlyBudget : undefined}
      loadError={error?.message}
      onRetry={() => void reload()}
      spent={spent}
      monthlyTotal={monthlyTotal}
      saving={saving}
      saveError={saveError}
      onBack={goBack}
      onSave={(budget) => void save(budget)}
    />
  );
}
