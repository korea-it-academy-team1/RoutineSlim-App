import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import MessageCircleIcon from '@/assets/icons/message-circle-md.svg';
import { formStyles } from '@/components/ui/FormField';
import { colors, radius, shadows, spacing, typography } from '@/theme';
import { formatTimeAgo } from '@/utils/format';

import type { PostComment } from '../types';

/** 서버 제한: 댓글 1~1000자 */
const COMMENT_MAX_LENGTH = 1000;

type PostCommentsProps = {
  comments: PostComment[];
  commentCount: number;
  now?: string;
  /** 요청 중이면 true (등록·삭제 비활성화) */
  busy?: boolean;
  /** 비어 있을 때 문구 */
  emptyText?: string;
  onPressComments?: () => void;
  /** 댓글 등록. 성공하면 true 를 돌려줘야 입력칸을 비운다 */
  onSubmitComment?: (content: string) => Promise<boolean>;
  /** 내 댓글 삭제 */
  onDeleteComment?: (commentId: string) => void;
};

/** 게시글 상세의 댓글 영역 (제목, 목록, 입력칸). 모든 게시판이 같이 쓴다 */
export function PostComments({
  comments,
  commentCount,
  now,
  busy = false,
  emptyText = '아직 댓글이 없어요. 첫 댓글을 남겨보세요!',
  onPressComments,
  onSubmitComment,
  onDeleteComment,
}: PostCommentsProps) {
  const [comment, setComment] = useState('');
  const canSubmitComment = !!onSubmitComment && comment.trim().length > 0 && !busy;

  const submitComment = async () => {
    if (!canSubmitComment) return;
    if (await onSubmitComment(comment.trim())) setComment('');
  };

  return (
    <View style={styles.comments}>
      <Pressable
        accessibilityRole="button"
        disabled={!onPressComments}
        onPress={onPressComments}
        style={styles.commentsHeading}
      >
        <MessageCircleIcon width={16} height={16} />
        <Text style={styles.commentsTitle}>{`댓글 ${commentCount}`}</Text>
      </Pressable>

      {comments.length > 0 ? (
        comments.map((item) => (
          <View key={item.id} style={styles.commentCard}>
            <View style={styles.commentHeading}>
              <Text style={styles.commentMeta}>{`${item.authorName} · ${formatTimeAgo(item.createdAt, now)}`}</Text>
              {item.mine && onDeleteComment ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="댓글 삭제"
                  hitSlop={8}
                  disabled={busy}
                  onPress={() => onDeleteComment(item.id)}
                >
                  <Text style={styles.commentDelete}>삭제</Text>
                </Pressable>
              ) : null}
            </View>
            <Text style={styles.commentContent}>{item.content}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noComment}>{emptyText}</Text>
      )}

      {onSubmitComment ? (
        <View style={[formStyles.box, styles.commentInputBox]}>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="댓글을 입력해주세요"
            placeholderTextColor={colors.textPlaceholder}
            maxLength={COMMENT_MAX_LENGTH}
            multiline
            style={styles.commentInput}
            accessibilityLabel="댓글 입력"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmitComment }}
            disabled={!canSubmitComment}
            hitSlop={8}
            onPress={() => void submitComment()}
          >
            <Text style={[styles.commentSubmit, !canSubmitComment && styles.commentSubmitDisabled]}>등록</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  comments: {
    gap: spacing.sm,
  },
  commentsHeading: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentsTitle: {
    ...typography.listTitle,
    color: colors.textTitle,
  },
  commentCard: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    ...shadows.card,
  },
  commentHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  commentMeta: {
    ...typography.metaBold,
    flexShrink: 1,
    color: colors.textTitle,
  },
  commentDelete: {
    ...typography.meta,
    color: colors.textSubtle,
  },
  commentContent: {
    ...typography.captionSm,
    color: colors.textSubtle,
  },
  noComment: {
    ...typography.captionSm,
    color: colors.textSubtle,
  },
  commentInputBox: {
    alignItems: 'flex-end',
    paddingVertical: 10,
  },
  commentInput: {
    ...typography.formInput,
    flex: 1,
    minWidth: 0,
    maxHeight: 96,
    padding: 0,
    color: colors.textTitle,
  },
  commentSubmit: {
    ...typography.label14,
    color: colors.primary,
  },
  commentSubmitDisabled: {
    color: colors.textPlaceholder,
  },
});
