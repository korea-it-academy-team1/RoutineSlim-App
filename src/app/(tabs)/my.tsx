import { router } from 'expo-router';
import { useState } from 'react';

import { useAuthStore } from '@/features/auth/authStore';
import { useActiveSubscriptions } from '@/features/subscription/hooks/useSubscriptions';
import { withdrawUser } from '@/features/my/api/userApi';
import { useMyInfo } from '@/features/my/hooks/useMyInfo';
import { MyScreen, type MyMenu } from '@/features/my/screens/MyScreen';
import { confirmDialog, showMessage } from '@/features/my/utils/dialog';
import { formatNotification, slimDays } from '@/features/my/utils/myInfo';

export default function MyRoute() {
  const signOut = useAuthStore((state) => state.signOut);
  const { info, error, reload } = useMyInfo();
  const { subscriptions, loaded: subscriptionsLoaded } = useActiveSubscriptions();
  const [withdrawing, setWithdrawing] = useState(false);

  const handleLogout = async () => {
    await signOut(); // 메모리·기기 저장소의 회원 정보 삭제
    router.replace('/login'); // replace: 로그인 화면에서 뒤로 가기로 마이 탭에 돌아오지 않게
  };

  const handleWithdraw = async () => {
    if (withdrawing) return;
    const ok = await confirmDialog(
      '회원탈퇴',
      '탈퇴하면 등록한 구독과 설정을 더 이상 볼 수 없어요. 정말 탈퇴할까요?',
      '탈퇴',
    );
    if (!ok) return;

    setWithdrawing(true);
    try {
      await withdrawUser();
      await handleLogout();
    } catch (e) {
      showMessage('탈퇴하지 못했어요', e instanceof Error ? e.message : '잠시 후 다시 시도해 주세요.');
    } finally {
      setWithdrawing(false);
    }
  };

  const handlePressMenu = (menu: MyMenu) => {
    if (menu === 'profile') router.push('/my/profile');
    else if (menu === 'notifications') router.push('/my/notifications');
    else if (menu === 'withdraw') void handleWithdraw();
    // 나머지 메뉴는 아직 화면이 없다
  };

  return (
    <MyScreen
      profile={
        info
          ? {
              name: info.name,
              email: info.email ?? '',
              slimDays: slimDays(info.createdAt),
            }
          : undefined
      }
      profileError={error?.message}
      onRetryProfile={reload}
      subscriptionCount={subscriptionsLoaded ? subscriptions.length : undefined}
      notificationLabel={info ? formatNotification(info.defaultNotificationDays, info.notificationTime) : undefined}
      onPressMenu={handlePressMenu}
      onLogout={handleLogout}
    />
  );
}
