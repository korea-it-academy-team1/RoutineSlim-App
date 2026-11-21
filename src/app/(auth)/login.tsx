import { router } from 'expo-router';
import { useState } from 'react';

import { ApiError } from '@/api/client';
import type { LoginCredentials, ServerSocialProvider, SocialCredential } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/authStore';
import type { SocialProvider } from '@/features/auth/components/SocialLoginButtons';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { useCodeLogin } from '@/features/auth/social/useCodeLogin';
import { useGoogleLogin } from '@/features/auth/social/useGoogleLogin';

/*
 * [로그인 구현 7/9] 로그인 라우트: 화면(6번)과 로그인 상태(4번)를 연결한다
 *
 * 지금은 버튼을 누르면 검사 없이 홈으로 간다. 아래처럼 바꾼다.
 *
 *   import { useState } from 'react';
 *   import { ApiError } from '@/api/client';
 *   import type { LoginCredentials } from '@/features/auth/api/authApi';
 *   import { useAuthStore } from '@/features/auth/authStore';
 *
 * 1) 상태
 *      const signIn = useAuthStore((state) => state.signIn);
 *      const [errorMessage, setErrorMessage] = useState<string | null>(null);
 *      const [submitting, setSubmitting] = useState(false);
 *
 * 2) handleLogin = async (credentials: LoginCredentials) => { ... }
 *      (1) 아이디나 비밀번호가 비었으면 서버에 보내지 말고
 *          setErrorMessage('아이디와 비밀번호를 입력해 주세요.') 후 return
 *      (2) setSubmitting(true), setErrorMessage(null)   ← 이전 안내 지우기
 *      (3) try { await signIn(credentials); router.replace('/home'); }
 *          - push 가 아니라 replace: 홈에서 뒤로 가기를 눌러도 로그인 화면으로 돌아오지 않게
 *      (4) catch (error)
 *          - error instanceof ApiError && error.code === 'NETWORK_ERROR' → error.message 표시
 *            (서버 연결 실패 문구)
 *          - 그 밖 → '로그인하지 못했어요. 아이디와 비밀번호를 확인해 주세요.'
 *            (서버가 아이디·비밀번호 오류 때 설명(message)을 주지 않아서 직접 문구를 정한다)
 *      (5) finally { setSubmitting(false) }   ← 성공·실패 모두 버튼 잠금 해제
 *
 * 3) return <LoginScreen onLogin={handleLogin} errorMessage={errorMessage} submitting={submitting} />;
 *
 * 테스트 계정: 아이디 admin / 비밀번호 qwert123!@ (서버 V3__insert_admin_member.sql)
 */
export default function LoginRoute() {
  const signIn = useAuthStore((state) => state.signIn);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (credentials: LoginCredentials) => {
    if (!credentials.id || !credentials.password) {
      setErrorMessage('아이디와 비밀번호를 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await signIn(credentials);
      router.replace('/home'); // 홈에서 뒤로 가기로 로그인 화면에 돌아오지 않게
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError && error.code === 'NETWORK_ERROR'
          ? error.message
          : '로그인하지 못했어요. 아이디와 비밀번호를 확인해 주세요.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // [소셜 로그인 - 권기쁨] 각 회사에서 받은 정보(구글: token, 카카오·네이버: 인가 코드)를 서버로 보내 회원 UUID 를 받는다
  const signInWithSocial = useAuthStore((state) => state.signInWithSocial);

  const finishSocialLogin = async (provider: ServerSocialProvider, credential: SocialCredential) => {
    setSubmitting(true);
    setErrorMessage(null);
    try {
      await signInWithSocial(provider, credential);
      router.replace('/home');
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? // 서버가 400 으로 준 안내(예: 이미 가입된 이메일, 서버 키 미설정)는 그대로 보여 준다
            error.message
          : '소셜 로그인을 완료하지 못했어요. 잠시 후 다시 시도해 주세요.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const google = useGoogleLogin({
    onToken: (token) => finishSocialLogin('GOOGLE', { token }),
    onError: setErrorMessage,
  });
  const kakao = useCodeLogin('kakao', {
    onCode: (result) => finishSocialLogin('KAKAO', result),
    onError: setErrorMessage,
  });
  const naver = useCodeLogin('naver', {
    onCode: (result) => finishSocialLogin('NAVER', result),
    onError: setErrorMessage,
  });

  const socialLogins = {
    google: { ...google, missingKey: 'EXPO_PUBLIC_GOOGLE_*_CLIENT_ID', label: '구글' },
    kakao: { ...kakao, missingKey: 'EXPO_PUBLIC_KAKAO_REST_API_KEY', label: '카카오' },
    naver: { ...naver, missingKey: 'EXPO_PUBLIC_NAVER_CLIENT_ID', label: '네이버' },
  };

  const handleSocialLogin = (provider: SocialProvider) => {
    setErrorMessage(null);
    const social = socialLogins[provider];
    if (!social.configured) {
      setErrorMessage(`${social.label} 로그인 설정이 아직 없어요. (.env.local 의 ${social.missingKey})`);
      return;
    }
    if (!social.ready) return; // 요청 준비 중 (아주 잠깐)
    social.start();
  };

  return (
    <LoginScreen
      onLogin={handleLogin}
      onSocialLogin={handleSocialLogin}
      onSignUp={() => router.push('/signup')}
      errorMessage={errorMessage}
      submitting={submitting}
    />
  );
}
