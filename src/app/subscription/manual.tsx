import { router } from 'expo-router';
import { useState } from 'react';

import { createSubscription, type BillingCycleDto } from '@/features/subscription/api/subscriptionApi';
import {
  ManualSubscriptionScreen,
  type SubscriptionDraft,
} from '@/features/subscription/screens/ManualSubscriptionScreen';
import type { SubscriptionCategory } from '@/features/subscription/types';

/** 서버 subscription_category 번호 (V2__seed_categories_presets.sql) */
const CATEGORY_ID: Record<SubscriptionCategory, number> = {
  ott: 1,
  music: 2,
  cloud: 3,
  shopping: 4,
};

const BILLING_CYCLE: Record<SubscriptionDraft['cycle'], BillingCycleDto> = {
  weekly: 'WEEKLY',
  monthly: 'MONTHLY',
  yearly: 'YEARLY',
};

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
        billingCycle: BILLING_CYCLE[draft.cycle],
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
