import { router } from 'expo-router';

import { ScanSubscriptionScreen } from '@/features/subscription/screens/ScanSubscriptionScreen';

export default function ScanSubscriptionRoute() {
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/subscription/add'));

  // 이미지 피커·인식 API 연결 전이라 결과 화면은 '결과 없음' 안내만 보여 준다
  const showResult = () => router.push('/subscription/scan-result');
  return <ScanSubscriptionScreen onBack={goBack} onPickFromAlbum={showResult} onTakePhoto={showResult} />;
}
