# 로그인 방식 전환 가이드 (App): 1번(회원 UUID) → 3번(JWT) — 이대수

서버(`RoutineSlim-Server/docs/jwt-switch-guide.md`)와 **같이** 바꾼다. 한쪽만 바꾸면 로그인이 안 된다.

| | 1번 (지금) | 3번 JWT (최종) |
|---|---|---|
| 로그인 응답 | 회원 UUID 문자열 | `{ accessToken, expiresIn, refreshToken }` |
| 요청에 붙이는 것 | `X-Member-Id: <UUID>` | `Authorization: Bearer <accessToken>` |
| 기기에 저장 | 회원 UUID (`routineslim.member-id`) | refresh token (`routineslim.refresh-token`) |
| 로그아웃 | 앱에서만 지움 | 앱에서 지우고 서버 `/auth/logout` |

## 표시

| 표시 | 3번으로 바꿀 때 |
|---|---|
| `[JWT 로그인 - 이대수]` | **주석 해제** |
| `[1번 임시 - 이대수]` | **주석 처리 또는 삭제** |
| `[로그인 - 이대수]` | 그대로 둔다 |

주석 해제: IntelliJ 에서 `//` 로 시작하는 줄을 **설명 줄까지 통째로** 선택 → `Ctrl + /`
(설명 줄은 `//// [JWT 로그인 - 이대수] …` 처럼 한 번 더 주석이 붙어 있어, 해제하면 일반 주석으로 남는다)

## 바꾸는 파일

| 파일 | `[1번 임시]` 주석 처리 | `[JWT 로그인]` 주석 해제 |
|---|---|---|
| `src/api/client.ts` | `memberId` 옵션, `X-Member-Id` 헤더 줄 | `token` 옵션, `Authorization` 헤더 줄 |
| `src/features/auth/api/authApi.ts` | UUID 를 받는 `login` | `AuthTokens` 타입, 토큰 `login`, `refresh`, `logout` |
| `src/features/auth/tokenStorage.ts` | `MEMBER_ID_KEY`, `saveMemberId`·`loadMemberId`·`clearMemberId` | `REFRESH_TOKEN_KEY`, `saveRefreshToken`·`loadRefreshToken`·`clearRefreshToken` |
| `src/features/auth/authStore.ts` | `tokenStorage` import 1줄, `시작`~`끝` 사이 1번 스토어 전체 | import 3줄, `시작`~`끝` 사이 JWT 스토어 전체 |
| `src/features/auth/authorizedRequest.ts` | 함수 안쪽 (1번 흐름) | 주석의 "JWT 방식 흐름" 대로 다시 작성 (`'memberId'` → `'token'`) |

바꾸지 않는 파일: 로그인 화면·라우트(6~9번). `status`, `signIn`, `signOut`, `restore` 는 두 방식이 이름과 쓰는 법이 같다.
`authorizedRequest` 를 쓰는 화면들도 고칠 것이 없다.

## 확인

1. `npx tsc --noEmit` 오류 없음 (`memberId` 를 쓰는 곳이 남아 있으면 여기서 오류가 난다 → `accessToken` 으로)
2. 서버도 JWT 로 바꾼 상태에서 `docs/login-guide.md` 체크리스트 전부 + 마지막 재발급 항목
3. 1번 방식으로 "로그인 상태 유지" 를 켰던 기기는 예전 키(`routineslim.member-id`)만 있어서 처음 한 번은 로그인 화면이 뜬다 (정상)
