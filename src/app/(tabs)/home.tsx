import { router } from 'expo-router';

import { useHomeSubscriptions } from '@/features/subscription/hooks/useHomeSubscriptions';
import { HomeScreen } from '@/features/subscription/screens/HomeScreen';

export default function HomeRoute() {
  const { summary, loading, error, reload } = useHomeSubscriptions();

  return (
    <HomeScreen
      summary={summary}
      loading={loading}
      errorMessage={error?.message}
      onRetry={reload}
      onPressComparison={() => router.push('/usage')}
      onPressAddSubscription={() => router.push('/subscription/add')}
    />
  );
}
