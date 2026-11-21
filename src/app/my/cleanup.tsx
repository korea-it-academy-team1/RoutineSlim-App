import { router } from 'expo-router';

import { confirmDialog } from '@/features/my/utils/dialog';
import { useCleanupItems } from '@/features/usage/hooks/useCleanupItems';
import { CleanupListScreen } from '@/features/usage/screens/CleanupListScreen';

/** 마이 > 정리 목록 — 정리 대상으로 담은 구독 */
export default function CleanupListRoute() {
  const { items, error, actionError, pendingId, reload, markCanceled, remove } = useCleanupItems();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/my'));
  const nameOf = (id: string) => items?.find((item) => item.subscriptionId === id)?.subscriptionName ?? '이 구독';

  return (
    <CleanupListScreen
      items={items}
      loadError={error?.message}
      onRetry={() => void reload()}
      actionError={actionError}
      pendingId={pendingId}
      onBack={goBack}
      onStartCheck={() => router.push('/usage')}
      onMarkCanceled={async (id) => {
        const ok = await confirmDialog(
          '해지 완료',
          `'${nameOf(id)}' 구독을 서비스에서 해지했나요? 내 구독에서 해지 상태로 바뀌고 결제 예정에서 빠져요.`,
          '해지했어요',
        );
        if (ok) await markCanceled(id);
      }}
      onRemove={async (id) => {
        const ok = await confirmDialog('목록에서 빼기', `'${nameOf(id)}' 구독을 정리 목록에서 뺄까요?`, '빼기');
        if (ok) await remove(id);
      }}
    />
  );
}
