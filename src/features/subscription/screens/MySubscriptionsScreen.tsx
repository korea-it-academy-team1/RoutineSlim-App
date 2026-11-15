import { Fragment, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/common/BackHeader';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { colors, spacing, typography } from '@/theme';
import { formatWon } from '@/utils/format';

import { SubscriptionRow } from '../components/SubscriptionRow';
import type { Subscription } from '../types';

type Tab = 'using' | 'paused' | 'canceled';

const TAB_STATUSES: Record<Tab, Subscription['status'][]> = {
  using: ['ACTIVE', 'TRIAL'],
  paused: ['PAUSED'],
  canceled: ['CANCELED'],
};

const EMPTY_TEXT: Record<Tab, string> = {
  using: '이용 중인 구독이 없어요',
  paused: '일시정지한 구독이 없어요',
  canceled: '해지한 구독이 없어요',
};

/** 목록 행 오른쪽 배지 */
const STATUS_BADGE: Partial<Record<Subscription['status'], string>> = {
  TRIAL: '체험판',
  PAUSED: '일시정지',
  CANCELED: '해지',
};

type MySubscriptionsScreenProps = {
  /** 모든 상태의 구독 (서버). 불러오는 중이면 null */
  subscriptions: Subscription[] | null;
  loadError?: string;
  onRetry?: () => void;
  onBack: () => void;
  onAdd: () => void;
  onPressSubscription: (id: string) => void;
};

export function MySubscriptionsScreen({
  subscriptions,
  loadError,
  onRetry,
  onBack,
  onAdd,
  onPressSubscription,
}: MySubscriptionsScreenProps) {
  const [tab, setTab] = useState<Tab>('using');

  const byTab = useMemo(() => {
    const all = subscriptions ?? [];
    const pick = (t: Tab) => all.filter((s) => TAB_STATUSES[t].includes(s.status));
    return { using: pick('using'), paused: pick('paused'), canceled: pick('canceled') };
  }, [subscriptions]);

  const using = byTab.using;
  const monthlyTotal = using.reduce((sum, s) => sum + s.monthlyPrice, 0);
  const list = byTab[tab];

  const tabOptions = [
    { value: 'using' as const, label: `이용 중 ${byTab.using.length}` },
    { value: 'paused' as const, label: `일시정지 ${byTab.paused.length}` },
    { value: 'canceled' as const, label: `해지 ${byTab.canceled.length}` },
  ];

  const renderList = () => {
    if (loadError) {
      return (
        <EmptyState
          title="구독을 불러오지 못했어요"
          description={loadError}
          actionLabel="다시 시도"
          onPressAction={onRetry}
        />
      );
    }
    if (subscriptions === null) return <ActivityIndicator style={styles.loading} color={colors.primary} />;
    if (list.length === 0) {
      return tab === 'using' ? (
        <EmptyState title={EMPTY_TEXT[tab]} actionLabel="구독 추가하기" onPressAction={onAdd} />
      ) : (
        <EmptyState title={EMPTY_TEXT[tab]} />
      );
    }
    return (
      <Card style={styles.listCard}>
        {list.map((subscription, index) => (
          <Fragment key={subscription.id}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <SubscriptionRow
              subscription={subscription}
              badge={STATUS_BADGE[subscription.status]}
              onPress={() => onPressSubscription(subscription.id)}
            />
          </Fragment>
        ))}
      </Card>
    );
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <BackHeader
        title="내 구독 관리"
        onBack={onBack}
        right={
          <Pressable accessibilityRole="button" accessibilityLabel="구독 추가" hitSlop={8} onPress={onAdd}>
            <Text style={styles.addText}>추가</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeading}>
            <Text style={styles.summaryLabel}>이용 중인 구독</Text>
            <Text style={styles.summaryCount}>{subscriptions === null ? '' : `${using.length}개`}</Text>
          </View>
          <Text style={styles.summaryTotal}>{subscriptions === null ? '—' : formatWon(monthlyTotal)}</Text>
          <Text style={styles.summaryNote}>월 환산 금액 합계 (연 결제는 12로 나눠 계산)</Text>
        </Card>

        <SegmentedControl options={tabOptions} value={tab} onChange={setTab} />

        {renderList()}

        {tab !== 'using' && list.length > 0 ? (
          <Text style={styles.note}>
            {tab === 'paused'
              ? '일시정지한 구독은 결제 예정에서 빠져요. 구독을 눌러 다시 시작할 수 있어요.'
              : '해지한 구독도 지난 결제 기록은 통계·캘린더에 남아요.'}
          </Text>
        ) : null}
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
  addText: {
    ...typography.label14,
    color: colors.primary,
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
  // 캘린더 '가장 가까운 결제' 카드와 같은 간격: 카드 기본 패딩 + 행·구분선 사이 gap
  listCard: {
    gap: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  loading: {
    paddingVertical: spacing.xxl,
  },
  note: {
    ...typography.meta,
    textAlign: 'center',
    color: colors.textSubtle,
  },
});
