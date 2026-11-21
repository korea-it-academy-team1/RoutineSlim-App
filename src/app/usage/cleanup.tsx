import { router, useLocalSearchParams } from 'expo-router';

import { useActiveSubscriptions } from '@/features/subscription/hooks/useSubscriptions';
import { UsageLoadGate } from '@/features/usage/components/UsageLoadGate';
import { useUsageChecks } from '@/features/usage/hooks/useUsageChecks';
import { CleanupChoiceScreen } from '@/features/usage/screens/CleanupChoiceScreen';
import { encodeSelection } from '@/features/usage/utils/compareCleanup';

/** 정리 방법 선택 (2/3). /usage/cleanup?ids=<구독 UUID>,<구독 UUID> */
export default function CleanupChoiceRoute() {
  const { ids } = useLocalSearchParams<{ ids?: string }>();
  const subscriptionIds = ids ? ids.split(',').filter(Boolean) : [];
  const { subscriptions, loaded, error: subscriptionsError, reload: reloadSubscriptions } = useActiveSubscriptions();
  const { checks, error: checksError, reload: reloadChecks } = useUsageChecks();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/usage'));

  return (
    <UsageLoadGate
      title="정리 방법 선택"
      ready={loaded && checks !== null}
      errorMessage={(subscriptionsError ?? checksError)?.message}
      onRetry={() => {
        void reloadSubscriptions();
        void reloadChecks();
      }}
      onBack={goBack}
    >
      {() => (
        <CleanupChoiceScreen
          subscriptions={subscriptions}
          checks={checks ?? []}
          subscriptionIds={subscriptionIds}
          onBack={goBack}
          onCompare={(selection) =>
            router.push({ pathname: '/usage/compare', params: { selection: encodeSelection(selection) } })
          }
        />
      )}
    </UsageLoadGate>
  );
}
