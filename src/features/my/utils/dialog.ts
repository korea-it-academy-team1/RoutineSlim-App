import { Alert, Platform } from 'react-native';

/*
 * react-native-web 의 Alert.alert 는 버튼을 지원하지 않아서(아무 일도 안 일어남)
 * 웹에서는 브라우저 기본 대화상자를 쓴다.
 */

/** 확인/취소 대화상자. 확인을 누르면 true */
export function confirmDialog(title: string, message: string, confirmLabel = '확인'): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: '취소', style: 'cancel', onPress: () => resolve(false) },
        {
          text: confirmLabel,
          style: 'destructive',
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

/** 안내 메시지 (확인 버튼 하나) */
export function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
