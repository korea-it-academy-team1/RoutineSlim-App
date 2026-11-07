import { router } from 'expo-router';

import { HomeScreen } from '@/features/subscription/screens/HomeScreen';

/*
 * [홈 구현 8/8] 홈 라우트에서 데이터 불러와 화면에 넘기기 (전체 순서: docs/home-guide.md)
 *
 * 할 일
 *   (1) const { summary, loading, error, reload } = useHomeSubscriptions();   // 6번
 *   (2) <HomeScreen summary={summary} loading={loading} errorMessage={error?.message} onRetry={reload} ... />
 *       - 기존 onPressComparison, onPressAddSubscription 은 그대로 둔다
 *   (3) 회원이 없을 때 (서버 404: 회원이 삭제됨 등) → 로그인 화면으로
 *         useEffect(() => {
 *           if (error?.status === 404) {
 *             useAuthStore.getState().signOut().then(() => router.replace('/login'));
 *           }
 *         }, [error]);
 *       - 400 (X-Member-Id 없음 = 로그인 안 됨)도 같은 처리를 해도 된다
 *       - 로그인 화면 경로는 src/app/(auth)/login.tsx → '/login'
 *
 * 확인: 로그인 → 홈에 서버 구독이 보임 → 구독 추가 화면에 갔다 돌아오면 다시 불러옴(useFocusEffect)
 */
export default function HomeRoute() {
  return (
    <HomeScreen
      onPressComparison={() => router.push('/usage')}
      onPressAddSubscription={() => router.push('/subscription/add')}
    />
  );
}
