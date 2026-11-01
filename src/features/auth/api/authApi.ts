/*
 * ============================================================================
 * [로그인 구현 2/9] 로그인 API 호출 함수 (서버 주소·요청 모양만 담당)
 * ============================================================================
 * 1번 src/api/client.ts 의 request() 를 import 해서 쓴다.
 *   import { request } from '@/api/client';
 *
 * 화면이나 상태(스토어)는 여기서 다루지 않는다. "서버에 무엇을 보내고 무엇을 받는지" 만 적는다.
 *
 * ----------------------------------------------------------------------------
 * 서버 API (RoutineSlim-Server, domain/auth/controller/AuthController.java)
 * ----------------------------------------------------------------------------
 *   POST /auth/login
 *     요청 { "memberName": "admin", "memberPassword": "qwert123!@", "keepLoggedIn": true }
 *     응답 { "accessToken": "eyJ...", "expiresIn": 1800, "refreshToken": "x8Kf..." }
 *     실패 아이디·비밀번호 틀림 → 현재 서버는 500 (서버 쪽 수정 예정, 401 이 될 수 있음)
 *
 *   POST /auth/refresh
 *     요청 { "refreshToken": "x8Kf..." }
 *     응답 로그인과 같은 모양. refreshToken 도 새 값이다 (예전 값은 서버에서 폐기됨)
 *     실패 만료·폐기된 토큰 → 401
 *
 *   POST /auth/logout
 *     요청 { "refreshToken": "x8Kf..." }
 *     응답 200, 본문 없음. 이미 폐기된 토큰이어도 200
 *
 *   (참고) GET /api/v1/users/me  ← 로그인이 필요한 API. 5번 authorizedRequest 로 부른다
 *     응답 { "memberId": "019a...", "memberName": "admin", "name": "관리자", "email": null }
 *
 * ----------------------------------------------------------------------------
 * 만들 타입
 * ----------------------------------------------------------------------------
 *   export type AuthTokens = {
 *     accessToken: string;   // API 호출용. 수명 30분
 *     expiresIn: number;     // accessToken 유효 시간(초)
 *     refreshToken: string;  // 재발급용. 로그인 유지 켬 14일 / 끔 1일
 *   };
 *
 *   // 로그인 화면(LoginScreen)이 넘겨주는 값 그대로. 이름이 서버와 다르다는 점에 주의
 *   export type LoginCredentials = { id: string; password: string; keepLoggedIn: boolean };
 *
 * ----------------------------------------------------------------------------
 * 만들 함수
 * ----------------------------------------------------------------------------
 *   export function login(credentials: LoginCredentials): Promise<AuthTokens>
 *     - 화면 이름 → 서버 이름으로 바꿔서 보낸다
 *         id → memberName,  password → memberPassword,  keepLoggedIn → keepLoggedIn
 *     - request<AuthTokens>('/auth/login', { method: 'POST', body: {...} })
 *
 *   export function refresh(refreshToken: string): Promise<AuthTokens>
 *     - request<AuthTokens>('/auth/refresh', { method: 'POST', body: { refreshToken } })
 *
 *   export function logout(refreshToken: string): Promise<void>
 *     - request<void>('/auth/logout', { method: 'POST', body: { refreshToken } })
 *
 *   (나중에) socialLogin(provider, token) → POST /auth/social/login { provider: 'KAKAO', token }
 *     - 서버 provider 값은 대문자(GOOGLE, KAKAO, NAVER), 화면 SocialProvider 는 소문자라 변환 필요
 *     - 각 회사 SDK 로 받은 토큰이 필요해서 이번 범위에서는 만들지 않는다
 */

// 아직 구현 전. 구현하면 이 줄은 지운다
export {};
