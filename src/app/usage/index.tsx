import { router } from 'expo-router';

import { useActiveSubscriptions } from '@/features/subscription/hooks/useSubscriptions';
import { UsageCheckScreen } from '@/features/usage/screens/UsageCheckScreen';

export default function UsageCheckRoute() {
  const { subscriptions } = useActiveSubscriptions();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  return (
    <UsageCheckScreen
      subscriptions={subscriptions}
      onBack={goBack}
      onReviewCandidates={(ids) => router.push({ pathname: '/usage/cleanup', params: { ids: ids.join(',') } })}
    />
  );
}
