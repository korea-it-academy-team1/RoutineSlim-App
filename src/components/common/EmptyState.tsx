import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, spacing, typography } from '@/theme';

type EmptyStateProps = {
  title: string;
  description?: string;
  /** 있으면 아래에 글자 버튼 (예: 다시 시도, 구독 추가) */
  actionLabel?: string;
  onPressAction?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** 데이터가 없거나 불러오지 못했을 때 목록 자리에 보여 주는 안내 */
export function EmptyState({ title, description, actionLabel, onPressAction, style }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel ? (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onPressAction}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  title: {
    ...typography.bodyBold,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  description: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
  },
  action: {
    ...typography.label,
    marginTop: spacing.xs,
    color: colors.primary,
  },
});
