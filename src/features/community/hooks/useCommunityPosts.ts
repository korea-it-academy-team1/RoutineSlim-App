import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { ApiError } from '@/api/client';

import { getPosts } from '../api/communityApi';
import type { CommunityBoard, CommunityPost } from '../types';
import { toCommunityBoardDto, toCommunityPost } from '../utils/postMapper';

type Loaded = { board: CommunityBoard; posts: CommunityPost[] | null; error: ApiError | null };

/**
 * 게시판 글 목록 (서버). 탭에 다시 들어오거나 글쓰기·상세에서 돌아오면 새로 불러온다.
 * 게시판을 빠르게 바꿨을 때 앞선 게시판의 늦은 응답은 버린다.
 * posts 는 불러오는 중이면 null.
 *
 * 나중에: 페이지네이션(서버 page·size, 최대 50), 서비스 필터·정렬(서버에 아직 파라미터 없음)
 */
export function useCommunityPosts(board: CommunityBoard) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [attempt, setAttempt] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getPosts(toCommunityBoardDto(board))
        .then((dtos) => {
          if (!cancelled) setLoaded({ board, posts: dtos.map((dto) => toCommunityPost(dto)), error: null });
        })
        .catch((e: unknown) => {
          if (cancelled) return;
          const error = e instanceof ApiError ? e : new ApiError('UNKNOWN', '게시글을 불러오지 못했어요.', 0);
          setLoaded({ board, posts: null, error });
        });
      return () => {
        cancelled = true;
      };
      // attempt: 다시 시도 버튼
    }, [board, attempt]),
  );

  const current = loaded?.board === board ? loaded : null;
  return {
    posts: current?.posts ?? null,
    error: current?.error ?? null,
    reload: () => setAttempt((n) => n + 1),
  };
}
