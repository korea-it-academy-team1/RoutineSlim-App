import { router } from 'expo-router';

import { ScanSubscriptionScreen } from '@/features/subscription/screens/ScanSubscriptionScreen';

export default function ScanSubscriptionRoute() {
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/subscription/add'));

  // 이미지 피커 설치 전까지는 선택·촬영 없이 목업 인식 결과로 넘어간다
  const showResult = () => router.push('/subscription/scan-result');
  return <ScanSubscriptionScreen onBack={goBack} onPickFromAlbum={showResult} onTakePhoto={showResult} />;
}
