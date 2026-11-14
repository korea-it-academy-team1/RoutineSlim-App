import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';

type LoadStateProps = {
  /** 있으면 오류 안내 + 다시 시도, 없으면 로딩 표시 */
  error?: string;
  onRetry?: () => void;
};

/** 내 정보를 불러오는 동안·실패했을 때 하위 화면 본문 대신 보여 준다 */
export function LoadState({ error, onRetry }: LoadStateProps) {
  return (
    <View style={styles.container}>
      {error ? (
        <>
          <Text style={styles.message}>{error}</Text>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onRetry}>
            <Text style={styles.retry}>다시 시도</Text>
          </Pressable>
        </>
      ) : (
        <ActivityIndicator color={colors.primary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  message: {
    ...typography.body,
    color: colors.textSubtle,
    textAlign: 'center',
  },
  retry: {
    ...typography.label,
    color: colors.primary,
  },
});
