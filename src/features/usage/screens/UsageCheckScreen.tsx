import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ClockIcon from '@/assets/icons/clock.svg';
import { BackHeader } from '@/components/common/BackHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import type { Subscription } from '@/features/subscription/types';
import { colors, radius, spacing, typography } from '@/theme';
import { todayKey, type DateKey } from '@/utils/date';
import { formatWon } from '@/utils/format';

import type { UsageCheckDto, UsageLevelDto } from '../api/usageApi';
import { UsageServiceHeader } from '../components/UsageServiceHeader';
import { formatShortDate } from '../utils/analyzeUsage';
import { analyzeChecks, isCandidateLevel, RECHECK_DAYS, USAGE_LEVELS, type UsageRow } from '../utils/usageLevels';

type UsageCheckScreenProps = {
  /** 이용 중인 구독 (서버) */
  subscriptions: Subscription[];
  /** 서버에 저장된 사용량 체크. 불러오는 중이면 null */
  checks: UsageCheckDto[] | null;
  loadError?: string;
  onRetry?: () => void;
  /** 체크 저장 실패 안내 */
  saveError?: string;
  today?: DateKey;
  onBack: () => void;
  /** 구독의 사용 정도를 골랐다 (바로 저장) */
  onChangeLevel: (subscriptionId: string, level: UsageLevelDto) => void;
  /** 정리 후보 살펴보기 (후보 구독 id 목록) */
  onReviewCandidates?: (subscriptionIds: string[]) => void;
};

/**
 * 사용량 점검 — 휴대폰에서 다른 앱의 사용 시간을 읽을 수 없어서, 구독마다 최근 사용 정도를 직접 체크한다.
 * '거의 안 씀'·'안 씀' 으로 체크한 구독이 정리 후보가 되고, 정리 방법 선택(/usage/cleanup)으로 넘어간다.
 */
