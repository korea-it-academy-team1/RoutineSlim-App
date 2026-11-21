import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { ApiError } from '@/api/client';

import { getActivityPosts, type ActivityScopeDto } from '../api/communityApi';
import type { CommunityPost } from '../types';
import { toCommunityPost } from '../utils/postMapper';

type Loaded = { scope: ActivityScopeDto; posts: CommunityPost[] | null; error: ApiError | null };

/**
 * 마이 > 커뮤니티 활동 목록. 화면에 들어올 때와 탭(scope)을 바꿀 때 다시 불러온다.
 * posts 는 지금 탭을 불러오기 전이면 null (탭을 바꾸면 이전 탭 목록을 보여 주지 않는다).
 */
export function useActivityPosts(scope: ActivityScopeDto) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  const load = useCallback(async () => {
    try {
      const posts = (await getActivityPosts(scope)).map((dto) => toCommunityPost(dto));
      setLoaded({ scope, posts, error: null });
    } catch (e) {
      const error = e instanceof ApiError ? e : new ApiError('UNKNOWN', '글을 불러오지 못했어요.', 0);
      setLoaded({ scope, posts: null, error });
    }
  }, [scope]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const current = loaded?.scope === scope ? loaded : null;
  return { posts: current?.posts ?? null, error: current?.error ?? null, reload: load };
}
