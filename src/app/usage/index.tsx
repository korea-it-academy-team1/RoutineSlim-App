import { router } from 'expo-router';

import { UsageCheckScreen } from '@/features/usage/screens/UsageCheckScreen';

export default function UsageCheckRoute() {
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  return (
    <UsageCheckScreen
      onBack={goBack}
      onReviewCandidates={(ids) => router.push({ pathname: '/usage/cleanup', params: { ids: ids.join(',') } })}
    />
  );
}
