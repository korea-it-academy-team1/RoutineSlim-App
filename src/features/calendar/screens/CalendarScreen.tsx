import { Fragment, useMemo, useState } from 'react';
import { ActivityIndicator, LayoutAnimation, Pressable, ScrollView, StyleSheet, Text, View, type TextStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CalendarIcon from '@/assets/icons/calendar.svg';
import ChevronLeft from '@/assets/icons/chevron-left-muted.svg';
import ChevronRight from '@/assets/icons/chevron-right-muted.svg';
import CollapseIcon from '@/assets/icons/collapse.svg';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionHeader } from '@/components/common/SectionHeader';
import { groupByDate, type MonthKind, type MonthPayment } from '@/features/payment/utils/monthlyPayments';
import { SubscriptionRow } from '@/features/subscription/components/SubscriptionRow';
import type { Subscription } from '@/features/subscription/types';
import { findNextPayments } from '@/features/subscription/utils/renewal';
import { useVerticalSwipe } from '@/hooks/useVerticalSwipe';
import { colors, radius, spacing, typography } from '@/theme';
import { parseDateKey, todayKey, type DateKey } from '@/utils/date';
import { formatMonthDay, formatRelativeDay, formatWon } from '@/utils/format';

import { DayPaymentsSheet } from '../components/DayPaymentsSheet';
import { ExpandedMonthCalendar } from '../components/ExpandedMonthCalendar';
import { MonthCalendar } from '../components/MonthCalendar';

const NO_SUBSCRIPTIONS: Subscription[] = [];

/** 요약 카드 문구. 지난달은 실제 결제 내역, 이번 달은 결제 완료 + 예정, 다음 달 이후는 예정 */
function summaryLabel(kind: MonthKind, month: number) {
  if (kind === 'past') return `${month}월 결제 내역`;
  if (kind === 'current') return '이번 달 결제';
  return `${month}월 결제 예정`;
}

type CalendarScreenProps = {
  /** 지금 이용 중인 구독 (해지·일시정지 제외). '가장 가까운 결제' 에 쓴다 */
  subscriptions: Subscription[];
  /** 보고 있는 달 */
  year: number;
  month: number;
  kind: MonthKind;
  /** 그 달 결제 목록 (청구 기록 + 예정, features/payment/utils/monthlyPayments.ts). 불러오는 중이면 null */
  monthPayments: MonthPayment[] | null;
  /** 불러오기 실패 안내 */
  errorMessage?: string;
  onRetry?: () => void;
  /** -1 이전 달, 1 다음 달 */
  onChangeMonth: (delta: number) => void;
  /** 기준 '오늘'. 기본값은 기기 날짜 */
  today?: DateKey;
  /** 처음부터 결제 시트를 열어 둘 날짜 (딥링크 등) */
  initialSelectedDate?: DateKey;
  /** 확장(날짜별 금액) 보기로 시작 */
  initialExpanded?: boolean;
};

