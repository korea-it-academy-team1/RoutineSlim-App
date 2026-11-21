import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

// [소셜 로그인 - 권기쁨] 웹에서 구글 로그인 팝업이 앱 주소로 돌아오면 결과를 넘기고 팝업을 닫는다.
// 돌아오는 주소(/)는 로그인 화면이 아니라서 모든 화면이 거치는 이곳에서 불러야 한다.
WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <StatusBar style="dark" />
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
