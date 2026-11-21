import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EllipsisIcon from '@/assets/icons/ellipsis.svg';
import { BackHeader } from '@/components/common/BackHeader';
import { colors, spacing, typography } from '@/theme';

import { BOARD_OPTIONS } from '../boards';
import { PostAuthorRow } from '../components/PostAuthorRow';
import { PostComments } from '../components/PostComments';
import type { GeneralPost } from '../types';

type GeneralPostDetailScreenProps = {
  post: GeneralPost;
  now?: string;
  /** 댓글 작성·삭제 등을 요청 중이면 true */
  busy?: boolean;
  /** 요청 실패 문구 */
  actionError?: string;
  onBack: () => void;
  /** 내 글일 때만 더보기 버튼을 보여 준다 (예: 삭제) */
  onPressMore?: () => void;
  /** 댓글 등록. 성공하면 true 를 돌려줘야 입력칸을 비운다 */
  onSubmitComment?: (content: string) => Promise<boolean>;
  /** 내 댓글 삭제 */
  onDeleteComment?: (commentId: string) => void;
};

/**
 * 후기·자유 글 상세. Figma 시안이 없어 파티원 모집 상세에서 모집 정보(요금 카드, 하단 버튼)를 뺀 형태.
 * 제목·작성자 줄·댓글은 파티 상세와 같은 부품을 쓴다.
 */
export function GeneralPostDetailScreen({
  post,
  now,
  busy = false,
  actionError,
  onBack,
  onPressMore,
  onSubmitComment,
  onDeleteComment,
}: GeneralPostDetailScreenProps) {
  const boardLabel = BOARD_OPTIONS.find((option) => option.value === post.board)?.label ?? '커뮤니티';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <BackHeader
        title={boardLabel}
        onBack={onBack}
        right={
          post.mine ? (
            <Pressable accessibilityRole="button" accessibilityLabel="더보기" hitSlop={8} onPress={onPressMore}>
              <EllipsisIcon width={22} height={22} />
            </Pressable>
          ) : undefined
        }
      />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.intro}>
            <Text style={styles.title}>{post.title}</Text>
            <PostAuthorRow authorName={post.authorName} createdAt={post.createdAt} viewCount={post.viewCount} now={now} />
          </View>

          <View style={styles.divider} />

          <Text style={styles.bodyContent}>{post.body.content}</Text>

          <PostComments
            comments={post.comments}
            commentCount={post.commentCount}
            now={now}
            busy={busy}
            onSubmitComment={onSubmitComment}
            onDeleteComment={onDeleteComment}
          />
        </ScrollView>

        {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
  },
  flex: {
    flex: 1,
  },
  content: {
    gap: 18,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  intro: {
    gap: spacing.md,
  },
  title: {
    ...typography.postDetailTitle,
    color: colors.textTitle,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  bodyContent: {
    ...typography.bodyRegular,
    color: colors.textSubtle,
  },
  actionError: {
    ...typography.small,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    textAlign: 'center',
    color: colors.danger,
  },
});
