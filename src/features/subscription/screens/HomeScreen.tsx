import { Fragment } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BellIcon from '@/assets/icons/bell.svg';
import PlusIcon from '@/assets/icons/plus.svg';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionHeader } from '@/components/common/SectionHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { FAB_CONTENT_INSET, FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { colors, radius, spacing, typography } from '@/theme';

import { MonthlySummaryCard } from '../components/MonthlySummaryCard';
import { SubscriptionRow } from '../components/SubscriptionRow';
import type { HomeSummary } from '../utils/homeSummary';

type HomeScreenProps = {
  /** 처음 불러오기 전에는 null */
  summary: HomeSummary | null;
  loading?: boolean;
  /** 있으면 오류 안내 + 다시 시도 */
  errorMessage?: string;
  onRetry?: () => void;
  onPressNotifications?: () => void;
  onPressComparison?: () => void;
  onPressAllSubscriptions?: () => void;
  onPressAddSubscription?: () => void;
};

export function HomeScreen({
  summary,
  loading = false,
  errorMessage,
  onRetry,
  onPressNotifications,
  onPressComparison,
  onPressAllSubscriptions,
  onPressAddSubscription,
}: HomeScreenProps) {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <PageHeader
        title="루틴슬림"
        right={
          <Pressable accessibilityRole="button" accessibilityLabel="알림" hitSlop={8} onPress={onPressNotifications}>
            <BellIcon width={22} height={22} />
          </Pressable>
        }
      />

      <View style={styles.body}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={loading && !!summary} onRefresh={onRetry} />}
        >
          {errorMessage ? (
            <Card>
              <EmptyState
                title="구독 정보를 불러오지 못했어요"
                description={errorMessage}
                actionLabel="다시 시도"
                onPressAction={onRetry}
              />
            </Card>
          ) : null}

          {!summary ? (
            loading ? (
              <ActivityIndicator color={colors.primary} style={styles.loader} />
            ) : null
          ) : (
            <>
              <MonthlySummaryCard
                month={summary.month}
                totalPrice={summary.totalPrice}
                activeCount={summary.activeCount}
                description={summary.description}
              />

              <View style={styles.section}>
                <SectionHeader title="다가오는 결제" trailing="7일 이내" />
                <Card style={styles.upcomingCard}>
                  {summary.upcoming.length === 0 ? (
                    <>
                      <Text style={styles.emptyText}>7일 안에 결제할 구독이 없어요</Text>
                      <View style={styles.divider} />
                    </>
                  ) : (
                    summary.upcoming.map(({ subscription, dDay }) => (
                      <Fragment key={subscription.id}>
                        <SubscriptionRow subscription={subscription} badge={dDay === 0 ? 'D-Day' : `D-${dDay}`} />
                        <View style={styles.divider} />
                      </Fragment>
                    ))
                  )}
                  <Pressable accessibilityRole="button" onPress={onPressComparison} style={styles.comparisonCta}>
                    <Text style={styles.comparisonCtaText}>해지하면 얼마나 아낄까?</Text>
                  </Pressable>
                </Card>
              </View>

              <View style={styles.section}>
                <SectionHeader
                  title="내 구독"
                  trailing={`전체 ${summary.activeCount}개 보기 ›`}
                  onPressTrailing={onPressAllSubscriptions}
                />
                <Card style={styles.myCard}>
                  {summary.activeCount === 0 ? (
                    <EmptyState title="등록된 구독이 없어요" description="+ 버튼으로 첫 구독을 추가해 보세요" />
                  ) : (
                    summary.myList.map((subscription, index) => (
                      <Fragment key={subscription.id}>
                        {index > 0 ? <View style={styles.divider} /> : null}
                        <SubscriptionRow subscription={subscription} />
                      </Fragment>
                    ))
                  )}
                </Card>
              </View>
            </>
          )}
        </ScrollView>

        <FloatingActionButton
          accessibilityLabel="구독 추가"
          icon={<PlusIcon width={28} height={28} />}
          onPress={onPressAddSubscription}
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
  body: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: FAB_CONTENT_INSET,
  },
  section: {
    gap: 10,
  },
  loader: {
    marginTop: spacing.xxl,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textSubtle,
    textAlign: 'center',
  },
  upcomingCard: {
    gap: spacing.md,
  },
  myCard: {
    padding: 14,
    gap: 10,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  comparisonCta: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.ctaAccent,
    borderRadius: radius.pill,
    backgroundColor: colors.ctaDark,
  },
  comparisonCtaText: {
    ...typography.captionSmBold,
    color: colors.ctaAccent,
  },
});
