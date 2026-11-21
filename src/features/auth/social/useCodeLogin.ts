/*
 * [소셜 로그인 - 권기쁨] 카카오·네이버 로그인 훅 (expo-auth-session, 인가 코드 방식)
 *
 * 흐름
 *   1) start() → 카카오/네이버 로그인 창(웹: 팝업, 앱: 브라우저)을 연다
 *   2) 사용자가 로그인하면 인가 코드(code)와 state 를 돌려받는다
 *   3) onCode({ code, redirectUri, state }) → 로그인 화면이 서버 POST /auth/social/login 으로 보낸다
 *   4) 서버(SocialTokenExchanger)가 Client Secret 으로 access token 을 받고, 사용자 정보를 확인해 회원 UUID 를 돌려준다
 *
 * 구글과 달리 토큰 교환에 Client Secret 이 필요해서, 앱은 코드까지만 받고 교환은 서버가 한다.
 *
 * 필요한 값 (.env.local, Git 에 올리지 않음. 발급 방법은 .env.example 참고)
 *   EXPO_PUBLIC_KAKAO_REST_API_KEY   카카오 REST API 키 (= client_id, 공개돼도 되는 값)
 *   EXPO_PUBLIC_NAVER_CLIENT_ID      네이버 Client ID (공개돼도 되는 값. Secret 은 서버에만)
 * 리디렉션 URI: 웹은 http://localhost:8081 (각 콘솔에 똑같이 등록)
 */
import * as AuthSession from 'expo-auth-session';
import { useEffect, useRef } from 'react';

export type CodeLoginProvider = 'kakao' | 'naver';

const providers = {
  kakao: {
    clientId: process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY ?? '',
    discovery: { authorizationEndpoint: 'https://kauth.kakao.com/oauth/authorize' },
    label: '카카오',
  },
  naver: {
    clientId: process.env.EXPO_PUBLIC_NAVER_CLIENT_ID ?? '',
    discovery: { authorizationEndpoint: 'https://nid.naver.com/oauth2.0/authorize' },
    label: '네이버',
  },
} as const;

/** .env.local 에 키가 들어 있는지 */
export function isCodeLoginConfigured(provider: CodeLoginProvider) {
  return providers[provider].clientId.length > 0;
}

export type CodeResult = { code: string; redirectUri: string; state?: string };

type Options = {
  /** 인가 코드를 받았을 때 */
  onCode: (result: CodeResult) => void;
  /** 사용자가 창을 닫은 것 말고, 진짜 실패했을 때 */
  onError: (message: string) => void;
};

export function useCodeLogin(provider: CodeLoginProvider, { onCode, onError }: Options) {
  const config = providers[provider];
  const redirectUri = AuthSession.makeRedirectUri();

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: config.clientId || 'not-configured',
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      // 서버가 Client Secret 으로 교환하므로 PKCE 는 쓰지 않는다 (네이버는 PKCE 미지원)
      usePKCE: false,
      scopes: [],
    },
    config.discovery,
  );

  // 콜백이 매번 새로 만들어져도 effect 를 다시 돌리지 않도록 최신 값만 기억해 둔다
  const handlers = useRef({ onCode, onError });
  handlers.current = { onCode, onError };

  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      const { code, state } = response.params;
      if (code) handlers.current.onCode({ code, redirectUri: request?.redirectUri ?? redirectUri, state });
      else handlers.current.onError(`${config.label}에서 로그인 정보를 받지 못했어요.`);
    } else if (response.type === 'error') {
      handlers.current.onError(`${config.label} 로그인 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.`);
    }
    // dismiss / cancel: 사용자가 창을 닫은 것이라 안내하지 않는다
  }, [response, request, redirectUri, config.label]);

  const configured = isCodeLoginConfigured(provider);
  return {
    configured,
    ready: configured && request != null,
    start: () => promptAsync(),
  };
}
