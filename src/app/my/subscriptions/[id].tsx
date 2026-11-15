import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/api/client';
import { confirmDialog } from '@/features/my/utils/dialog';
import { getSubscriptionPayments, type PaymentDto } from '@/features/payment/api/paymentApi';
import {
  changeSubscriptionStatus,
  deleteSubscription,
  getSubscription,
  updateSubscription,
  type SubscriptionDto,
  type SubscriptionStatusDto,
} from '@/features/subscription/api/subscriptionApi';
import { CATEGORY_ID } from '@/features/subscription/categories';
import {
  SubscriptionDetailScreen,
  type SubscriptionEdit,
} from '@/features/subscription/screens/SubscriptionDetailScreen';
import { BILLING_CYCLE_DTO } from '@/features/subscription/utils/billingForm';

const STATUS_CONFIRM: Partial<Record<SubscriptionStatusDto, { title: string; message: string; label: string }>> = {
  PAUSED: {
    title: '일시정지',
    message: '결제 예정과 알림에서 빠져요. 언제든 다시 시작할 수 있어요.',
    label: '일시정지',
  },
  CANCELED: {
    title: '구독 해지',
    message: '해지한 구독은 결제 예정에서 빠지고, 지난 결제 기록은 남아요.',
    label: '해지',
  },
};

/** 마이 > 내 구독 관리 > 구독 상세 (수정·일시정지·해지·삭제) */
export default function SubscriptionDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [subscription, setSubscription] = useState<SubscriptionDto | null>(null);
  const [payments, setPayments] = useState<PaymentDto[] | null>(null);
  const [loadError, setLoadError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string>();

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/my/subscriptions'));

  const load = useCallback(async () => {
    setLoadError(undefined);
    try {
      setSubscription(await getSubscription(id));
    } catch (e) {
      setLoadError(e instanceof ApiError ? e.message : '구독을 불러오지 못했어요.');
      return;
    }
    try {
      setPayments(await getSubscriptionPayments(id));
    } catch {
      setPayments([]); // 결제 기록은 못 불러와도 상세는 보여 준다
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  /** 저장·상태 변경·삭제 공통: 요청 중 표시와 실패 안내 */
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setActionError(undefined);
    try {
      await action();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : '처리하지 못했어요.');
    } finally {
      setBusy(false);
    }
  };

  const save = (edit: SubscriptionEdit) =>
    run(async () => {
      if (!subscription) return;
      const updated = await updateSubscription(subscription.id, {
        name: edit.name,
        categoryId: CATEGORY_ID[edit.category],
        presetId: subscription.presetId,
        cardId: subscription.cardId,
        amount: edit.price,
        currency: subscription.currency,
        billingCycle: BILLING_CYCLE_DTO[edit.cycle],
        cycleInterval: subscription.cycleInterval,
        // 서버는 시작일과 주기로 다음 결제일을 계산한다. 다음 결제일을 바꿨을 때만 그 날을 시작일로 보낸다
        startDate:
          edit.nextBillingDate === subscription.nextBillingDate ? subscription.startDate : edit.nextBillingDate,
        trialEndDate: subscription.trialEndDate,
        notifyEnabled: edit.notifyEnabled,
        notifyDaysBefore: subscription.notifyDaysBefore,
        memo: edit.memo,
      });
      setSubscription(updated);
    });

  const changeStatus = async (status: SubscriptionStatusDto) => {
    const confirm = STATUS_CONFIRM[status];
    if (confirm && !(await confirmDialog(confirm.title, confirm.message, confirm.label))) return;
    await run(async () => {
      if (!subscription) return;
      setSubscription(await changeSubscriptionStatus(subscription.id, status));
    });
  };

  const remove = async () => {
    const ok = await confirmDialog(
      '구독 삭제',
      '잘못 등록한 구독을 지워요. 지난 결제 기록도 통계와 캘린더에서 빠져요. 그만 쓰는 구독이라면 해지를 눌러 주세요.',
      '삭제',
    );
    if (!ok) return;
    await run(async () => {
      if (!subscription) return;
      await deleteSubscription(subscription.id);
      goBack(); // 목록은 다시 보일 때 새로 불러온다
    });
  };

  return (
    <SubscriptionDetailScreen
      subscription={subscription}
      payments={payments}
      loadError={loadError}
      onRetry={() => void load()}
      busy={busy}
      actionError={actionError}
      onBack={goBack}
      onSave={(edit) => void save(edit)}
      onChangeStatus={(status) => void changeStatus(status)}
      onDelete={() => void remove()}
    />
  );
}
