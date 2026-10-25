import { router } from 'expo-router';

import { LoginScreen } from '@/features/auth/screens/LoginScreen';

export default function LoginRoute() {
  // TODO: 인증 API 연동 후 성공 시에만 이동
  return <LoginScreen onLogin={() => router.replace('/home')} />;
}
