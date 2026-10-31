import { router, useLocalSearchParams } from 'expo-router';

import { CleanupCompareScreen } from '@/features/usage/screens/CleanupCompareScreen';
import { decodeSelection } from '@/features/usage/utils/compareCleanup';

export default function CleanupCompareRoute() {
  // /usage/compare?selection=netflix:downgrade,disney-plus:cancel,coupang-wow:cancel
  const { selection } = useLocalSearchParams<{ selection?: string }>();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/usage'));

  return (
    <CleanupCompareScreen
      selection={decodeSelection(selection)}
      onBack={goBack}
      onReselect={goBack}
      // TODO: 정리 목록 저장 API + 결제일 3일 전 알림 등록 후 홈으로
      onSave={() => router.dismissTo('/home')}
    />
  );
}
