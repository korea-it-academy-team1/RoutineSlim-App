import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EllipsisIcon from '@/assets/icons/ellipsis.svg';
import MessageCircleIcon from '@/assets/icons/message-circle-md.svg';
import UserPlusIcon from '@/assets/icons/user-plus.svg';
import UserRoundIcon from '@/assets/icons/user-round.svg';
import { BackHeader } from '@/components/common/BackHeader';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formStyles } from '@/components/ui/FormField';
import { ServiceLogoView } from '@/features/subscription/components/ServiceLogoView';
import { colors, radius, shadows, spacing, typography } from '@/theme';
import { formatTimeAgo, formatWon } from '@/utils/format';

import type { PartyPost } from '../types';

/** 서버 제한: 댓글 1~1000자 */
const COMMENT_MAX_LENGTH = 1000;

type PartyPostDetailScreenProps = {
  post: PartyPost;
  now?: string;
  /** 댓글 작성·삭제, 모집 마감 등을 요청 중이면 true */
  busy?: boolean;
  /** 요청 실패 문구 */
  actionError?: string;
  onBack: () => void;
  /** 내 글일 때만 더보기 버튼을 보여 준다 (예: 삭제) */
  onPressMore?: () => void;
  onPressComments?: () => void;
  /** 다른 사람 글: 참여 요청 */
  onRequestJoin?: () => void;
  /** 내 글이고 모집 중일 때: 모집 마감 */
  onCloseRecruit?: () => void;
  /** 댓글 등록. 성공하면 true 를 돌려줘야 입력칸을 비운다 */
  onSubmitComment?: (content: string) => Promise<boolean>;
  /** 내 댓글 삭제 */
  onDeleteComment?: (commentId: string) => void;
};

export function PartyPostDetailScreen({
  post,
  now,
  busy = false,
  actionError,
  onBack,
  onPressMore,
  onPressComments,
  onRequestJoin,
  onCloseRecruit,
  onSubmitComment,
  onDeleteComment,
}: PartyPostDetailScreenProps) {
  const [comment, setComment] = useState('');
  const recruiting = post.status === 'recruiting';
  const isFull = post.currentMembers >= post.maxMembers;
  const canSubmitComment = !!onSubmitComment && comment.trim().length > 0 && !busy;

  const submitComment = async () => {
    if (!canSubmitComment) return;
    if (await onSubmitComment(comment.trim())) setComment('');
  };

  const renderFooterButton = () => {
    if (post.mine) {
      return recruiting ? (
        <Button size="md" variant="secondary" title="모집 마감하기" disabled={busy} onPress={onCloseRecruit} />
      ) : (
        <Button size="md" title="모집이 마감됐어요" disabled />
      );
    }
    return (
      <Button
        size="md"
        title={!recruiting || isFull ? '모집이 마감됐어요' : '참여 요청하기'}
        icon={recruiting && !isFull ? <UserPlusIcon width={20} height={20} /> : undefined}
        disabled={!recruiting || isFull}
        onPress={onRequestJoin}
      />
    );
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <BackHeader
        title="파티원 모집"
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
            <View style={styles.tags}>
              <Badge label={post.serviceName} />
              <Badge label={recruiting ? '모집 중' : '모집 완료'} tone={recruiting ? 'positive' : 'neutral'} />
            </View>
            <Text style={styles.title}>{post.title}</Text>
            <View style={styles.author}>
              <View style={styles.avatar}>
                <UserRoundIcon width={18} height={18} />
              </View>
              <Text style={styles.authorName}>{post.authorName}</Text>
              <Text style={styles.meta}>{`${formatTimeAgo(post.createdAt, now)} · 조회 ${post.viewCount}`}</Text>
            </View>
          </View>

          <Card style={styles.pricingCard}>
            <View style={styles.pricing}>
              <ServiceLogoView logo={post.serviceLogo} size="lg" />
              <View style={styles.pricingTexts}>
                <Text style={styles.pricingLabel}>1인당 월 구독료</Text>
                <Text style={styles.pricingAmount}>{formatWon(post.pricePerMember)}</Text>
              </View>
              <Badge label={`${post.currentMembers}/${post.maxMembers}명`} />
            </View>
            {post.totalPrice !== null || post.settlementDay !== null ? (
              <>
                <View style={styles.divider} />
                <View style={styles.terms}>
                  <Text style={styles.termsTotal}>
                    {post.totalPrice !== null ? `전체 ${formatWon(post.totalPrice)} / 월` : ''}
                  </Text>
                  <Text style={styles.termsSettlement}>
                    {post.settlementDay !== null ? `매월 ${post.settlementDay}일 정산` : ''}
                  </Text>
                </View>
              </>
            ) : null}
          </Card>

          <View style={styles.body}>
            <Text style={styles.bodyTitle}>{post.body.title}</Text>
            <Text style={styles.bodyContent}>{post.body.content}</Text>
          </View>

          <View style={styles.comments}>
            <Pressable
              accessibilityRole="button"
              disabled={!onPressComments}
              onPress={onPressComments}
              style={styles.commentsHeading}
            >
              <MessageCircleIcon width={16} height={16} />
              <Text style={styles.commentsTitle}>{`댓글 ${post.commentCount}`}</Text>
            </Pressable>

            {post.comments.length > 0 ? (
              post.comments.map((item) => (
                <View key={item.id} style={styles.commentCard}>
                  <View style={styles.commentHeading}>
                    <Text style={styles.commentMeta}>
                      {`${item.authorName} · ${formatTimeAgo(item.createdAt, now)}`}
                    </Text>
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
              <Text style={styles.noComment}>아직 댓글이 없어요. 궁금한 점을 남겨보세요!</Text>
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
        </ScrollView>

        <View style={styles.footer}>
          {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}
          {renderFooterButton()}
        </View>
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
  tags: {
    flexDirection: 'row',
    gap: 6,
  },
  title: {
    ...typography.postDetailTitle,
    color: colors.textTitle,
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  authorName: {
    ...typography.captionSmBold,
    flex: 1,
    color: colors.textTitle,
  },
  meta: {
    ...typography.micro,
    color: colors.textSubtle,
  },
  pricingCard: {
    gap: spacing.md,
    padding: 18,
  },
  pricing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pricingTexts: {
    flex: 1,
    gap: 3,
  },
  pricingLabel: {
    ...typography.meta,
    color: colors.textSubtle,
  },
  pricingAmount: {
    ...typography.amountPerPerson,
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  terms: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  termsTotal: {
    ...typography.meta,
    color: colors.textSubtle,
  },
  termsSettlement: {
    ...typography.metaBold,
    color: colors.textTitle,
  },
  body: {
    gap: 10,
  },
  bodyTitle: {
    ...typography.postTitle,
    color: colors.textTitle,
  },
  bodyContent: {
    ...typography.bodyRegular,
    color: colors.textSubtle,
  },
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
  actionError: {
    ...typography.small,
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colors.danger,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
});
