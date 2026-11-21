import { router } from 'expo-router';
import { useState } from 'react';

import type { ActivityScopeDto } from '@/features/community/api/communityApi';
import { useActivityPosts } from '@/features/community/hooks/useActivityPosts';
import { CommunityActivityScreen, type ActivityTab } from '@/features/community/screens/CommunityActivityScreen';

const TAB_TO_SCOPE: Record<ActivityTab, ActivityScopeDto> = {
  mine: 'MINE',
  commented: 'COMMENTED',
  joined: 'JOINED',
};

/** 마이 > 커뮤니티 활동 — 내가 쓴 글 · 댓글 단 글 · 참여 중인 파티 */
export default function CommunityActivityRoute() {
  const [tab, setTab] = useState<ActivityTab>('mine');
  const { posts, error, reload } = useActivityPosts(TAB_TO_SCOPE[tab]);
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/my'));

  return (
    <CommunityActivityScreen
      tab={tab}
      onChangeTab={setTab}
      posts={posts}
      loadError={error?.message}
      onRetry={() => void reload()}
      onBack={goBack}
      onPressPost={(post) => router.push({ pathname: '/community/[id]', params: { id: post.id } })}
      onGoCommunity={() => router.push('/community')}
    />
  );
}
