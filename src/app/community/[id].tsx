import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { usePost } from '@/features/community/hooks/usePost';
import { GeneralPostDetailScreen } from '@/features/community/screens/GeneralPostDetailScreen';
import { PartyPostDetailScreen } from '@/features/community/screens/PartyPostDetailScreen';
import { confirmDialog, showMessage } from '@/features/my/utils/dialog';
import { colors, typography } from '@/theme';

/** 커뮤니티 글 상세. 파티원 모집은 모집 정보·마감까지, 후기·자유는 본문과 댓글 (공통: 댓글, 내 글 삭제) */
export default function PartyPostDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { post, error, reload, addComment, removeComment, closeRecruit, removePost } = usePost(id);
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
      // 참여 요청 API 는 아직 없다. 서버에 생기면 여기서 호출한다
      onRequestJoin={() => showMessage('참여 요청', '참여 요청 기능은 준비 중이에요. 댓글로 참여 의사를 남겨 주세요.')}
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
