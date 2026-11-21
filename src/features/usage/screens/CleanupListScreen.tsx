import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/common/BackHeader';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { colors, radius, spacing, typography } from '@/theme';
import { formatWon } from '@/utils/format';

import type { CleanupActionDto, CleanupItemDto } from '../api/cleanupApi';
import { formatShortDate } from '../utils/usageLevels';

const ACTION_LABEL: Record<CleanupActionDto, string> = {
  CANCEL: '해지 예정',
  DOWNGRADE: '요금제 변경 예정',
  PARTY: '파티원 모집 예정',
};

type CleanupListScreenProps = {
  /** 정리 목록 (서버). 불러오는 중이면 null */
  items: CleanupItemDto[] | null;
  loadError?: string;
  onRetry?: () => void;
  /** 해지 완료·빼기 실패 안내 */
  actionError?: string;
  /** 처리 중인 구독 id */
  pendingId?: string | null;
  onBack: () => void;
  /** 사용량 점검으로 (빈 상태에서) */
  onStartCheck: () => void;
  /** 서비스에서 직접 해지했어요 → 구독을 해지 상태로 */
  onMarkCanceled: (subscriptionId: string) => void;
  /** 정리하지 않기로 하고 목록에서 빼기 */
  onRemove: (subscriptionId: string) => void;
};

/** 마이 > 정리 목록. 정리 전후 비교에서 '정리 목록에 담기'로 담은 구독 */
export function CleanupListScreen({
  items,
  loadError,
  onRetry,
  actionError,
  pendingId = null,
  onBack,
  onStartCheck,
  onMarkCanceled,
  onRemove,
}: CleanupListScreenProps) {
  const saving = (items ?? []).reduce((sum, item) => sum + (item.monthlyAmount - item.newMonthlyAmount), 0);

  const renderBody = () => {
    if (loadError) {
      return (
        <EmptyState
          title="정리 목록을 불러오지 못했어요"
          description={loadError}
          actionLabel="다시 시도"
          onPressAction={onRetry}
        />
      );
    }
    if (items === null) return <ActivityIndicator style={styles.loading} color={colors.primary} />;
    if (items.length === 0) {
      return (
        <EmptyState
          title="정리 목록이 비어 있어요"
          description="사용량 점검에서 잘 안 쓰는 구독을 골라 정리 목록에 담아 보세요."
          actionLabel="사용량 점검하기"
          onPressAction={onStartCheck}
        />
      );
    }

    return (
      <>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeading}>
            <Text style={styles.summaryLabel}>정리하면 아끼는 금액</Text>
            <Text style={styles.summaryCount}>{`${items.length}개`}</Text>
          </View>
          <Text style={styles.summaryTotal}>{`매달 ${formatWon(saving)}`}</Text>
          <Text style={styles.summaryNote}>{`1년이면 ${formatWon(saving * 12)} · 월 환산 금액 기준`}</Text>
        </Card>

        {items.map((item) => {
          const pending = pendingId === item.subscriptionId;
          const disabled = pendingId !== null;
          return (
            <Card key={item.subscriptionId} style={styles.itemCard}>
              <View style={styles.itemHeading}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.subscriptionName}
                </Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{ACTION_LABEL[item.action]}</Text>
                </View>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.oldPrice}>{formatWon(item.monthlyAmount)}</Text>
                <Text style={styles.arrow}>→</Text>
                <Text style={styles.newPrice}>{`월 ${formatWon(item.newMonthlyAmount)}`}</Text>
              </View>

              {item.nextBillingDate ? (
                <Text style={styles.meta}>
                  {`다음 결제 ${formatShortDate(item.nextBillingDate)}`}
                  {item.remindOn ? ` · ${formatShortDate(item.remindOn)}에 알림` : ''}
                </Text>
              ) : null}

              <View style={styles.actions}>
                {item.action === 'CANCEL' ? (
                  <Pressable
                    accessibilityRole="button"
                    disabled={disabled}
                    onPress={() => onMarkCanceled(item.subscriptionId)}
                    style={({ pressed }) => [styles.primaryAction, (pressed || disabled) && styles.dimmed]}
                  >
                    <Text style={styles.primaryActionText}>{pending ? '처리 중…' : '해지했어요'}</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  disabled={disabled}
                  onPress={() => onRemove(item.subscriptionId)}
                  style={({ pressed }) => [styles.secondaryAction, (pressed || disabled) && styles.dimmed]}
                >
                  <Text style={styles.secondaryActionText}>목록에서 빼기</Text>
                </Pressable>
              </View>
            </Card>
          );
        })}

        {actionError ? <Text style={styles.errorText}>{actionError}</Text> : null}

        <Text style={styles.note}>
          해지와 요금제 변경은 각 서비스 앱이나 웹에서 직접 진행해야 해요. 해지를 마쳤으면 &apos;해지했어요&apos;를
          눌러 주세요. 내 구독에서 해지 상태로 바뀌어요.
        </Text>
      </>
    );
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <BackHeader title="정리 목록" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>{renderBody()}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
  },
  content: {
    gap: spacing.lg,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  loading: {
    paddingVertical: spacing.xxl,
  },
  summaryCard: {
    gap: spacing.xs,
  },
  summaryHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    ...typography.listTitle,
    color: colors.textSubtle,
  },
  summaryCount: {
    ...typography.captionSmBold,
    color: colors.primary,
  },
  summaryTotal: {
    ...typography.amountLg,
    color: colors.textTitle,
  },
  summaryNote: {
    ...typography.meta,
    color: colors.textMuted,
  },
  itemCard: {
    gap: spacing.sm,
  },
  itemHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemName: {
    ...typography.cardTitle,
    flex: 1,
    color: colors.textTitle,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  badgeText: {
    ...typography.badge,
    color: colors.primary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  oldPrice: {
    ...typography.body13,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  arrow: {
    ...typography.body13,
    color: colors.textMuted,
  },
  newPrice: {
    ...typography.amount,
    color: colors.textPrimary,
  },
  meta: {
    ...typography.caption12,
    color: colors.textSubtle,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  primaryAction: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  primaryActionText: {
    ...typography.label,
    color: colors.white,
  },
  secondaryAction: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
  },
  secondaryActionText: {
    ...typography.label,
    color: colors.primary,
  },
  dimmed: {
    opacity: 0.6,
  },
  errorText: {
    ...typography.caption12,
    textAlign: 'center',
    color: colors.danger,
  },
  note: {
    ...typography.meta,
    textAlign: 'center',
    color: colors.textSubtle,
  },
});
