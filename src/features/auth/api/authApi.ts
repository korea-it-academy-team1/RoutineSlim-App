/*
 * [로그인 구현 2/9] 로그인 API 호출 함수
 *
 * "서버에 무엇을 보내고 무엇을 받는지" 만 담당한다. 화면·상태는 authStore.ts(4번)가 다룬다.
 * 서버 코드: RoutineSlim-Server domain/auth/controller/AuthController.java
 *
 * 서버 API
 *   POST /auth/login    { memberName, memberPassword, keepLoggedIn } → AuthTokens
 *                       아이디·비밀번호가 틀리면 현재 서버는 500 (서버 쪽 수정 예정, 401 이 될 수 있음)
 *   POST /auth/refresh  { refreshToken } → AuthTokens (refreshToken 도 새 값, 예전 값은 서버에서 폐기)
 *                       만료·폐기된 토큰이면 401
 *   POST /auth/logout   { refreshToken } → 200, 본문 없음 (이미 폐기된 토큰이어도 200)
 *
 * (나중에) 소셜 로그인 POST /auth/social/login { provider: 'KAKAO', token }
 *   서버 provider 는 대문자(GOOGLE, KAKAO, NAVER), 화면 SocialProvider 는 소문자라 변환이 필요하다.
 *   각 회사 SDK 로 받은 토큰이 있어야 해서 이번 범위에서는 만들지 않는다.
 */
import { request } from '@/api/client';

/** 서버 TokenResponseDTO (로그인·재발급 응답) */
export type AuthTokens = {
  /** API 호출용 토큰 (JWT). 수명 30분 */
  accessToken: string;
  /** accessToken 유효 시간 (초) */
  expiresIn: number;
  /** 재발급용 토큰. 로그인 상태 유지 켬 14일 / 끔 1일 */
  refreshToken: string;
};

/** 로그인 화면(LoginScreen)이 넘겨주는 값 그대로. 이름이 서버와 다르다 (아래 login 에서 변환) */
export type LoginCredentials = { id: string; password: string; keepLoggedIn: boolean };

/** 서버 LoginRequestDTO 필드 이름 */
type LoginRequestBody = { memberName: string; memberPassword: string; keepLoggedIn: boolean };

export function login({ id, password, keepLoggedIn }: LoginCredentials) {
  // 화면 이름 → 서버 이름: id → memberName, password → memberPassword
  const body: LoginRequestBody = { memberName: id, memberPassword: password, keepLoggedIn };
  return request<AuthTokens>('/auth/login', { method: 'POST', body });
}

/** 쓴 refreshToken 은 서버에서 폐기되므로, 부른 쪽은 응답의 새 토큰으로 바꿔 저장해야 한다 */
export function refresh(refreshToken: string) {
  return request<AuthTokens>('/auth/refresh', { method: 'POST', body: { refreshToken } });
}

export function logout(refreshToken: string) {
  return request<void>('/auth/logout', { method: 'POST', body: { refreshToken } });
}
