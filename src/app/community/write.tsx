import { router } from 'expo-router';
import { useState } from 'react';

import { useActiveSubscriptions } from '@/features/subscription/hooks/useSubscriptions';
import { WritePostScreen, type PostDraft } from '@/features/community/screens/WritePostScreen';

// ---------------------------------------------------------------------------
// TODO(커뮤니티): features/community/api/communityApi.ts 의 createPost 와
//   utils/postMapper.ts 의 toCreatePostRequest 를 구현하면 이 함수를 지우고
//   submit 안의 호출을 `await createPost(toCreatePostRequest(draft))` 로 바꾼다.
// ---------------------------------------------------------------------------
async function createPostPlaceholder(_draft: PostDraft): Promise<void> {
  throw new Error('커뮤니티 API 연동 전이에요.');
}

export default function WritePostRoute() {
  const { subscriptions } = useActiveSubscriptions();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/community'));

  const submit = async (draft: PostDraft) => {
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      await createPostPlaceholder(draft);
      // 목록은 탭에 다시 들어올 때(useFocusEffect) 새로 불러온다
      goBack();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : '게시글을 등록하지 못했어요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <WritePostScreen
      subscriptions={subscriptions}
      submitting={submitting}
      submitError={submitError}
      onBack={goBack}
      onSubmit={(draft) => void submit(draft)}
    />
  );
}
