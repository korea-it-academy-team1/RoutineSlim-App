import { router } from 'expo-router';

import { mockScanResult } from '@/features/subscription/data/mockScanResult';
import { ScanResultScreen } from '@/features/subscription/screens/ScanResultScreen';

export default function ScanResultRoute() {
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/subscription/scan'));

  // TODO: 이미지 인식 API 결과를 받아 표시하고, 저장/업데이트 API 연동 후 홈 목록 갱신
  return <ScanResultScreen result={mockScanResult} onBack={goBack} onSubmit={() => router.dismissTo('/home')} />;
}