export function UsageCheckScreen({
  subscriptions,
  checks,
  loadError,
  onRetry,
  saveError,
  today = todayKey(),
  onBack,
  onChangeLevel,
  onReviewCandidates,
}: UsageCheckScreenProps) {
  const { rows, candidates, checkedCount, candidateTotal } = useMemo(
    () => analyzeChecks(subscriptions, checks ?? [], today),
    [subscriptions, checks, today],
  );

  const headline =
    checkedCount === 0
      ? '구독을 얼마나 쓰고 있나요?'
      : candidates.length > 0
        ? `${candidates.length}개 구독을 거의 안 쓰고 있어요`
        : '모든 구독을 잘 쓰고 있어요';

  const renderBody = () => {
    if (loadError) {
      return (
        <EmptyState
          title="사용량 체크를 불러오지 못했어요"
          description={loadError}
          actionLabel="다시 시도"
          onPressAction={onRetry}
        />
      );
    }
    if (checks === null) return <ActivityIndicator style={styles.loading} color={colors.primary} />;
    if (subscriptions.length === 0) {
      return <EmptyState title="이용 중인 구독이 없어요" description="구독을 추가하면 사용량을 점검할 수 있어요." />;
    }
    return (
      <>
        <View style={styles.summary}>
          <View style={styles.period}>
            <Text style={styles.periodText}>{`최근 ${RECHECK_DAYS}일 기준`}</Text>
            <View style={styles.sourceBadge}>
              <Text style={styles.sourceText}>{`${checkedCount}/${rows.length}개 체크함`}</Text>
            </View>
          </View>

          <View style={styles.headline}>
            <Text style={styles.headlineTitle}>{headline}</Text>
            {candidates.length > 0 ? (
              <Text style={styles.headlineLead}>
                그런데도 매달 <Text style={styles.headlineAmount}>{formatWon(candidateTotal)}</Text>이 나가고 있어요
              </Text>
            ) : checkedCount < rows.length ? (
              <Text style={styles.headlineLead}>아래에서 구독마다 사용 정도를 골라 주세요.</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>구독별 사용 정도</Text>
          <Text style={styles.sectionTrailing}>{`${rows.length}개`}</Text>
        </View>
        {saveError ? <Text style={styles.error}>{saveError}</Text> : null}
        {rows.map((row) => (
          <UsageCheckCard
            key={row.subscription.id}
            row={row}
            onChange={(level) => onChangeLevel(row.subscription.id, level)}
          />
        ))}

        <View style={styles.howWeCount}>
          <ClockIcon width={20} height={20} />
          <View style={styles.howWeCountTexts}>
            <Text style={styles.howWeCountTitle}>사용 정도는 직접 체크해요</Text>
            <Text style={styles.howWeCountBody}>
              {`휴대폰에서 다른 앱의 사용 시간은 읽을 수 없어요. 최근 ${RECHECK_DAYS}일 동안 얼마나 썼는지 골라 주시면, '거의 안 씀'·'안 씀' 구독을 정리 후보로 모아 드려요. ${RECHECK_DAYS}일이 지나면 다시 체크해 주세요.`}
            </Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <BackHeader title="사용량 점검" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>{renderBody()}</ScrollView>

      <View style={styles.bottomAction}>
        <Button
          size="md"
          title={candidates.length > 0 ? `정리 후보 ${candidates.length}개 살펴보기` : '정리할 구독이 없어요'}
          disabled={candidates.length === 0}
          onPress={() => onReviewCandidates?.(candidates.map((r) => r.subscription.id))}
          style={styles.bottomButton}
        />
      </View>
    </SafeAreaView>
  );
}

function UsageCheckCard({ row, onChange }: { row: UsageRow; onChange: (level: UsageLevelDto) => void }) {
  const { subscription, check, stale } = row;
  const subtitle = !check
    ? `월 ${formatWon(subscription.price)} · 아직 체크 안 함`
    : stale
      ? `${formatShortDate(check.checkedOn)} 체크 · ${RECHECK_DAYS}일이 지났어요, 다시 체크해 주세요`
      : `${formatShortDate(check.checkedOn)} 체크`;

  return (
    <View style={[styles.card, check && isCandidateLevel(check.usageLevel) && styles.cardCandidate]}>
      <UsageServiceHeader subscription={subscription} subtitle={subtitle} />
      <View style={styles.options}>
        {USAGE_LEVELS.map((level) => {
          const selected = check?.usageLevel === level.value;
          return (
            <Pressable
              key={level.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={`${subscription.name} ${level.label}`}
              onPress={() => onChange(level.value)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{level.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
  },
  content: {
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  loading: {
    paddingVertical: spacing.xxl,
  },
  summary: {
    gap: spacing.lg,
    padding: spacing.xl,
    borderRadius: radius.xl + 4,
    backgroundColor: colors.white,
  },
  period: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  periodText: {
    ...typography.body13,
    color: colors.textSubtle,
  },
  sourceBadge: {
    paddingHorizontal: 10,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  sourceText: {
    ...typography.caption12Bold,
    color: colors.primary,
  },
  headline: {
    gap: 6,
  },
  headlineTitle: {
    ...typography.headline,
    color: colors.textTitle,
  },
  headlineLead: {
    ...typography.lead,
    color: colors.textBody,
  },
  headlineAmount: {
    fontWeight: '700',
    color: colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
  },
  sectionTitle: {
    ...typography.sectionTitleTight,
    color: colors.textTitle,
  },
  sectionTrailing: {
    ...typography.body13,
    color: colors.textSubtle,
  },
  error: {
    ...typography.small,
    color: colors.danger,
    textAlign: 'center',
  },
  card: {
    gap: spacing.md,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: radius.xl + 4,
    backgroundColor: colors.white,
  },
  cardCandidate: {
    borderColor: colors.diffRemovedBorder,
  },
  options: {
    flexDirection: 'row',
    gap: 6,
  },
  option: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },
  optionSelected: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  optionText: {
    ...typography.caption12Medium,
    color: colors.textBody,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: colors.primaryStrong,
  },
  howWeCount: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
  },
  howWeCountTexts: {
    flex: 1,
    gap: spacing.xs,
  },
  howWeCountTitle: {
    ...typography.infoTitle,
    color: colors.infoTitle,
  },
  howWeCountBody: {
    ...typography.infoBody,
    color: colors.infoBody,
  },
  bottomAction: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.white,
  },
  bottomButton: {
    borderRadius: radius.md,
  },
});
