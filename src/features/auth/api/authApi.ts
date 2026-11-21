/*
 * [로그인 구현 2/9] 로그인 API 호출 함수
 *
 * "서버에 무엇을 보내고 무엇을 받는지" 만 담당한다. 화면·상태는 authStore.ts(4번)가 다룬다.
 * 서버 코드: RoutineSlim-Server domain/auth/controller/AuthController.java
 *
 * [로그인 - 이대수] 지금은 1번 방식: 로그인하면 회원 UUID 를 받는다.
 * JWT(3번)로 바꿀 때: [1번 임시 - 이대수] 부분은 주석 처리, [JWT 로그인 - 이대수] 부분은 주석 해제 (Ctrl + /)
 *
 * 서버 API (1번 방식)
 *   POST /auth/login    { memberName, memberPassword } → "019a3c2e-..." (회원 UUID 문자열)
 *                       아이디·비밀번호가 틀리면 현재 서버는 500 (서버 쪽 수정 예정, 401 이 될 수 있음)
 *   GET  /api/v1/users/me  헤더 X-Member-Id: <UUID> → { memberId, memberName, name, email }
 *
 * 서버 API (3번 JWT, 나중에)
 *   POST /auth/login    { memberName, memberPassword, keepLoggedIn } → AuthTokens
 *   POST /auth/refresh  { refreshToken } → AuthTokens (refreshToken 도 새 값, 예전 값은 서버에서 폐기)
 *   POST /auth/logout   { refreshToken } → 200, 본문 없음
 *
 * (나중에) 소셜 로그인 POST /auth/social/login { provider: 'KAKAO', token }
 *   서버 provider 는 대문자(GOOGLE, KAKAO, NAVER), 화면 SocialProvider 는 소문자라 변환이 필요하다.
 */
import { request } from '@/api/client';

/** 로그인 화면(LoginScreen)이 넘겨주는 값 그대로. 이름이 서버와 다르다 (아래 login 에서 변환) */
export type LoginCredentials = { id: string; password: string; keepLoggedIn: boolean };

/** 서버 LoginRequestDTO 필드 이름 (keepLoggedIn 은 1번 방식 서버에서는 무시된다) */
type LoginRequestBody = { memberName: string; memberPassword: string; keepLoggedIn: boolean };

/** 화면 이름 → 서버 이름: id → memberName, password → memberPassword */
function toLoginBody({ id, password, keepLoggedIn }: LoginCredentials): LoginRequestBody {
  return { memberName: id, memberPassword: password, keepLoggedIn };
}

// [1번 임시 - 이대수] 로그인 → 회원 UUID 문자열
export function login(credentials: LoginCredentials) {
  return request<string>('/auth/login', { method: 'POST', body: toLoginBody(credentials) });
}

/** [소셜 로그인 - 권기쁨] 서버 SocialProvider enum 값 (대문자) */
export type ServerSocialProvider = 'GOOGLE' | 'KAKAO' | 'NAVER';

/**
 * [소셜 로그인 - 권기쁨] 서버에 보낼 소셜 로그인 정보
 * - 구글: { token }  앱이 받은 access token
 * - 카카오·네이버: { code, redirectUri, state }  인가 코드. Client Secret 이 필요한 토큰 교환은 서버가 한다
 */
export type SocialCredential =
  | { token: string }
  | { code: string; redirectUri: string; state?: string };

/**
 * [소셜 로그인 - 권기쁨] 소셜 로그인 → 회원 UUID 문자열 (1번 방식)
 * - 서버가 그 회사 사용자 정보 API 로 검증한다
 * - 처음 로그인하는 사람이면 서버가 회원을 새로 만든다 (SocialLoginServiceImpl)
 */
export function socialLogin(provider: ServerSocialProvider, credential: SocialCredential) {
  return request<string>('/auth/social/login', { method: 'POST', body: { provider, ...credential } });
}

//// [JWT 로그인 - 이대수] 서버 TokenResponseDTO (로그인·재발급 응답)
//export type AuthTokens = {
//  /** API 호출용 토큰 (JWT). 수명 30분 */
//  accessToken: string;
//  /** accessToken 유효 시간 (초) */
//  expiresIn: number;
//  /** 재발급용 토큰. 로그인 상태 유지 켬 14일 / 끔 1일 */
//  refreshToken: string;
//};
//
//// [JWT 로그인 - 이대수] 로그인 → 토큰
//export function login(credentials: LoginCredentials) {
//  return request<AuthTokens>('/auth/login', { method: 'POST', body: toLoginBody(credentials) });
//}
//
//// [JWT 로그인 - 이대수] 쓴 refreshToken 은 서버에서 폐기되므로, 부른 쪽은 응답의 새 토큰으로 바꿔 저장해야 한다
//export function refresh(refreshToken: string) {
//  return request<AuthTokens>('/auth/refresh', { method: 'POST', body: { refreshToken } });
//}
//
//// [JWT 로그인 - 이대수] 로그아웃 (서버의 refresh token 폐기)
//export function logout(refreshToken: string) {
//  return request<void>('/auth/logout', { method: 'POST', body: { refreshToken } });
//}
