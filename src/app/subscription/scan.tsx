import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform } from 'react-native';

import { scanReceipt } from '@/features/subscription/api/subscriptionApi';
import { useScanStore } from '@/features/subscription/scanStore';
import { ScanSubscriptionScreen } from '@/features/subscription/screens/ScanSubscriptionScreen';
import { toScanResult } from '@/features/subscription/utils/toScanResult';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8 };

export default function ScanSubscriptionRoute() {
  const setResult = useScanStore((state) => state.setResult);
  const [scanning, setScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/subscription/add'));

  const pickAndScan = async (source: 'album' | 'camera') => {
    if (scanning) return;
    setErrorMessage(undefined);

    let picked: ImagePicker.ImagePickerResult;
    if (source === 'camera') {
      // 웹은 브라우저가 직접 권한을 묻는다
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setErrorMessage('카메라 권한이 필요해요. 설정에서 허용해 주세요.');
          return;
        }
      }
      picked = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
    } else {
      picked = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    }
    if (picked.canceled || picked.assets.length === 0) return;

    const asset = picked.assets[0];
    const name = asset.fileName ?? asset.file?.name ?? `receipt_${Date.now()}.jpg`;
    const type = asset.mimeType ?? asset.file?.type ?? 'image/jpeg';

    setScanning(true);
    try {
      const dto = await scanReceipt({ uri: asset.uri, name, type, file: asset.file });
      setResult(toScanResult(dto, name));
      router.push('/subscription/scan-result');
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : '영수증을 읽지 못했어요. 직접 입력해 주세요.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <ScanSubscriptionScreen
      onBack={goBack}
      onPickFromAlbum={() => void pickAndScan('album')}
      onTakePhoto={() => void pickAndScan('camera')}
      scanning={scanning}
      errorMessage={errorMessage}
    />
  );
}
