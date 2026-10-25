import { router } from 'expo-router';

import { MyScreen } from '@/features/my/screens/MyScreen';

export default function MyRoute() {
  // TODO: 인증 연동 후 토큰 정리 등 실제 로그아웃 처리
  return <MyScreen onLogout={() => router.replace('/login')} />;
}
