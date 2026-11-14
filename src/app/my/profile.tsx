import { router } from 'expo-router';
import { useState } from 'react';

import { updateMyInfo, type UpdateMyInfoBody } from '@/features/my/api/userApi';
import { useMyInfo } from '@/features/my/hooks/useMyInfo';
import { ProfileEditScreen } from '@/features/my/screens/ProfileEditScreen';

export default function ProfileEditRoute() {
  const { info, error, reload } = useMyInfo();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/my'));

  const submit = async (body: UpdateMyInfoBody) => {
    setSaving(true);
    setSaveError(undefined);
    try {
      await updateMyInfo(body);
      goBack(); // 마이 탭은 다시 보일 때 내 정보를 새로 불러온다
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : '저장하지 못했어요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProfileEditScreen
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