export function CalendarScreen({
  subscriptions,
  year,
  month,
  kind,
  monthPayments,
  errorMessage,
  onRetry,
  onChangeMonth,
  today = todayKey(),
  initialSelectedDate,
  initialExpanded = false,
}: CalendarScreenProps) {
  const [selectedDate, setSelectedDate] = useState<DateKey | null>(initialSelectedDate ?? null);
  const [expanded, setExpanded] = useState(initialExpanded);

  const byDate = useMemo(() => groupByDate(monthPayments ?? []), [monthPayments]);
  const renewals = useMemo(
    () => new Map([...byDate].map(([date, list]) => [date, list.map((p) => p.subscription)])),
    [byDate],
  );
  const renewalCounts = useMemo(
    () => new Map([...renewals].map(([date, subs]) => [date, subs.length])),
    [renewals],
  );
  const monthCount = monthPayments?.length ?? 0;
  const monthlyTotal = (monthPayments ?? []).reduce((sum, p) => sum + p.subscription.price, 0);
  const nextPayments = findNextPayments(subscriptions, today);
  const label = summaryLabel(kind, month);

  // 고른 날이 지났거나 그날 결제가 모두 청구 기록이면 '결제 완료'
  const selectedPayments = selectedDate ? byDate.get(selectedDate) : undefined;
  const selectedPaid =
    selectedDate !== null && (selectedDate < today || (!!selectedPayments && selectedPayments.every((p) => p.paid)));

  const moveMonth = (delta: number) => onChangeMonth(delta);

  // 요약 금액 자리: 불러오는 중 / 실패 / 합계
  const renderTotal = (style: TextStyle) => {
    if (errorMessage) {
      return (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onRetry}>
          <Text style={styles.summaryError}>{`${errorMessage} 다시 시도`}</Text>
        </Pressable>
      );
    }
    if (monthPayments === null) return <ActivityIndicator color={colors.primary} />;
    return <Text style={style}>{formatWon(monthlyTotal)}</Text>;
  };
  const toggleExpanded = (next: boolean) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(next);
  };

  // 기본 보기: 달력을 아래로 쓸어내리면 확장 / 확장 보기: 위로 쓸어올리면 원래대로
  const expandSwipe = useVerticalSwipe({ onSwipeDown: () => toggleExpanded(true) });
  const collapseSwipe = useVerticalSwipe({ onSwipeUp: () => toggleExpanded(false) });

  const header = (
    <PageHeader
      title="캘린더"
      right={
        expanded ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="달력 접기"
            hitSlop={6}
            onPress={() => toggleExpanded(false)}
            style={styles.collapseButton}
          >
            <CollapseIcon width={15.8} height={15.8} />
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="달력 펼치기"
            hitSlop={8}
            onPress={() => toggleExpanded(true)}
          >
            <CalendarIcon width={22} height={22} />
          </Pressable>
        )
      }
    />
  );

  const sheet = (
    <DayPaymentsSheet
      date={selectedDate}
      subscriptions={selectedDate ? (renewals.get(selectedDate) ?? NO_SUBSCRIPTIONS) : NO_SUBSCRIPTIONS}
      paid={selectedPaid}
      onClose={() => setSelectedDate(null)}
    />
  );

  if (expanded) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {header}
        <View style={styles.expandedContent}>
          <View style={styles.expandedMonthSelector}>
            <Pressable accessibilityRole="button" accessibilityLabel="이전 달" hitSlop={10} onPress={() => moveMonth(-1)}>
              <ChevronLeft width={20} height={20} />
            </Pressable>
            <Text style={styles.expandedMonthTitle}>{`${year}년 ${month}월`}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="다음 달" hitSlop={10} onPress={() => moveMonth(1)}>
              <ChevronRight width={20} height={20} />
            </Pressable>
          </View>

          <View style={styles.compactSummary}>
            <Text style={styles.compactSummaryLabel}>{label}</Text>
            <View style={styles.compactSummaryBadge}>
              <Text style={styles.compactSummaryBadgeText}>{`${monthCount}개 구독`}</Text>
            </View>
            {renderTotal(styles.compactSummaryTotal)}
          </View>

          <View style={styles.expandedCalendar} {...collapseSwipe}>
            <ExpandedMonthCalendar
              year={year}
              month={month}
              today={today}
              selectedDate={selectedDate}
              renewals={renewals}
              onPressDay={setSelectedDate}
            />
          </View>

          <View style={styles.legend}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>{kind === 'past' ? '결제일' : '결제 예정일'}</Text>
            <View style={styles.legendToday} />
            <Text style={styles.legendText}>{`오늘 ${parseDateKey(today).day}일`}</Text>
          </View>
        </View>
        {sheet}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {header}

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeading}>
            <Text style={styles.summaryLabel}>{label}</Text>
            <Text style={styles.summaryCount}>{`${monthCount}개 구독`}</Text>
          </View>
          {renderTotal(styles.summaryTotal)}
        </Card>

        <View {...expandSwipe}>
          <MonthCalendar
            year={year}
            month={month}
            today={today}
            selectedDate={selectedDate}
            renewalCounts={renewalCounts}
            onPrevMonth={() => moveMonth(-1)}
            onNextMonth={() => moveMonth(1)}
            onPressDay={setSelectedDate}
          />
        </View>

        {nextPayments ? (
          <View style={styles.section}>
            <SectionHeader
              title="가장 가까운 결제"
              trailing={`${formatRelativeDay(nextPayments.date, today)} · ${formatMonthDay(nextPayments.date)}`}
            />
            <Card style={styles.nextCard}>
              {nextPayments.subscriptions.map((subscription, index) => (
                <Fragment key={subscription.id}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <SubscriptionRow subscription={subscription} />
                </Fragment>
              ))}
            </Card>
          </View>
        ) : null}
      </ScrollView>

      {sheet}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
  },
  content: {
    gap: 14,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  summaryCard: {
    gap: 5,
  },
  summaryHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    ...typography.caption,
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
  section: {
    gap: 10,
  },
  nextCard: {
    gap: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },

  // 확장 보기
  collapseButton: {
    width: 37,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18.5,
    backgroundColor: colors.white,
  },
  expandedContent: {
    flex: 1,
    gap: 11,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  expandedMonthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  expandedMonthTitle: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
  },
  compactSummary: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
  },
  compactSummaryLabel: {
    ...typography.bodySm,
    color: colors.textMuted,
  },
  compactSummaryBadge: {
    height: 22,
    paddingHorizontal: 9,
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
  },
  compactSummaryBadgeText: {
    ...typography.badge,
    color: colors.primary,
  },
  compactSummaryTotal: {
    ...typography.monthTitle,
    flex: 1,
    textAlign: 'right',
    color: colors.textPrimary,
  },
  expandedCalendar: {
    flex: 1,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primary,
  },
  legendToday: {
    width: 12,
    height: 12,
    marginLeft: 4,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  legendText: {
    ...typography.tiny,
    color: colors.textMuted,
  },
  summaryError: {
    ...typography.small,
    color: colors.danger,
  },
});
