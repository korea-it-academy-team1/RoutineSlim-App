import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChevronLeft from '@/assets/icons/chevron-left-small.svg';
import ChevronRight from '@/assets/icons/chevron-right-small.svg';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionHeader } from '@/components/common/SectionHeader';
import type { MonthKind } from '@/features/payment/utils/monthlyPayments';
import { CATEGORY_META } from '@/features/subscription/categories';
import { colors, spacing, typography } from '@/theme';
import { withSubjectParticle } from '@/utils/format';

import { CategoryBreakdownCard } from '../components/CategoryBreakdownCard';
import { CategorySpendingCard } from '../components/CategorySpendingCard';
import { formatPercent, summarizeByCategory, type StatsItem } from '../utils/summarizeByCategory';

/** 달 종류별 문구 */
const MONTH_TEXT: Record<MonthKind, { caption: string; note?: string; empty: string }> = {
  past: { caption: '결제한 구독료', empty: '이 달에는 결제한 구독이 없어요' },
  current: {
    caption: '이번 달 총 구독료',
    note: '이미 결제한 금액과 남은 결제 예정 금액을 합친 값이에요.',
    empty: '이번 달에는 결제할 구독이 없어요',
  },
  future: {
    caption: '결제 예정 구독료',
    note: '지금 이용 중인 구독 기준 예상 금액이에요.',
    empty: '이 달에는 결제 예정인 구독이 없어요',
  },
};

type StatsScreenProps = {
  year: number;
  month: number;
  kind: MonthKind;
  /** 그 달 구독별 결제 금액. 불러오는 중이면 null */
  items: StatsItem[] | null;
  /** 불러오기 실패 안내 */
  errorMessage?: string;
  onRetry?: () => void;
  /** -1 이전 달, 1 다음 달 */
  onChangeMonth: (delta: number) => void;
};

export function StatsScreen({ year, month, kind, items, errorMessage, onRetry, onChangeMonth }: StatsScreenProps) {
  const summary = useMemo(() => summarizeByCategory(items ?? []), [items]);
  const text = MONTH_TEXT[kind];

  const top = summary.categories.reduce<(typeof summary.categories)[number] | null>(
    (max, c) => (!max || c.total > max.total ? c : max),
    null,
  );

  const renderBody = () => {
    if (errorMessage) {
      return (
        <EmptyState
          title="통계를 불러오지 못했어요"
          description={errorMessage}
          actionLabel="다시 시도"
          onPressAction={onRetry}
        />
      );
    }
    if (items === null) {
      return <ActivityIndicator style={styles.loading} color={colors.primary} />;
    }
    if (items.length === 0) {
      return <EmptyState title={text.empty} />;
    }
    return (
      <>
        <CategorySpendingCard
          total={summary.total}
          count={summary.count}
          categories={summary.categories}
          caption={text.caption}
        />

        <View style={styles.section}>
          <SectionHeader title="카테고리별 구독" trailing="월 결제 금액" />
          <CategoryBreakdownCard categories={summary.categories} />
        </View>

        {top ? (
          <Text style={styles.insight}>
            {`${withSubjectParticle(CATEGORY_META[top.category].label)} 전체 구독료의 ${formatPercent(top.ratio)}를 차지해요.`}
          </Text>
        ) : null}
        {text.note ? <Text style={styles.insight}>{text.note}</Text> : null}
      </>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <PageHeader title="통계" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.monthSelector}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="이전 달"
            hitSlop={10}
            onPress={() => onChangeMonth(-1)}
          >
            <ChevronLeft width={18} height={18} />
          </Pressable>
          <Text style={styles.monthTitle}>{`${year}년 ${month}월`}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="다음 달"
            hitSlop={10}
            onPress={() => onChangeMonth(1)}
          >
            <ChevronRight width={18} height={18} />
          </Pressable>
        </View>

        {renderBody()}
      </ScrollView>
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
  monthSelector: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
  },
  monthTitle: {
    ...typography.sectionTitle,
    color: colors.textTitle,
  },
  section: {
    gap: 10,
  },
  insight: {
    ...typography.meta,
    textAlign: 'center',
    color: colors.textSubtle,
  },
  loading: {
    paddingVertical: spacing.xxl,
  },
});
