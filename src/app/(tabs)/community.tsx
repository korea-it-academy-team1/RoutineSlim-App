import { router } from 'expo-router';
import { useState } from 'react';

import { ApiError } from '@/api/client';
import { CommunityScreen } from '@/features/community/screens/CommunityScreen';
import type { CommunityBoard, PartyPost } from '@/features/community/types';

// ---------------------------------------------------------------------------
// TODO(커뮤니티): features/community/hooks/useCommunityPosts.ts 를 구현하면
//   1) 아래 communityPostsPlaceholder 함수를 지우고
//   2) 컴포넌트 안의 placeholder 호출을 `useCommunityPosts(board)` 로 바꾼다
//      import { useCommunityPosts } from '@/features/community/hooks/useCommunityPosts';
// 훅과 반환 모양이 같아서 나머지 코드는 그대로 쓰면 된다.
// ---------------------------------------------------------------------------
function communityPostsPlaceholder(_board: CommunityBoard): {
  posts: PartyPost[] | null;
  error: ApiError | null;
  reload: () => void;
} {
  return { posts: [], error: null, reload: () => {} };
}

export default function CommunityRoute() {
  const [board, setBoard] = useState<CommunityBoard>('party');
  const { posts, error, reload } = communityPostsPlaceholder(board);

  return (
    <CommunityScreen
      board={board}
      onChangeBoard={setBoard}
      partyPosts={posts}
      errorMessage={error?.message}
      onRetry={reload}
      onPressPost={(post) => router.push({ pathname: '/community/[id]', params: { id: post.id } })}
      onPressWrite={() => router.push('/community/write')}
    />
  );
}
