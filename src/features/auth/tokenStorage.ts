/*
 * ============================================================================
 * [로그인 구현 3/9] refresh token 을 기기에 저장·읽기·삭제
 * ============================================================================
 * "로그인 상태 유지" 를 켰을 때, 앱을 껐다 켜도 로그인이 유지되게 refresh token 을 저장한다.
 * access token 은 저장하지 않는다 (메모리에만 두고, 앱을 다시 켜면 refresh token 으로 새로 받는다).
 *
 * ----------------------------------------------------------------------------
 * 준비 (한 번만)
 * ----------------------------------------------------------------------------
 *   1) 패키지 설치 (프로젝트 루트에서):  npx expo install expo-secure-store
 *      → package.json 에 SDK 58 에 맞는 버전이 들어간다. npm install 대신 꼭 expo install 을 쓴다
 *   2) app.json 의 "plugins" 배열 끝에 "expo-secure-store" 추가
 *   3) 개발 서버 재시작
 *
 * ----------------------------------------------------------------------------
 * 어디에 저장하나
 * ----------------------------------------------------------------------------
 *   - 휴대폰(안드로이드/iOS): expo-secure-store
 *       OS 보안 저장소(안드로이드 Keystore, iOS Keychain)에 암호화해서 저장한다. 토큰은 반드시 여기
 *   - 웹: SecureStore 가 동작하지 않는다 → @react-native-async-storage/async-storage (이미 설치됨)
 *       브라우저 localStorage 에 저장된다. 개발 확인용으로만 쓴다고 생각하면 된다
 *   - 구분: import { Platform } from 'react-native';  const isWeb = Platform.OS === 'web';
 *   - 사용법 참고: src/features/onboarding/onboardingStorage.ts (AsyncStorage 를 같은 방식으로 씀)
 *
 * ----------------------------------------------------------------------------
 * 만들 것
 * ----------------------------------------------------------------------------
 *   const REFRESH_TOKEN_KEY = 'routineslim.refresh-token';
 *     - SecureStore 키에는 영문·숫자·. - _ 만 쓸 수 있다 (콜론 ':' 불가)
 *
 *   export async function saveRefreshToken(token: string): Promise<void>
 *     - 웹: AsyncStorage.setItem(KEY, token)  /  폰: SecureStore.setItemAsync(KEY, token)
 *
 *   export async function loadRefreshToken(): Promise<string | null>
 *     - 웹: AsyncStorage.getItem(KEY)  /  폰: SecureStore.getItemAsync(KEY)
 *     - 저장된 값이 없으면 null
 *
 *   export async function clearRefreshToken(): Promise<void>
 *     - 웹: AsyncStorage.removeItem(KEY)  /  폰: SecureStore.deleteItemAsync(KEY)
 *
 *   세 함수 모두 try/catch 로 감싸서 오류를 밖으로 던지지 않는다.
 *     - save 실패: 이번 실행 동안은 메모리로 로그인 상태가 유지되므로 그냥 넘어간다
 *     - load 실패: null 을 돌려준다 (= 저장된 로그인 없음 → 로그인 화면)
 *     - clear 실패: 무시
 */

// 아직 구현 전. 구현하면 이 줄은 지운다
export {};
