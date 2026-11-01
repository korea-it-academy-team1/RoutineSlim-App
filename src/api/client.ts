/*
 * ============================================================================
 * [로그인 구현 1/9] 서버(RoutineSlim-Server) 호출 공통 함수
 * ============================================================================
 * 전체 순서와 파일 목록은 docs/login-guide.md 를 본다.
 *
 * 이 파일은 로그인뿐 아니라 앞으로 모든 API 호출이 함께 쓰는 "fetch 감싸기" 이다.
 * 여기서 만든 request() 를 authApi.ts(2번), authorizedRequest.ts(5번)가 쓴다.
 *
 * ----------------------------------------------------------------------------
 * 1. 서버 주소 상수
 * ----------------------------------------------------------------------------
 *   export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080';
 *
 *   - EXPO_PUBLIC_ 으로 시작하는 환경 변수는 Expo 가 빌드할 때 코드에 넣어 준다.
 *   - 값은 루트의 .env.local 에 적는다 (.env.example 을 복사. .env.local 은 git 에 안 올라감)
 *       웹 브라우저 / iOS 시뮬레이터 : http://localhost:8080
 *       안드로이드 에뮬레이터         : http://10.0.2.2:8080   (에뮬레이터에서 PC 를 가리키는 주소)
 *       휴대폰 Expo Go               : http://<PC IPv4>:8080  (ipconfig 로 확인, 같은 와이파이, 방화벽 8080 허용)
 *   - .env.local 을 바꾸면 개발 서버를 껐다 켜야 반영된다 (npx expo start -c)
 *
 * ----------------------------------------------------------------------------
 * 2. 오류 클래스 ApiError
 * ----------------------------------------------------------------------------
 *   export class ApiError extends Error {
 *     constructor(readonly code: string, message: string, readonly status: number) { ... }
 *   }
 *
 *   - status : HTTP 상태 코드 (401, 500 ...). 서버에 연결조차 못 했으면 0
 *   - code   : 화면/스토어에서 분기할 때 쓰는 값. 예) 'NETWORK_ERROR', 'HTTP_401'
 *   - message: 화면에 그대로 보여 줄 수 있는 한국어 문장
 *   - this.name = 'ApiError' 를 넣어 두면 디버깅할 때 구분하기 쉽다
 *   - 다른 파일에서는 `error instanceof ApiError && error.status === 401` 처럼 검사한다
 *
 * ----------------------------------------------------------------------------
 * 3. request<T>(path, options) 함수
 * ----------------------------------------------------------------------------
 *   type RequestOptions = {
 *     method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';   // 기본 GET
 *     body?: unknown;                                         // 객체를 넘기면 JSON 으로 보낸다
 *     token?: string;                                         // access token (로그인이 필요한 API)
 *   };
 *   export async function request<T>(path: string, options: RequestOptions = {}): Promise<T>
 *
 *   구현 순서
 *   (1) 헤더 만들기
 *       - 항상           : Accept: application/json
 *       - body 가 있으면  : Content-Type: application/json
 *       - token 이 있으면 : Authorization: Bearer <token>    ← "Bearer " 뒤에 공백 한 칸 주의
 *   (2) fetch(`${API_URL}${path}`, { method, headers, body: JSON.stringify(body) })
 *       - body 가 없으면 body 는 undefined 로 둔다 (GET 에 body 를 넣으면 안 됨)
 *       - fetch 자체가 throw 하면 = 서버 꺼짐 / 주소 틀림 / 와이파이 문제
 *         → new ApiError('NETWORK_ERROR', '서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.', 0)
 *   (3) 응답 본문 읽기: await response.json().catch(() => null)
 *       - 로그아웃 성공(200) 은 본문이 비어 있어서 json() 이 실패한다 → null 로 받고 넘어간다
 *   (4) response.ok 가 false (상태 코드 200~299 가 아님) 이면 ApiError 를 throw
 *       - 서버(Spring Boot) 기본 오류 본문 모양:
 *           { "timestamp": "...", "status": 401, "error": "Unauthorized", "path": "/auth/refresh" }
 *         message 필드는 서버 설정에 따라 없을 수 있다 → 없으면 상태 코드로 문구를 정한다
 *           401 → '로그인이 필요해요. 다시 로그인해 주세요.'
 *           403 → '권한이 없어요.'
 *           404 → '요청한 대상을 찾을 수 없어요.'
 *           500 이상 → '서버에서 오류가 발생했어요. 잠시 후 다시 시도해 주세요.'
 *           그 밖 → '요청을 처리하지 못했어요.'
 *         code 는 `HTTP_${response.status}` 로 만든다
 *   (5) 성공이면 본문을 그대로 T 로 돌려준다 (본문이 없으면 undefined)
 *       - 이 서버는 응답을 { success, data } 같은 껍데기로 감싸지 않는다. DTO 가 그대로 온다
 *
 * ----------------------------------------------------------------------------
 * 확인 방법
 * ----------------------------------------------------------------------------
 *   - npx tsc --noEmit 로 타입 오류가 없는지
 *   - 서버를 켜지 않은 상태에서 request('/auth/login', ...) → NETWORK_ERROR 가 나오는지
 */

// 아직 구현 전. 구현하면 이 줄은 지운다 (내용 없는 파일도 모듈로 인식되게 하는 표시)
export {};
