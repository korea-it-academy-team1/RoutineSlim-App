import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChevronDownIcon from '@/assets/icons/chevron-down.svg';
import SearchIcon from '@/assets/icons/search.svg';
import SquarePenIcon from '@/assets/icons/square-pen.svg';
import { EmptyState } from '@/components/common/EmptyState';
import { PageHeader } from '@/components/common/PageHeader';
import { FAB_CONTENT_INSET, FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { colors, spacing, typography } from '@/theme';

import { BOARD_OPTIONS } from '../boards';
import { PartyPostCard } from '../components/PartyPostCard';
import type { CommunityBoard, PartyPost } from '../types';

type CommunityScreenProps = {
  /** 선택한 게시판. 게시판별로 서버에서 불러오도록 route 가 상태를 가진다 */
  board: CommunityBoard;
  onChangeBoard: (board: CommunityBoard) => void;
  /** 파티원 모집 게시글 (서버). 불러오는 중이면 null */
  partyPosts: PartyPost[] | null;
  /** 불러오기 실패 문구. 있으면 목록 대신 '다시 시도' 안내 */
  errorMessage?: string;
  onRetry?: () => void;
  onPressSearch?: () => void;
  onPressServiceFilter?: () => void;
  onPressSort?: () => void;
  onPressPost?: (post: PartyPost) => void;
  onPressWrite?: () => void;
};

export function CommunityScreen({
  board,
  onChangeBoard,
  partyPosts,
  errorMessage,
  onRetry,
  onPressSearch,
  onPressServiceFilter,
  onPressSort,
  onPressPost,
  onPressWrite,
}: CommunityScreenProps) {
  const isParty = board === 'party';
  // 후기·자유 게시판은 아직 시안(카드 디자인)이 없어 빈 목록
  const posts = isParty ? (partyPosts ?? []) : [];
  const now = new Date().toISOString();

  const renderEmpty = () => {
    if (!isParty) return <EmptyState title="후기·자유 게시판은 준비 중이에요" />;
    if (errorMessage) {
      return (
        <EmptyState
          title="게시글을 불러오지 못했어요"
          description={errorMessage}
          actionLabel="다시 시도"
          onPressAction={onRetry}
        />
      );
    }
    if (partyPosts === null) return <ActivityIndicator style={styles.loading} color={colors.primary} />;
    return <Text style={styles.empty}>아직 게시글이 없어요</Text>;
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <PageHeader
        title="커뮤니티"
        right={
          <Pressable accessibilityRole="button" accessibilityLabel="검색" hitSlop={8} onPress={onPressSearch}>
            <SearchIcon width={22} height={22} />
          </Pressable>
        }
      />

      <View style={styles.body}>
        <FlatList
          data={posts}
          keyExtractor={(post) => post.id}
          contentContainerStyle={styles.content}
          ItemSeparatorComponent={Separator}
          ListHeaderComponent={
            <View style={styles.header}>
              <SegmentedControl options={BOARD_OPTIONS} value={board} onChange={onChangeBoard} />
              {isParty ? (
                <View style={styles.filters}>
                  <Pressable
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={onPressServiceFilter}
                    style={styles.serviceFilter}
                  >
                    <Text style={styles.serviceFilterText}>전체 서비스</Text>
                    <ChevronDownIcon width={14} height={14} />
                  </Pressable>
                  <Pressable accessibilityRole="button" hitSlop={8} onPress={onPressSort}>
                    <Text style={styles.sort}>최신순 ↓</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          }
          ListEmptyComponent={renderEmpty()}
          renderItem={({ item }) => <PartyPostCard post={item} now={now} onPress={() => onPressPost?.(item)} />}
        />

        <FloatingActionButton
          accessibilityLabel="글쓰기"
          icon={<SquarePenIcon width={24} height={24} />}
          onPress={onPressWrite}
        />
      </View>
    </SafeAreaView>
  );
}

function Separator() {
  return <View style={styles.separator} />;
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
    paddingTop: 6,
    paddingHorizontal: spacing.xl,
    paddingBottom: FAB_CONTENT_INSET,
  },
  header: {
    gap: 10,
    marginBottom: 10,
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  serviceFilterText: {
    ...typography.captionSmBold,
    color: colors.textTitle,
  },
  sort: {
    ...typography.meta,
    color: colors.textSubtle,
  },
  separator: {
    height: 10,
  },
  loading: {
    paddingVertical: 48,
  },
  empty: {
    ...typography.captionSm,
    paddingVertical: 48,
    textAlign: 'center',
    color: colors.textSubtle,
  },
});
