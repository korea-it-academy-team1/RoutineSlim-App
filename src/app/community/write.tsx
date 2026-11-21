import { router } from 'expo-router';
import { useState } from 'react';

import { createPost } from '@/features/community/api/communityApi';
import { WritePostScreen, type PostDraft } from '@/features/community/screens/WritePostScreen';
import { toCreatePostRequest } from '@/features/community/utils/postMapper';
import { useActiveSubscriptions } from '@/features/subscription/hooks/useSubscriptions';

export default function WritePostRoute() {
  const { subscriptions } = useActiveSubscriptions();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/community'));

  const submit = async (draft: PostDraft) => {
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      await createPost(toCreatePostRequest(draft));
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
