import { router } from 'expo-router';
import { useState } from 'react';

import { useCommunityPosts } from '@/features/community/hooks/useCommunityPosts';
import { CommunityScreen } from '@/features/community/screens/CommunityScreen';
import type { CommunityBoard } from '@/features/community/types';

export default function CommunityRoute() {
  const [board, setBoard] = useState<CommunityBoard>('party');
  const { posts, error, reload } = useCommunityPosts(board);

  return (
    <CommunityScreen
      board={board}
      onChangeBoard={setBoard}
      posts={posts}
      errorMessage={error?.message}
      onRetry={reload}
      onPressPost={(post) => router.push({ pathname: '/community/[id]', params: { id: post.id } })}
      onPressWrite={() => router.push('/community/write')}
    />
  );
}
