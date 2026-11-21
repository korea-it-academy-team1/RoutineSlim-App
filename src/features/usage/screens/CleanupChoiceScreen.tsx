import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowRightIcon from '@/assets/icons/arrow-right.svg';
import { BackHeader } from '@/components/common/BackHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import type { Subscription } from '@/features/subscription/types';
import { colors, spacing, typography } from '@/theme';
import { formatWon } from '@/utils/format';

import type { UsageCheckDto } from '../api/usageApi';
import { CleanupChoiceCard } from '../components/CleanupChoiceCard';
import { NO_CLEANUP_OPTIONS } from '../types';
import { getCleanupChoices, getDefaultAction, type CleanupAction } from '../utils/cleanupPlan';
import { describeCheck } from '../utils/usageLevels';

export type CleanupSelection = Record<string, CleanupAction>;

type CleanupChoiceScreenProps = {
  /** 이용 중인 구독 (서버). route 가 다 불러온 뒤에 그린다 */
  subscriptions: Subscription[];
  /** 사용량 체크 (서버) */
  checks: UsageCheckDto[];
  /** 정리 후보 구독 id (사용량 점검에서 '거의 안 씀'·'안 씀') */
  subscriptionIds: string[];
  onBack: () => void;
  onCompare?: (selection: CleanupSelection) => void;
};

/**
 * 정리 방법 선택 (2/3). 후보마다 해지·저렴한 요금제·파티원 모집·그대로 두기 중에서 고른다.
 * 요금제·파티 정보 API 가 아직 없어 지금은 '해지하기'·'그대로 두기'만 나온다 (types.ts NO_CLEANUP_OPTIONS).
 * selection 첫 값을 후보로 정하므로 route 는 구독·체크를 다 불러온 뒤에 이 화면을 그려야 한다.
 */
export function CleanupChoiceScreen({
  subscriptions,
  checks,
  subscriptionIds,
  onBack,
  onCompare,
}: CleanupChoiceScreenProps) {
  const candidates = useMemo(() => {
    const checkOf = new Map(checks.map((c) => [c.subscriptionId, c]));
    return (
      subscriptions
        // 해지·일시정지 등으로 이용 중이 아니게 된 구독은 빠진다
        .filter((s) => subscriptionIds.includes(s.id))
        // 절약 폭이 큰(금액이 큰) 구독부터
        .sort((a, b) => b.monthlyPrice - a.monthlyPrice)
        .map((subscription) => {
          const info = NO_CLEANUP_OPTIONS[subscription.id];
          return {
            subscription,
            info,
            usageLabel: describeCheck(checkOf.get(subscription.id)),
            choices: getCleanupChoices(subscription, info),
          };
        })
    );
  }, [subscriptions, checks, subscriptionIds]);

  const [selection, setSelection] = useState<CleanupSelection>(() =>
    Object.fromEntries(candidates.map(({ subscription, info }) => [subscription.id, getDefaultAction(info)])),
  );

  const totalBefore = subscriptions.reduce((sum, s) => sum + s.monthlyPrice, 0);
  const saving = candidates.reduce((sum, { subscription, choices }) => {
    const choice = choices.find((c) => c.action === selection[subscription.id]);
    return sum + (choice ? subscription.monthlyPrice - choice.newPrice : 0);
  }, 0);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <BackHeader title="정리 방법 선택" onBack={onBack} right={<Text style={styles.step}>2/3</Text>} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.title}>어떻게 정리할까요?</Text>
          <Text style={styles.subtitle}>서비스마다 해지, 저렴한 요금제, 파티원 모집 중에서 고를 수 있어요.</Text>
        </View>

        {candidates.length === 0 ? (
          <EmptyState
            title="정리할 구독이 없어요"
            description="사용량 점검에서 '거의 안 씀'·'안 씀'으로 체크한 구독이 여기에 나와요."
          />
        ) : null}

        {candidates.map(({ subscription, info, usageLabel, choices }) => (
          <CleanupChoiceCard
            key={subscription.id}
            subscription={subscription}
            usageLabel={usageLabel}
            choices={choices}
            selected={selection[subscription.id]}
            onSelect={(action) => setSelection((prev) => ({ ...prev, [subscription.id]: action }))}
            cancelNote={info?.cancelNote}
          />
        ))}
      </ScrollView>

      <View style={styles.bottomAction}>
        <View style={styles.savings}>
          <View style={styles.savingsTexts}>
            <Text style={styles.savingsLabel}>선택한 대로 정리하면</Text>
            <Text style={styles.savingsTotal}>
              {'월 '}
              <Text style={styles.savingsAmount}>{formatWon(saving)}</Text>
              {' 절약'}
            </Text>
          </View>
          <Text style={styles.beforeAfter}>
            {`${formatWon(totalBefore)} → `}
            <Text style={styles.after}>{formatWon(totalBefore - saving)}</Text>
          </Text>
        </View>
        <Button
          size="md"
          title="전후 비교 보기"
          trailingIcon={<ArrowRightIcon width={18} height={18} />}
          disabled={candidates.length === 0}
          onPress={() => onCompare?.(selection)}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
  },
  step: {
    ...typography.body13Medium,
    color: colors.textSubtle,
  },
  content: {
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  intro: {
    gap: 6,
    paddingBottom: spacing.xs,
  },
  title: {
    ...typography.titleLg,
    color: colors.textTitle,
  },
  subtitle: {
    ...typography.body14,
    color: colors.textSubtle,
  },
  bottomAction: {
    gap: 14,
    paddingTop: 18,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.white,
  },
  savings: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  savingsTexts: {
    gap: 2,
  },
  savingsLabel: {
    ...typography.body13,
    color: colors.textSubtle,
  },
  savingsTotal: {
    ...typography.savingsTotal,
    color: colors.textTitle,
  },
  savingsAmount: {
    color: colors.primary,
  },
  beforeAfter: {
    ...typography.body13,
    color: colors.textBody,
  },
  after: {
    fontWeight: '700',
    color: colors.textTitle,
  },
  button: {
    gap: 6,
  },
});
