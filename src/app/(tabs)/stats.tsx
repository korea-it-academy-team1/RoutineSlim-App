import { StatsScreen } from '@/features/stats/screens/StatsScreen';
import { useActiveSubscriptions } from '@/features/subscription/hooks/useSubscriptions';

export default function StatsRoute() {
  const { subscriptions } = useActiveSubscriptions();
  return <StatsScreen subscriptions={subscriptions} />;
}
