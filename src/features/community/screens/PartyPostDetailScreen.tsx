import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EllipsisIcon from '@/assets/icons/ellipsis.svg';
import UserPlusIcon from '@/assets/icons/user-plus.svg';
import { BackHeader } from '@/components/common/BackHeader';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ServiceLogoView } from '@/features/subscription/components/ServiceLogoView';
import { colors, spacing, typography } from '@/theme';
import { formatWon } from '@/utils/format';

import { PartyRequestList } from '../components/PartyRequestList';
import { PostAuthorRow } from '../components/PostAuthorRow';
import { PostComments } from '../components/PostComments';
import type { PartyPost, PartyRequest } from '../types';

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
  /** 다른 사람 글: 요청 취소 / 파티 나가기 */
  onCancelJoin?: () => void;
  /** 내 글: 참여 요청 목록 */
  partyRequests?: PartyRequest[];
  /** 내 글: 참여 요청 수락·거절 */
  onDecideRequest?: (requestId: string, status: 'ACCEPTED' | 'REJECTED') => void;
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
  onCancelJoin,
  partyRequests = [],
  onDecideRequest,
  onCloseRecruit,
  onSubmitComment,
  onDeleteComment,
}: PartyPostDetailScreenProps) {
  const recruiting = post.status === 'recruiting';
  const isFull = post.currentMembers >= post.maxMembers;

  const renderFooterButton = () => {
    if (post.mine) {
      return recruiting ? (
        <Button size="md" variant="secondary" title="모집 마감하기" disabled={busy} onPress={onCloseRecruit} />
      ) : (
        <Button size="md" title="모집이 마감됐어요" disabled />
      );
    }
    // 이미 요청했거나 참여 중이면 마감 여부와 상관없이 취소·나가기를 할 수 있다
    if (post.myPartyStatus === 'requested') {
      return (
        <>
          <Text style={styles.joinStatus}>참여를 요청했어요. 작성자가 수락하면 파티원이 돼요.</Text>
          <Button size="md" variant="secondary" title="요청 취소하기" disabled={busy} onPress={onCancelJoin} />
        </>
      );
    }
    if (post.myPartyStatus === 'accepted') {
      return (
        <>
          <Text style={styles.joinStatus}>이 파티에 참여 중이에요.</Text>
          <Button size="md" variant="secondary" title="파티 나가기" disabled={busy} onPress={onCancelJoin} />
        </>
      );
    }
    if (post.myPartyStatus === 'rejected') {
      return <Button size="md" title="참여 요청이 거절됐어요" disabled />;
    }
    return (
      <Button
        size="md"
        title={!recruiting || isFull ? '모집이 마감됐어요' : '참여 요청하기'}
        icon={recruiting && !isFull ? <UserPlusIcon width={20} height={20} /> : undefined}
        disabled={busy || !recruiting || isFull}
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
            <PostAuthorRow authorName={post.authorName} createdAt={post.createdAt} viewCount={post.viewCount} now={now} />
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

          {post.mine ? (
            <PartyRequestList
              requests={partyRequests}
              now={now}
              busy={busy}
              onAccept={(requestId) => onDecideRequest?.(requestId, 'ACCEPTED')}
              onReject={(requestId) => onDecideRequest?.(requestId, 'REJECTED')}
            />
          ) : null}

          <PostComments
            comments={post.comments}
            commentCount={post.commentCount}
            now={now}
            busy={busy}
            emptyText="아직 댓글이 없어요. 궁금한 점을 남겨보세요!"
            onPressComments={onPressComments}
            onSubmitComment={onSubmitComment}
            onDeleteComment={onDeleteComment}
          />
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
  actionError: {
    ...typography.small,
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colors.danger,
  },
  joinStatus: {
    ...typography.small,
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colors.textSubtle,
  },
  footer: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
});
