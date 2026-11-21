import { router } from 'expo-router';
import { useState } from 'react';

import { ApiError } from '@/api/client';
import { useAuthStore } from '@/features/auth/authStore';
import { SignupScreen } from '@/features/auth/screens/SignupScreen';
import { toSignupRequest, validateSignup, type SignupForm } from '@/features/auth/utils/signupForm';

/** 회원가입 → 성공하면 바로 로그인 상태로 홈 */
export default function SignupRoute() {
  const signUp = useAuthStore((state) => state.signUp);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/login'));

  const handleSubmit = async (form: SignupForm) => {
    const invalid = validateSignup(form);
    if (invalid) {
      setErrorMessage(invalid);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await signUp(toSignupRequest(form));
      router.replace('/home'); // 홈에서 뒤로 가기로 가입·로그인 화면에 돌아오지 않게
    } catch (error) {
      if (error instanceof ApiError && (error.code === 'NETWORK_ERROR' || error.status === 400)) {
        // 연결 실패 문구, 또는 서버 문구('이미 사용 중인 아이디입니다.')
        setErrorMessage(error.message);
      } else {
        // 서버가 이메일 중복을 검사하지 않아 DB 오류(500)로 온다
        setErrorMessage('가입하지 못했어요. 이미 가입된 이메일인지 확인해 주세요.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SignupScreen
      onBack={goBack}
      onSubmit={(form) => void handleSubmit(form)}
      errorMessage={errorMessage}
      submitting={submitting}
    />
  );
}
