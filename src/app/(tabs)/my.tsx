import { router } from 'expo-router';

import { MyScreen } from '@/features/my/screens/MyScreen';

/*
 * [로그인 구현 9/9] 마이 탭의 로그아웃 버튼 연결
 *
 * 지금은 화면만 로그인으로 바뀌고 토큰은 남아 있다 (앱을 다시 켜면 다시 로그인돼 버림). 아래처럼 바꾼다.
 *
 *   import { useAuthStore } from '@/features/auth/authStore';
 *
 * 1) const signOut = useAuthStore((state) => state.signOut);
 * 2) const handleLogout = async () => {
 *        await signOut();             // 메모리·기기 저장소의 토큰 삭제 + 서버 refresh token 폐기
 *        router.replace('/login');    // replace: 로그인 화면에서 뒤로 가기로 마이 탭에 돌아오지 않게
 *    };
 * 3) return <MyScreen onLogout={handleLogout} />;
 *
 * (선택) 마이 탭에 실제 이름을 보여 주려면 5번 authorizedRequest 로
 *        GET /api/v1/users/me 를 불러 name, email 을 MyScreen 에 넘긴다
 */
export default function MyRoute() {
  // TODO: 인증 연동 후 토큰 정리 등 실제 로그아웃 처리
  return <MyScreen onLogout={() => router.replace('/login')} />;
}
