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

/*
 * [홈 구현 7/8] 목업 대신 props 로 받은 데이터 그리기 (전체 순서: docs/home-guide.md)
 *
 * 화면은 서버를 직접 부르지 않는다. 라우트(8번)가 훅(6번)으로 불러와 props 로 넘긴다.
 *
 * 할 일
 *   (1) props 추가
 *         summary: HomeSummary | null;   // 5번 homeSummary.ts
 *         loading?: boolean;
 *         errorMessage?: string;         // 있으면 오류 안내 + 다시 시도 버튼
 *         onRetry?: () => void;
 *   (2) 위 mock import 를 지우고 아래 JSX 의 값을 바꾼다
 *         <MonthlySummaryCard {...mockSummary} />  →  month, totalPrice, activeCount, description 을 summary 에서
 *         mockUpcomingSubscriptions.map(...)       →  summary.upcoming.map(({ subscription, dDay }) => ...)
 *                                                       badge 는 하드코딩 'D-1' 대신 dDay === 0 ? 'D-Day' : `D-${dDay}`
 *         `전체 ${mockSummary.activeCount}개 보기` →  summary.activeCount
 *         mockMySubscriptions.map(...)             →  summary.myList.map(...)
 *   (3) 상태별 화면 (PageHeader 와 FAB 는 항상 보이게, ScrollView 안쪽만 바꾼다)
 *         loading && !summary  → 가운데 ActivityIndicator (color 는 colors.primary)
 *         errorMessage         → 안내 문구 + "다시 시도" (components/ui/Button) → onRetry
 *         upcoming 이 비었으면 → "다가오는 결제" 카드 안에 "7일 안에 결제할 구독이 없어요" 한 줄
 *                                ("해지하면 얼마나 아낄까?" 버튼은 그대로 둔다)
 *         구독이 하나도 없으면 → "내 구독" 카드 대신 "+ 버튼으로 첫 구독을 추가해 보세요" 안내
 *       - 문구 색·글자는 theme 토큰(colors.textSubtle, typography.caption 등)을 쓴다. 하드코딩 금지
 *   (4) (선택) 당겨서 새로고침: ScrollView 에 refreshControl={<RefreshControl refreshing={loading} onRefresh={onRetry} />}
 *
 * 확인: summary 를 buildHomeSummary(mockSubscriptions, MOCK_TODAY) 로 넘겨서 그려 본다.
 *       총액·개수는 지금 화면과 같고, 다가오는 결제는 7일 기준이라 스포티파이(D-4)·디즈니+(D-7)가 더 나온다 (5번 주석 참고).
 */
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
