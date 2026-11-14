import { router } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/common/BackHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { colors } from '@/theme';

/*
 * 스캔 결과 확인.
 * 이미지 선택(이미지 피커)과 인식 API(POST /api/v1/subscriptions/scan) 연결 전이라 보여 줄 결과가 없다.
 * 연결하면 인식 결과(ScanResult)를 받아 ScanResultScreen 에 넘긴다:
 *   <ScanResultScreen result={result} subscriptions={subscriptions} onBack={goBack} onSubmit={...} />
 */
export default function ScanResultRoute() {
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/subscription/scan'));

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <BackHeader title="스캔 결과 확인" onBack={goBack} />
      <EmptyState
        title="인식한 결과가 없어요"
        description="이미지 인식 기능은 아직 연결되지 않았어요. 직접 입력으로 등록해 주세요."
        actionLabel="직접 입력하기"
        onPressAction={() => router.replace('/subscription/manual')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
  },
});
