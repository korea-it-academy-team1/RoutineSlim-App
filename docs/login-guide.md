# 로그인 구현 가이드 (App ↔ RoutineSlim-Server)

각 파일 맨 위의 `[로그인 구현 N/9]` 주석에 할 일이 자세히 적혀 있다. **번호 순서대로** 구현한다
(뒤 번호가 앞 번호의 함수를 import 한다). 구현하면서 주석은 필요한 만큼 남기고, 새 파일의 `export {};` 줄은 지운다.

> **로그인 방식 (이대수)**: 지금은 **1번 방식** — 로그인하면 회원 UUID 를 받아 `X-Member-Id` 헤더로 보낸다.
> 최종 JWT(3번) 코드는 1~4번 파일에 `[JWT 로그인 - 이대수]` 주석으로 남아 있다. 바꾸는 법은 `docs/jwt-switch-guide.md`.
>
> **진행 상황**: 1~4번(서버 통신 + 로그인 상태)은 구현돼 있다. 화면 연결(6 → 7 → 9 → 8)부터 하고, 5번은 로그인이 필요한 API 를 처음 부를 때 만든다.
> 1~4번 사용법은 각 파일 맨 위 주석과 `authStore.ts` 의 "화면 연결" 설명을 본다.

## 파일 목록

| 순서 | 파일 | 상태 | 할 일 |
|---|---|---|---|
| 1 | `src/api/client.ts` | ✅ 구현됨 | 서버 주소 `API_URL`, 오류 클래스 `ApiError`, 공통 호출 함수 `request()` (`memberId` 옵션 → `X-Member-Id` 헤더) |
| 2 | `src/features/auth/api/authApi.ts` | ✅ 구현됨 | `login`(회원 UUID 반환) 과 `LoginCredentials` 타입 (JWT 용 `refresh`·`logout`·`AuthTokens` 는 주석) |
| 3 | `src/features/auth/tokenStorage.ts` | ✅ 구현됨 | 회원 UUID 저장·읽기·삭제 (폰: SecureStore, 웹: AsyncStorage). JWT 용 refresh token 함수는 주석 |
| 4 | `src/features/auth/authStore.ts` | ✅ 구현됨 | zustand 로그인 상태: `status`, `memberId`, `signIn`, `signOut`, `restore` (JWT 스토어는 주석) |
| 5 | `src/features/auth/authorizedRequest.ts` | 새 파일(주석만) | 회원 UUID 를 붙여 보내는 함수 (JWT: 토큰을 붙이고 401 이면 재발급 후 재요청) |
| 6 | `src/features/auth/screens/LoginScreen.tsx` | 기존 화면 + 주석 | `errorMessage`, `submitting` props 와 실패 안내 표시 |
| 7 | `src/app/(auth)/login.tsx` | 기존 라우트 + 주석 | 로그인 버튼 → `signIn` → 성공 시 홈, 실패 시 안내 |
| 8 | `src/app/index.tsx` | 기존 라우트 + 주석 | 앱 시작 시 `restore()` 로 자동 로그인 |
| 9 | `src/app/(tabs)/my.tsx` | 기존 라우트 + 주석 | 로그아웃 버튼 → `signOut` |
| - | `.env.example` | 설정 예시 | `.env.local` 로 복사해 서버 주소(`EXPO_PUBLIC_API_URL`) 지정 |
| - | `package.json`, `app.json` | ✅ 반영됨 | `expo-secure-store` 설치 + app.json plugins 추가 완료 (pull 후 `npm install`) |

## 시작 전 준비

1. 서버 실행: `RoutineSlim-Server` (IntelliJ, JDK 21, `application-local.yml` 에 DB. `jwt.secret` 은 JWT 로 바꿀 때만)
2. 앱 루트에서 `.env.example` → `.env.local` 복사, 실행 환경에 맞게 주소 수정
   - 웹: `http://localhost:8080` / 안드로이드 에뮬레이터: `http://10.0.2.2:8080` / 휴대폰: `http://<PC IP>:8080`
3. `npx expo start -c`

## 서버 API 요약 (지금: 1번 방식)

| API | 요청 | 응답 |
|---|---|---|
| `POST /auth/login` | `{ memberName, memberPassword, keepLoggedIn }` | 회원 UUID 문자열 `"019a3c2e-…"` (`keepLoggedIn` 은 서버가 무시) |
| `GET /api/v1/users/me` | 헤더 `X-Member-Id: <UUID>` | `{ memberId, memberName, name, email }` / 헤더 없으면 400, 없는 회원 404 |

- 응답은 `{ success, data }` 로 감싸지 않은 DTO 그대로. 오류는 Spring Boot 기본 형식 `{ timestamp, status, error, path }`
- 아이디·비밀번호가 틀리면 지금 서버는 500 → 화면은 "아이디와 비밀번호를 확인해 주세요." 로 안내
- 1번 방식은 보안이 없다 (헤더만 바꾸면 다른 회원 행세 가능) → 시연·개발용
- 테스트 계정: `admin` / `qwert123!@`
- JWT(3번) 방식 API 는 `docs/jwt-switch-guide.md`

## 완료 확인 체크리스트

- [ ] `npx tsc --noEmit` 오류 없음 (템플릿 파일 `animated-icon.web.tsx`, `constants/theme.ts` 오류는 개발 서버를 한 번 띄우면 사라짐)
- [ ] 빈 칸으로 로그인 → "아이디와 비밀번호를 입력해 주세요."
- [ ] 틀린 비밀번호 → "아이디와 비밀번호를 확인해 주세요.", 버튼이 다시 눌림
- [ ] 서버를 끄고 로그인 → "서버에 연결할 수 없어요…"
- [ ] admin 로그인 → 홈으로 이동, 뒤로 가기 해도 로그인 화면이 안 나옴
- [ ] 로그인 상태 유지 켜고 로그인 → 앱 재시작 → 바로 홈
- [ ] 로그인 상태 유지 끄고 로그인 → 앱 재시작 → 로그인 화면
- [ ] 마이 탭 로그아웃 → 로그인 화면, 앱 재시작해도 로그인 화면
- [ ] (JWT 로 바꾼 뒤) 서버 `jwt.access-token-validity` 를 1m 로 바꾸고 1분 뒤 `/api/v1/users/me` 호출 → 자동 재발급 후 성공
