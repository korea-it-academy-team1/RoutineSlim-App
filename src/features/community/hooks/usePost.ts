import { useEffect, useRef, useState } from 'react';

import { ApiError } from '@/api/client';

import {
  createComment,
  deleteComment,
  deletePost,
  getComments,
  getPost,
  increaseViewCount,
  updatePost,
  type PostDto,
} from '../api/communityApi';
import type { CommunityPost } from '../types';
import { toCloseRecruitRequest, toCommunityPost, toPostComment } from '../utils/postMapper';

type Loaded = {
  postId: string;
  post: CommunityPost | null;
  /** 모집 마감(PUT) 때 원래 값을 그대로 보내야 해서 서버 응답도 같이 둔다 */
  dto: PostDto | null;
  error: ApiError | null;
};

/**
 * 게시글 상세 (게시글 + 댓글 + 상세 화면의 동작).
 * 확인 대화상자·요청 중 표시·실패 문구·삭제 후 뒤로 가기는 route(src/app/community/[id].tsx)가 한다.
 * 동작 함수들은 실패하면 throw 만 한다 (route 의 run() 이 잡아서 보여 준다).
 * post 는 불러오는 중이면 null. 없는 글은 서버가 400 을 준다.
 */
export function usePost(postId: string) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [attempt, setAttempt] = useState(0);
  /** 조회수를 이미 올린 글. 다시 시도(reload) 때는 올리지 않는다 */
  const viewedPostId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // 조회수는 상세 요청보다 먼저 올려야 화면에 올라간 값이 보인다. 실패해도 화면은 보여 준다
      if (viewedPostId.current !== postId) {
        viewedPostId.current = postId;
        await increaseViewCount(postId).catch(() => {});
      }
      const [dto, comments] = await Promise.all([getPost(postId), getComments(postId)]);
      if (!cancelled) setLoaded({ postId, post: toCommunityPost(dto, comments), dto, error: null });
    };

    load().catch((e: unknown) => {
      if (cancelled) return;
      const error = e instanceof ApiError ? e : new ApiError('UNKNOWN', '게시글을 불러오지 못했어요.', 0);
      setLoaded({ postId, post: null, dto: null, error });
    });

    return () => {
      cancelled = true;
    };
    // attempt: 다시 시도 버튼
  }, [postId, attempt]);

  const current = loaded?.postId === postId ? loaded : null;

  /** 댓글 작성·삭제 후 댓글 목록과 댓글 수를 다시 맞춘다 */
  const refreshComments = async () => {
    const comments = (await getComments(postId)).map(toPostComment);
    setLoaded((prev) =>
      prev?.postId === postId && prev.post
        ? { ...prev, post: { ...prev.post, comments, commentCount: comments.length } }
        : prev,
    );
  };

  const addComment = async (content: string) => {
    await createComment(postId, content);
    await refreshComments();
  };

  const removeComment = async (commentId: string) => {
    await deleteComment(postId, commentId);
    await refreshComments();
  };

  /** 파티원 모집 글만 */
  const closeRecruit = async () => {
    if (current?.dto?.board !== 'PARTY') return;
    const dto = await updatePost(postId, toCloseRecruitRequest(current.dto));
    // 댓글은 그대로 둔다
    setLoaded((prev) =>
      prev?.postId === postId && prev.post
        ? { ...prev, dto, post: { ...toCommunityPost(dto), comments: prev.post.comments } }
        : prev,
    );
  };

  const removePost = async () => {
    await deletePost(postId);
  };

  return {
    post: current?.post ?? null,
    error: current?.error ?? null,
    reload: () => setAttempt((n) => n + 1),
    addComment,
    removeComment,
    closeRecruit,
    removePost,
  };
}
