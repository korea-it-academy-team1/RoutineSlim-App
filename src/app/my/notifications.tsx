import { router } from 'expo-router';
import { useState } from 'react';

import { updateNotificationSettings, type NotificationSettingsBody } from '@/features/my/api/userApi';
import { useMyInfo } from '@/features/my/hooks/useMyInfo';
import { NotificationSettingsScreen } from '@/features/my/screens/NotificationSettingsScreen';

export default function NotificationSettingsRoute() {
  const { info, error, reload } = useMyInfo();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/my'));

  const submit = async (body: NotificationSettingsBody) => {
    setSaving(true);
    setSaveError(undefined);
    try {
      await updateNotificationSettings(body);
      goBack(); // 마이 탭은 다시 보일 때 내 정보를 새로 불러온다
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : '저장하지 못했어요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <NotificationSettingsScreen
      info={info}
      loadError={error?.message}
      onRetry={reload}
      saving={saving}
      saveError={saveError}
      onBack={goBack}
      onSubmit={submit}
    />
  );
}
