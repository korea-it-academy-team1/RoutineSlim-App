import { router } from 'expo-router';

import { useActiveSubscriptions } from '@/features/subscription/hooks/useSubscriptions';
import { useUsageChecks } from '@/features/usage/hooks/useUsageChecks';
import { UsageCheckScreen } from '@/features/usage/screens/UsageCheckScreen';
import { todayKey } from '@/utils/date';

export default function UsageCheckRoute() {
  const today = todayKey();
  const { subscriptions, loaded } = useActiveSubscriptions();
  const { checks, error, saveError, reload, save } = useUsageChecks();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  return (
    <UsageCheckScreen
      subscriptions={subscriptions}
      // 구독 목록과 체크를 둘 다 불러온 뒤에 그린다
      checks={loaded ? checks : null}
      loadError={error?.message}
      onRetry={reload}
      saveError={saveError}
      today={today}
      onBack={goBack}
      onChangeLevel={(subscriptionId, level) => void save(subscriptionId, level, today)}
      onReviewCandidates={(ids) => router.push({ pathname: '/usage/cleanup', params: { ids: ids.join(',') } })}
    />
  );
}
