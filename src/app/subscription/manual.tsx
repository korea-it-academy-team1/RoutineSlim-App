import { router } from 'expo-router';
import { useState } from 'react';

import { createSubscription } from '@/features/subscription/api/subscriptionApi';
import { CATEGORY_ID } from '@/features/subscription/categories';
import {
  ManualSubscriptionScreen,
  type SubscriptionDraft,
} from '@/features/subscription/screens/ManualSubscriptionScreen';
import { BILLING_CYCLE_DTO } from '@/features/subscription/utils/billingForm';

export default function ManualSubscriptionRoute() {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/subscription/add'));

  const submit = async (draft: SubscriptionDraft) => {
    setSubmitting(true);
    setErrorMessage(undefined);
    try {
      await createSubscription({
        name: draft.name,
        categoryId: CATEGORY_ID[draft.category],
        amount: draft.price,
        billingCycle: BILLING_CYCLE_DTO[draft.cycle],
        startDate: draft.startDate,
        memo: draft.memo ?? null,
      });
      router.dismissTo('/home'); // 홈은 다시 보일 때 구독 목록을 새로 불러온다
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : '구독을 저장하지 못했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ManualSubscriptionScreen onBack={goBack} onSubmit={submit} submitting={submitting} errorMessage={errorMessage} />
  );
}
