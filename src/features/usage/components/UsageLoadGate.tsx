import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/common/BackHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { colors } from '@/theme';

type UsageLoadGateProps = {
  title: string;
  /** 구독·사용량 체크를 다 불러왔으면 true */
  ready: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onBack: () => void;
  children: () => ReactNode;
};

/**
 * 정리 방법 선택·전후 비교 화면은 첫 선택값을 서버 데이터로 정하므로, 다 불러온 뒤에 그린다.
 * 그 전에는 같은 헤더 아래 로딩 / 실패 안내를 보여 준다.
 */
export function UsageLoadGate({ title, ready, errorMessage, onRetry, onBack, children }: UsageLoadGateProps) {
  if (ready) return <>{children()}</>;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <BackHeader title={title} onBack={onBack} />
      <View style={styles.body}>
        {errorMessage ? (
          <EmptyState
            title="정보를 불러오지 못했어요"
            description={errorMessage}
            actionLabel="다시 시도"
            onPressAction={onRetry}
          />
        ) : (
          <ActivityIndicator color={colors.primary} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
  },
});
