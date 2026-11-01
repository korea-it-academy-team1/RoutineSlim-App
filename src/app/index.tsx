import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { hasSeenOnboarding } from '@/features/onboarding/onboardingStorage';

/*
 * [로그인 구현 8/9] 앱 첫 화면: "로그인 상태 유지" 로 저장된 로그인이 있으면 바로 홈으로
 *
 * 지금은 소개(onboarding)를 봤으면 무조건 로그인 화면으로 간다. 아래처럼 바꾼다.
 *
 *   import { useAuthStore } from '@/features/auth/authStore';
 *
 * 1) 스토어에서 두 개 꺼내기
 *      const authStatus = useAuthStore((state) => state.status);
 *      const restore = useAuthStore((state) => state.restore);
 *
 * 2) useEffect 안에서 hasSeenOnboarding() 과 함께 restore() 도 호출
 *      - 의존성 배열은 [restore]   (restore 는 바뀌지 않는 함수라 한 번만 실행된다)
 *      - restore 는 저장된 refresh token 으로 새 토큰을 받아 status 를 signedIn / signedOut 으로 바꾼다
 *
 * 3) 기다리기: seen === null 이거나 authStatus === 'unknown' 이면 return null
 *      (저장소 읽기 + 서버 재발급이 끝날 때까지. 보통 아주 짧다)
 *
 * 4) 이동
 *      - 소개를 안 봤으면 → '/onboarding'
 *      - 봤으면 → authStatus === 'signedIn' ? '/home' : '/login'
 */
export default function Index() {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    hasSeenOnboarding().then(setSeen);
  }, []);

  // 저장소를 읽는 동안은 아무것도 그리지 않는다 (아주 짧은 순간)
  if (seen === null) return null;

  return <Redirect href={seen ? '/login' : '/onboarding'} />;
}
