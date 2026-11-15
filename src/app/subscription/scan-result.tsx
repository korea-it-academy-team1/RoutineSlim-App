import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/common/BackHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { createSubscription, getSubscription, updateSubscription } from '@/features/subscription/api/subscriptionApi';
import { CATEGORY_ID } from '@/features/subscription/categories';
import { useActiveSubscriptions } from '@/features/subscription/hooks/useSubscriptions';
import { useScanStore } from '@/features/subscription/scanStore';
import { ScanResultScreen, type ScanResultDraft } from '@/features/subscription/screens/ScanResultScreen';
import { BILLING_CYCLE_DTO } from '@/features/subscription/utils/billingForm';
import { colors } from '@/theme';

/*
 * 스캔 결과 확인 → 저장
 * - 같은 이름의 구독이 이미 있으면: 그 구독의 이름·카테고리·금액·주기·결제일을 업데이트 (PUT)
 * - 없으면: 새로 등록 (POST)
 * 서버는 시작일(startDate)과 주기로 다음 결제일을 계산하므로, 화면의 '다음 결제일'을 시작일로 보낸다.
 * (업데이트에서 다음 결제일을 바꾸지 않았으면 기존 시작일을 그대로 둔다)
 */
export default function ScanResultRoute() {
  const result = useScanStore((state) => state.result);
  const clear = useScanStore((state) => state.clear);
  const { subscriptions } = useActiveSubscriptions();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/subscription/scan'));

  const submit = async (draft: ScanResultDraft) => {
    setSubmitting(true);
    setErrorMessage(undefined);
    try {
      const common = {
        name: draft.name,
        categoryId: CATEGORY_ID[draft.category],
        amount: draft.price,
        billingCycle: BILLING_CYCLE_DTO[draft.cycle],
      };

      if (draft.existingId) {
        const current = await getSubscription(draft.existingId);
        await updateSubscription(draft.existingId, {
          ...common,
          presetId: draft.presetId ?? current.presetId,
          cardId: current.cardId,
          currency: current.currency,
          cycleInterval: current.cycleInterval,
          startDate: current.nextBillingDate === draft.nextBillingDate ? current.startDate : draft.nextBillingDate,
          trialEndDate: current.trialEndDate,
          notifyEnabled: current.notifyEnabled,
          notifyDaysBefore: current.notifyDaysBefore,
          memo: current.memo,
        });
      } else {
        await createSubscription({ ...common, presetId: draft.presetId, startDate: draft.nextBillingDate });
      }

      clear();
      router.dismissTo('/home'); // 홈은 다시 보일 때 구독 목록을 새로 불러온다
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : '구독을 저장하지 못했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!result) {
    // 앱을 새로 켰거나 주소로 바로 들어온 경우
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <BackHeader title="스캔 결과 확인" onBack={goBack} />
        <EmptyState
          title="인식한 결과가 없어요"
          description="영수증 이미지를 먼저 올려 주세요."
          actionLabel="이미지 올리기"
          onPressAction={() => router.replace('/subscription/scan')}
        />
      </SafeAreaView>
    );
  }

  return (
    <ScanResultScreen
      result={result}
      subscriptions={subscriptions}
      onBack={goBack}
      onSubmit={submit}
      submitting={submitting}
      errorMessage={errorMessage}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
  },
});
