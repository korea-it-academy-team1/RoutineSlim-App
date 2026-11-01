import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ChevronDownIcon from '@/assets/icons/chevron-down.svg';
import SearchIcon from '@/assets/icons/search.svg';
import SquarePenIcon from '@/assets/icons/square-pen.svg';
import { PageHeader } from '@/components/common/PageHeader';
import { FAB_CONTENT_INSET, FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { colors, spacing, typography } from '@/theme';

import { BOARD_OPTIONS } from '../boards';
import { PartyPostCard } from '../components/PartyPostCard';
import { MOCK_NOW, mockPartyPosts } from '../data/mockPosts';
import type { CommunityBoard, PartyPost } from '../types';

type CommunityScreenProps = {
  onPressSearch?: () => void;
  onPressServiceFilter?: () => void;
  onPressSort?: () => void;
  onPressPost?: (post: PartyPost) => void;
  onPressWrite?: () => void;
};

export function CommunityScreen({
  onPressSearch,
  onPressServiceFilter,
  onPressSort,
  onPressPost,
  onPressWrite,
}: CommunityScreenProps) {
  const [board, setBoard] = useState<CommunityBoard>('party');
  // 후기·자유 게시판은 아직 시안이 없어 빈 목록
  const posts = board === 'party' ? mockPartyPosts : [];

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
              <SegmentedControl options={BOARD_OPTIONS} value={board} onChange={setBoard} />
              <View style={styles.filters}>
                <Pressable accessibilityRole="button" hitSlop={8} onPress={onPressServiceFilter} style={styles.serviceFilter}>
                  <Text style={styles.serviceFilterText}>전체 서비스</Text>
                  <ChevronDownIcon width={14} height={14} />
                </Pressable>
                <Pressable accessibilityRole="button" hitSlop={8} onPress={onPressSort}>
                  <Text style={styles.sort}>최신순 ↓</Text>
                </Pressable>
              </View>
            </View>
          }
          ListEmptyComponent={<Text style={styles.empty}>아직 게시글이 없어요</Text>}
          renderItem={({ item }) => <PartyPostCard post={item} now={MOCK_NOW} onPress={() => onPressPost?.(item)} />}
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
  empty: {
    ...typography.captionSm,
    paddingVertical: 48,
    textAlign: 'center',
    color: colors.textSubtle,
  },
});
