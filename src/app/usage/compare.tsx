import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { ApiError } from '@/api/client';
import { useActiveSubscriptions } from '@/features/subscription/hooks/useSubscriptions';
import { saveCleanupItems } from '@/features/usage/api/cleanupApi';
import { UsageLoadGate } from '@/features/usage/components/UsageLoadGate';
import { useUsageChecks } from '@/features/usage/hooks/useUsageChecks';
import { CleanupCompareScreen } from '@/features/usage/screens/CleanupCompareScreen';
import { decodeSelection } from '@/features/usage/utils/compareCleanup';

/** 정리 전후 비교 (3/3). /usage/compare?selection=<구독 UUID>:cancel,<구독 UUID>:keep */
export default function CleanupCompareRoute() {
  const { selection } = useLocalSearchParams<{ selection?: string }>();
  const { subscriptions, loaded, error: subscriptionsError, reload: reloadSubscriptions } = useActiveSubscriptions();
  const { checks, error: checksError, reload: reloadChecks } = useUsageChecks();
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/usage'));

  return (
    <UsageLoadGate
      title="정리 전후 비교"
      ready={loaded && checks !== null}
      errorMessage={(subscriptionsError ?? checksError)?.message}
      onRetry={() => {
        void reloadSubscriptions();
        void reloadChecks();
      }}
      onBack={goBack}
    >
      {() => (
        <CleanupCompareScreen
          subscriptions={subscriptions}
          checks={checks ?? []}
          selection={decodeSelection(selection)}
          onBack={goBack}
          onReselect={goBack}
          submitting={submitting}
          saveError={saveError}
          savedCount={savedCount}
          onSave={async (items) => {
            setSubmitting(true);
            setSaveError(undefined);
            try {
              // 서버가 결제일 3일 전 날짜(remindOn)를 함께 저장한다. 푸시 발송은 서버 스케줄러가 생기면 붙는다
              await saveCleanupItems(items);
              setSavedCount(items.filter((item) => item.action !== 'KEEP').length);
            } catch (e) {
              setSaveError(e instanceof ApiError ? e.message : '정리 목록에 담지 못했어요. 잠시 후 다시 시도해 주세요.');
            } finally {
              setSubmitting(false);
            }
          }}
          // 사용량 점검 흐름(점검 → 선택 → 비교)을 닫고 정리 목록을 연다. 뒤로 가면 탭 화면으로 돌아간다
          onDone={() => {
            router.dismissAll();
            router.push('/my/cleanup');
          }}
        />
      )}
    </UsageLoadGate>
  );
}
