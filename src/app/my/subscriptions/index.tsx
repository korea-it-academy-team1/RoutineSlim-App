import { router } from 'expo-router';

import { useSubscriptions } from '@/features/subscription/hooks/useSubscriptions';
import { MySubscriptionsScreen } from '@/features/subscription/screens/MySubscriptionsScreen';

/** 마이 > 내 구독 관리 — 이용 중·일시정지·해지 구독 목록 */
export default function MySubscriptionsRoute() {
  // 해지·일시정지까지 모든 상태 (화면에 들어올 때마다 다시 불러온다)
  const { subscriptions, error, reload } = useSubscriptions();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/my'));

  return (
    <MySubscriptionsScreen
      subscriptions={subscriptions}
      loadError={error?.message}
      onRetry={() => void reload()}
      onBack={goBack}
      onAdd={() => router.push('/subscription/add')}
      onPressSubscription={(id) => router.push({ pathname: '/my/subscriptions/[id]', params: { id } })}
    />
  );
}
