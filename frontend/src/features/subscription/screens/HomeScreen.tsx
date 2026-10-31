import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BellIcon from '@/assets/icons/bell.svg';
import PlusIcon from '@/assets/icons/plus.svg';
import { Card } from '@/components/common/Card';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionHeader } from '@/components/common/SectionHeader';
import { FAB_CONTENT_INSET, FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { colors, radius, spacing, typography } from '@/theme';

import { MonthlySummaryCard } from '../components/MonthlySummaryCard';
import { SubscriptionRow } from '../components/SubscriptionRow';
import { mockMySubscriptions, mockSummary, mockUpcomingSubscriptions } from '../data/mockSubscriptions';

type HomeScreenProps = {
  onPressNotifications?: () => void;
  onPressComparison?: () => void;
  onPressAllSubscriptions?: () => void;
  onPressAddSubscription?: () => void;
};

export function HomeScreen({
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
        <ScrollView contentContainerStyle={styles.content}>
          <MonthlySummaryCard {...mockSummary} />

          <View style={styles.section}>
            <SectionHeader title="다가오는 결제" trailing="7일 이내" />
            <Card style={styles.upcomingCard}>
              {mockUpcomingSubscriptions.map((subscription) => (
                <Fragment key={subscription.id}>
                  <SubscriptionRow subscription={subscription} badge="D-1" />
                  <View style={styles.divider} />
                </Fragment>
              ))}
              <Pressable accessibilityRole="button" onPress={onPressComparison} style={styles.comparisonCta}>
                <Text style={styles.comparisonCtaText}>해지하면 얼마나 아낄까?</Text>
              </Pressable>
            </Card>
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="내 구독"
              trailing={`전체 ${mockSummary.activeCount}개 보기 ›`}
              onPressTrailing={onPressAllSubscriptions}
            />
            <Card style={styles.myCard}>
              {mockMySubscriptions.map((subscription, index) => (
                <Fragment key={subscription.id}>
                  {index > 0 ? <View style={styles.divider} /> : null}
                  <SubscriptionRow subscription={subscription} />
                </Fragment>
              ))}
            </Card>
          </View>
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
