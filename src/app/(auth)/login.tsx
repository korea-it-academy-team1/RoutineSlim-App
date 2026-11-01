import { router } from 'expo-router';

import { LoginScreen } from '@/features/auth/screens/LoginScreen';

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
  // TODO: 인증 API 연동 후 성공 시에만 이동
  return <LoginScreen onLogin={() => router.replace('/home')} />;
}
