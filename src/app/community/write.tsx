import { router } from 'expo-router';

import { WritePostScreen } from '@/features/community/screens/WritePostScreen';

export default function WritePostRoute() {
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/community'));

  // TODO: 게시글 등록 API 연동 후 성공 시 목록 갱신
  return <WritePostScreen onBack={goBack} onSubmit={goBack} />;
}
