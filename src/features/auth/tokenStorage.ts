/*
 * [로그인 구현 3/9] refresh token 을 기기에 저장·읽기·삭제
 *
 * "로그인 상태 유지" 를 켰을 때 앱을 껐다 켜도 로그인이 유지되게 refresh token 만 저장한다.
 * access token 은 저장하지 않는다 (메모리에만 두고, 앱을 다시 켜면 refresh token 으로 새로 받는다).
 *
 * 저장 위치
 * - 휴대폰: expo-secure-store → OS 보안 저장소(안드로이드 Keystore, iOS Keychain)에 암호화 저장
 *   (설치: npx expo install expo-secure-store, app.json plugins 에 "expo-secure-store")
 * - 웹: SecureStore 가 동작하지 않아 AsyncStorage(브라우저 localStorage)를 쓴다. 개발 확인용
 *
 * 세 함수 모두 오류를 밖으로 던지지 않는다 (저장소 문제로 로그인 흐름이 멈추지 않게).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// SecureStore 키에는 영문·숫자·. - _ 만 쓸 수 있다 (콜론 불가)
const REFRESH_TOKEN_KEY = 'routineslim.refresh-token';

const isWeb = Platform.OS === 'web';

export async function saveRefreshToken(token: string) {
  try {
    if (isWeb) await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    else await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  } catch {
    // 저장에 실패해도 이번 실행 동안은 메모리로 로그인 상태가 유지된다
  }
}

/** 저장된 refresh token. 없거나 읽지 못하면 null (= 저장된 로그인 없음) */
export async function loadRefreshToken() {
  try {
    return isWeb ? await AsyncStorage.getItem(REFRESH_TOKEN_KEY) : await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function clearRefreshToken() {
  try {
    if (isWeb) await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    else await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch {
    // 지우지 못해도 서버에서 폐기했으면 다음 재발급이 401 → 로그인 화면으로 간다
  }
}
