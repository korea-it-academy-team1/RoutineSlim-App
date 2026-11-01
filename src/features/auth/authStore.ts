/*
 * ============================================================================
 * [로그인 구현 4/9] 로그인 상태 저장소 (zustand)
 * ============================================================================
 * 앱 전체에서 "지금 로그인했나? 토큰은 뭔가?" 를 한 곳에서 관리한다.
 * zustand 는 이미 설치돼 있다 (package.json). 사용법: https://zustand.docs.pmnd.rs
 *
 *   import { create } from 'zustand';
 *   import { ApiError } from '@/api/client';                 // 1번
 *   import * as authApi from './api/authApi';                // 2번
 *   import type { AuthTokens, LoginCredentials } from './api/authApi';
 *   import { clearRefreshToken, loadRefreshToken, saveRefreshToken } from './tokenStorage';  // 3번
 *
 * 화면에서 쓰는 법
 *   - 컴포넌트 안   : const status = useAuthStore((s) => s.status);   ← 값이 바뀌면 다시 그려짐
 *   - 컴포넌트 밖   : useAuthStore.getState().accessToken             ← 5번 authorizedRequest 에서 사용
 *
 * ----------------------------------------------------------------------------
 * 상태(state)
 * ----------------------------------------------------------------------------
 *   status: 'unknown' | 'signedIn' | 'signedOut'
 *     - 'unknown'  : 앱을 막 켜서 저장된 로그인을 아직 확인하지 않음 (처음 값)
 *                    → 이 동안 index.tsx(8번)는 아무것도 그리지 않고 기다린다
 *     - 'signedIn' : 로그인됨 (accessToken 있음)
 *     - 'signedOut': 로그인 안 됨
 *   accessToken: string | null     메모리에만 둔다
 *   refreshToken: string | null    keepLoggedIn 이면 3번 저장소에도 저장
 *   keepLoggedIn: boolean          재발급 후에도 저장 여부를 유지하려고 기억해 둔다
 *
 * ----------------------------------------------------------------------------
 * 동작(action)
 * ----------------------------------------------------------------------------
 *   signIn(credentials: LoginCredentials): Promise<void>
 *     1) const tokens = await authApi.login(credentials)     ← 실패하면 ApiError 가 그대로 밖으로 나감
 *                                                              (로그인 화면이 catch 해서 문구 표시)
 *     2) set({ status: 'signedIn', accessToken, refreshToken, keepLoggedIn })
 *     3) keepLoggedIn 이면 saveRefreshToken(tokens.refreshToken)
 *        (끄고 로그인했으면 저장하지 않는다 → 앱을 다시 켜면 로그인 화면)
 *
 *   signOut(): Promise<void>
 *     1) 지금 refreshToken 을 변수에 따로 담아 둔다 (다음 줄에서 상태를 지우므로)
 *     2) set({ status: 'signedOut', accessToken: null, refreshToken: null })   ← 화면은 바로 로그아웃
 *     3) await clearRefreshToken()
 *     4) authApi.logout(담아 둔 토큰) — 실패해도 .catch(() => undefined) 로 무시
 *        (서버 폐기에 실패해도 앱은 이미 토큰을 지웠으니 로그아웃된 것과 같다)
 *
 *   refreshAccessToken(): Promise<string | null>
 *     access token 이 만료(401)됐을 때 새로 받는다. 성공하면 새 accessToken, 다시 로그인해야 하면 null.
 *     1) refreshToken 이 없으면 null
 *     2) const tokens = await authApi.refresh(refreshToken)
 *     3) 성공: 상태에 새 토큰 두 개를 넣고, keepLoggedIn 이면 새 refreshToken 을 다시 저장 → accessToken 반환
 *        ★ 서버는 쓴 refreshToken 을 폐기한다. 새 값으로 바꿔 두지 않으면 다음 재발급이 401 이 된다
 *     4) 실패:
 *        - ApiError 이고 status === 401 (토큰 만료·폐기) → clearRefreshToken(), signedOut 상태로, null 반환
 *        - 그 밖(서버 연결 실패 등) → 로그아웃시키지 말고 오류를 다시 throw (잠깐 와이파이가 끊긴 것일 수 있음)
 *
 *     ★ 동시에 여러 API 가 401 을 받으면 재발급이 여러 번 일어난다.
 *       첫 번째 재발급이 refreshToken 을 폐기하므로 두 번째부터는 401 → 멀쩡한 사용자가 로그아웃된다.
 *       막는 방법: 스토어 밖(파일 맨 위)에 진행 중인 Promise 를 담는 변수를 하나 두고,
 *         let refreshing: Promise<string | null> | null = null;
 *       refreshAccessToken 이 불리면 refreshing 이 이미 있으면 그걸 돌려주고,
 *       없으면 새로 시작해서 담아 두고, 끝나면(.finally) 다시 null 로 비운다.
 *
 *   restore(): Promise<void>
 *     앱을 켤 때 한 번 부른다 (8번 index.tsx). 저장된 로그인이 있으면 로그인 상태로 만든다.
 *     1) status 가 'unknown' 이 아니면 바로 끝 (이미 확인함 — 화면이 다시 그려져서 또 불려도 안전하게)
 *     2) const saved = await loadRefreshToken()
 *     3) 없으면 signedOut 으로 끝
 *     4) 있으면 set({ refreshToken: saved, keepLoggedIn: true }) 후 refreshAccessToken() 호출
 *        → 성공하면 signedIn, 401 이면 refreshAccessToken 안에서 signedOut 이 된다
 *     5) 서버 연결 실패(throw)면: 저장된 토큰은 지우지 말고 status 만 'signedOut' 으로
 *        (다음에 앱을 켤 때 다시 시도할 수 있게)
 *
 * ----------------------------------------------------------------------------
 * 뼈대
 * ----------------------------------------------------------------------------
 *   type AuthState = { status; accessToken; refreshToken; keepLoggedIn; signIn; signOut; restore; refreshAccessToken };
 *   export const useAuthStore = create<AuthState>()((set, get) => ({ ...처음 값, ...동작 }));
 *     - set(...) 으로 상태를 바꾸고, get() 으로 지금 상태를 읽는다
 */

// 아직 구현 전. 구현하면 이 줄은 지운다
export {};
