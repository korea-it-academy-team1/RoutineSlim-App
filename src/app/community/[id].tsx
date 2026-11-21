import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { usePost } from '@/features/community/hooks/usePost';
import { GeneralPostDetailScreen } from '@/features/community/screens/GeneralPostDetailScreen';
import { PartyPostDetailScreen } from '@/features/community/screens/PartyPostDetailScreen';
import { confirmDialog } from '@/features/my/utils/dialog';
import { colors, typography } from '@/theme';

/** 커뮤니티 글 상세. 파티원 모집은 모집 정보·마감까지, 후기·자유는 본문과 댓글 (공통: 댓글, 내 글 삭제) */
export default function PartyPostDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    post,
    partyRequests,
    error,
    reload,
    addComment,
    removeComment,
    closeRecruit,
    requestJoin,
    cancelJoin,
    decideRequest,
    removePost,
  } = usePost(id);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string>();

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/community'));

  /** 댓글·마감·삭제 공통: 요청 중 표시와 실패 안내. 성공하면 true */
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setActionError(undefined);
    try {
      await action();
      return true;
    } catch (e) {
      setActionError(e instanceof Error ? e.message : '처리하지 못했어요.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!(await confirmDialog('댓글 삭제', '댓글을 삭제할까요?', '삭제'))) return;
    await run(() => removeComment(commentId));
  };

  const close = async () => {
    if (!(await confirmDialog('모집 마감', '더 이상 참여 요청을 받지 않아요.', '마감'))) return;
    await run(closeRecruit);
  };

  const join = async () => {
    if (!(await confirmDialog('참여 요청', '작성자에게 참여 요청을 보낼까요? 수락되면 파티원이 돼요.', '요청'))) return;
    await run(requestJoin);
  };

  const leave = async (accepted: boolean) => {
    const ok = accepted
      ? await confirmDialog('파티 나가기', '파티에서 나갈까요? 다시 참여하려면 새로 요청해야 해요.', '나가기')
      : await confirmDialog('요청 취소', '참여 요청을 취소할까요?', '취소하기');
    if (ok) await run(cancelJoin);
  };

  const decide = async (requestId: string, status: 'ACCEPTED' | 'REJECTED') => {
    const name = partyRequests.find((r) => r.id === requestId)?.memberName ?? '';
    const ok =
      status === 'ACCEPTED'
        ? await confirmDialog('참여 수락', `${name}님을 파티원으로 받을까요? 현재 인원이 1명 늘어나요.`, '수락')
        : await confirmDialog('참여 거절', `${name}님의 참여 요청을 거절할까요?`, '거절');
    if (ok) await run(() => decideRequest(requestId, status));
  };

  // 더보기: 지금은 삭제만 (수정 화면은 아직 없음)
  const remove = async () => {
    if (!(await confirmDialog('게시글 삭제', '게시글과 댓글이 모두 삭제돼요.', '삭제'))) return;
    if (await run(removePost)) goBack(); // 목록은 다시 보일 때 새로 불러온다
  };

  if (!post) {
    // 서버가 없는 글을 400 '게시글을 찾을 수 없습니다.' 로 돌려준다. 그 밖의 오류는 다시 시도
    if (error) {
      const notFound = error.status === 400 || error.status === 404;
      return (
        <View style={styles.center}>
          <Text style={styles.message}>{notFound ? '게시글을 찾을 수 없어요' : error.message}</Text>
          <Text style={styles.link} onPress={notFound ? goBack : reload}>
            {notFound ? '목록으로' : '다시 시도'}
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (post.board !== 'party') {
    return (
      <GeneralPostDetailScreen
        post={post}
        busy={busy}
        actionError={actionError}
        onBack={goBack}
        onPressMore={() => void remove()}
        onSubmitComment={(content) => run(() => addComment(content))}
        onDeleteComment={(commentId) => void deleteComment(commentId)}
      />
    );
  }

  return (
    <PartyPostDetailScreen
      post={post}
      busy={busy}
      actionError={actionError}
      onBack={goBack}
      onPressMore={() => void remove()}
      onRequestJoin={() => void join()}
      onCancelJoin={() => void leave(post.myPartyStatus === 'accepted')}
      partyRequests={partyRequests}
      onDecideRequest={(requestId, status) => void decide(requestId, status)}
      onCloseRecruit={() => void close()}
      onSubmitComment={(content) => run(() => addComment(content))}
      onDeleteComment={(commentId) => void deleteComment(commentId)}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.backgroundMuted,
  },
  message: {
    ...typography.caption,
    color: colors.textSubtle,
  },
  link: {
    ...typography.captionSmBold,
    color: colors.primary,
  },
});
