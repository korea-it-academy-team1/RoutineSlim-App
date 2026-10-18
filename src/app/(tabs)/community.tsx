import { router } from 'expo-router';

import { CommunityScreen } from '@/features/community/screens/CommunityScreen';

export default function CommunityRoute() {
  return (
    <CommunityScreen
      onPressPost={(post) => router.push({ pathname: '/community/[id]', params: { id: post.id } })}
      onPressWrite={() => router.push('/community/write')}
    />
  );
}
