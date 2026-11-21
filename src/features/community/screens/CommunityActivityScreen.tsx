import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/common/BackHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { colors, spacing, typography } from '@/theme';

import { GeneralPostCard } from '../components/GeneralPostCard';
import { PartyPostCard } from '../components/PartyPostCard';
import type { CommunityPost } from '../types';

export type ActivityTab = 'mine' | 'commented' | 'joined';

const TABS: { value: ActivityTab; label: string }[] = [
  { value: 'mine', label: '내가 쓴 글' },
  { value: 'commented', label: '댓글 단 글' },
  { value: 'joined', label: '참여 중인 파티' },
];

const EMPTY: Record<ActivityTab, { title: string; description: string }> = {
  mine: { title: '아직 쓴 글이 없어요', description: '커뮤니티에서 파티원을 모집하거나 후기를 남겨 보세요.' },
  commented: { title: '댓글 단 글이 없어요', description: '궁금한 글에 댓글을 남기면 여기에 모여요.' },
  joined: { title: '참여 중인 파티가 없어요', description: '파티원 모집 글에서 참여 요청을 보내 보세요.' },
};

type CommunityActivityScreenProps = {
  tab: ActivityTab;
  onChangeTab: (tab: ActivityTab) => void;
  /** 지금 탭의 글 (서버). 불러오는 중이면 null */
  posts: CommunityPost[] | null;
  loadError?: string;
  onRetry?: () => void;
  now?: string;
  onBack: () => void;
  onPressPost: (post: CommunityPost) => void;
  /** 빈 상태에서 커뮤니티로 */
  onGoCommunity: () => void;
};

/** 마이 > 커뮤니티 활동. Figma 시안이 없어 커뮤니티 목록 카드를 그대로 쓴다 */
export function CommunityActivityScreen({
  tab,
  onChangeTab,
  posts,
  loadError,
  onRetry,
  now,
  onBack,
  onPressPost,
  onGoCommunity,
}: CommunityActivityScreenProps) {
  const renderBody = () => {
    if (loadError) {
      return (
        <EmptyState
          title="글을 불러오지 못했어요"
          description={loadError}
          actionLabel="다시 시도"
          onPressAction={onRetry}
        />
      );
    }
    if (posts === null) return <ActivityIndicator style={styles.loading} color={colors.primary} />;
    if (posts.length === 0) {
      return (
        <EmptyState
          title={EMPTY[tab].title}
          description={EMPTY[tab].description}
          actionLabel="커뮤니티 가기"
          onPressAction={onGoCommunity}
        />
      );
    }

    return posts.map((post) => (
      <View key={post.id} style={styles.item}>
        {post.board === 'party' ? (
          <>
            <ActivityNote post={post} tab={tab} />
            <PartyPostCard post={post} now={now} onPress={() => onPressPost(post)} />
          </>
        ) : (
          <GeneralPostCard post={post} now={now} onPress={() => onPressPost(post)} />
        )}
      </View>
    ));
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <BackHeader title="커뮤니티 활동" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <SegmentedControl options={TABS} value={tab} onChange={onChangeTab} />
        {renderBody()}
      </ScrollView>
    </SafeAreaView>
  );
}

/** 파티 글 카드 위 안내: 내 글이면 확인할 요청 수, 참여 탭이면 내 참여 상태 */
function ActivityNote({ post, tab }: { post: Extract<CommunityPost, { board: 'party' }>; tab: ActivityTab }) {
  if (post.mine && post.pendingRequestCount) {
    return (
      <View style={styles.note}>
        <Badge label={`참여 요청 ${post.pendingRequestCount}건`} />
        <Text style={styles.noteText}>눌러서 수락·거절해 주세요</Text>
      </View>
    );
  }
  if (tab === 'joined' && post.myPartyStatus) {
    return (
      <View style={styles.note}>
        <Badge
          label={post.myPartyStatus === 'accepted' ? '참여 중' : '수락 대기'}
          tone={post.myPartyStatus === 'accepted' ? 'positive' : 'neutral'}
        />
      </View>
    );
  }
  return null;
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
  item: {
    gap: spacing.sm,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  noteText: {
    ...typography.caption12,
    color: colors.textSubtle,
  },
});
