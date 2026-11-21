/*
 * [소셜 로그인 - 권기쁨] 구글 로그인 훅 (expo-auth-session)
 *
 * 흐름
 *   1) start() → 구글 로그인 창(웹: 팝업, 앱: 브라우저)을 연다
 *   2) 사용자가 로그인하면 구글이 access token 을 준다
 *   3) onToken(accessToken) → 로그인 화면이 서버 POST /auth/social/login { provider: 'GOOGLE', token } 로 보낸다
 *   4) 서버(GoogleTokenVerifier)가 구글 userinfo API 로 토큰을 검증하고 회원 UUID 를 돌려준다
 *
 * 필요한 값 (.env.local, Git 에 올리지 않음. 발급 방법은 .env.example 참고)
 *   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID      웹(브라우저)에서 실행할 때
 *   EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID  안드로이드 빌드에서 실행할 때
 *   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID      iOS 빌드에서 실행할 때
 * 지금 플랫폼의 값이 비어 있으면 configured=false → 버튼을 눌러도 창을 열지 않고 안내만 한다.
 */
import * as Google from 'expo-auth-session/providers/google';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

// 팝업 닫기(WebBrowser.maybeCompleteAuthSession)는 src/app/_layout.tsx 에서 한다

const clientIds = {
  web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
  android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
};

const currentClientId =
  Platform.OS === 'android' ? clientIds.android : Platform.OS === 'ios' ? clientIds.ios : clientIds.web;

/** 지금 플랫폼에 맞는 구글 Client ID 가 .env.local 에 들어 있는지 */
export const isGoogleLoginConfigured = currentClientId.length > 0;

// 값이 비어 있으면 라이브러리가 화면을 그릴 때 바로 오류를 던지므로 자리만 채워 둔다 (configured=false 라 실제로 쓰이지 않음)
const PLACEHOLDER = 'not-configured';

type Options = {
  /** 구글 access token 을 받았을 때 */
  onToken: (accessToken: string) => void;
  /** 사용자가 창을 닫은 것 말고, 진짜 실패했을 때 */
  onError: (message: string) => void;
};

export function useGoogleLogin({ onToken, onError }: Options) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: clientIds.web || PLACEHOLDER,
    androidClientId: clientIds.android || PLACEHOLDER,
    iosClientId: clientIds.ios || PLACEHOLDER,
    scopes: ['openid', 'profile', 'email'],
  });

  // 콜백이 매번 새로 만들어져도 effect 를 다시 돌리지 않도록 최신 값만 기억해 둔다
  const handlers = useRef({ onToken, onError });
  handlers.current = { onToken, onError };

  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      // 앱(code 방식)은 라이브러리가 자동으로 토큰 교환까지 끝낸 뒤 authentication 에 넣어 준다
      const accessToken = response.authentication?.accessToken ?? response.params.access_token;
      if (accessToken) handlers.current.onToken(accessToken);
      else handlers.current.onError('구글에서 로그인 정보를 받지 못했어요.');
    } else if (response.type === 'error') {
      handlers.current.onError('구글 로그인 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.');
    }
    // dismiss / cancel: 사용자가 창을 닫은 것이라 안내하지 않는다
  }, [response]);

  return {
    configured: isGoogleLoginConfigured,
    /** 요청 준비가 끝나야 창을 열 수 있다 */
    ready: isGoogleLoginConfigured && request != null,
    start: () => promptAsync(),
  };
}
