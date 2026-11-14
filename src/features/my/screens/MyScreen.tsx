import Constants from 'expo-constants';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BellIcon from '@/assets/icons/menu/bell.svg';
import CardIcon from '@/assets/icons/menu/card.svg';
import ChatIcon from '@/assets/icons/menu/chat.svg';
import CircleIcon from '@/assets/icons/menu/circle.svg';
import CloudIcon from '@/assets/icons/menu/cloud.svg';
import DownloadIcon from '@/assets/icons/menu/download.svg';
import InfoIcon from '@/assets/icons/menu/info.svg';
import ListIcon from '@/assets/icons/menu/list.svg';
import LockIcon from '@/assets/icons/menu/lock.svg';
import { PageHeader } from '@/components/common/PageHeader';
import { SettingsRow, SettingsSection } from '@/components/common/SettingsList';
import { Toggle } from '@/components/ui/Toggle';
import { colors, radius, spacing, typography } from '@/theme';

import { ProfileCard } from '../components/ProfileCard';
import { SavingsReportCard } from '../components/SavingsReportCard';

export type MyMenu =
  | 'profile'
  | 'report'
  | 'subscriptions'
  | 'paymentMethods'
  | 'budget'
  | 'notifications'
  | 'communityActivity'
  | 'export'
  | 'backup'
  | 'notices'
  | 'contact'
  | 'withdraw';

type Profile = {
  name: string;
  email: string;
  slimDays: number;
};

type MyScreenProps = {
  /** 서버에서 받은 내 정보. 불러오는 중이면 undefined */
  profile?: Profile;
  /** 내 정보를 불러오지 못했을 때 안내 문구 */
  profileError?: string;
  onRetryProfile?: () => void;
  /** 이용 중인 구독 수. 불러오는 중이면 undefined */
  subscriptionCount?: number;
  /** '알림 설정' 오른쪽 값 (예: 'D-3 · 09:00'). 불러오는 중이면 undefined */
  notificationLabel?: string;
  onPressMenu?: (menu: MyMenu) => void;
  onLogout?: () => void;
};

const LOADING_PROFILE: Profile = { name: '불러오는 중…', email: '', slimDays: 1 };

export function MyScreen({
  profile,
  profileError,
  onRetryProfile,
  subscriptionCount,
  notificationLabel,
  onPressMenu,
  onLogout,
}: MyScreenProps) {
  const [scrolled, setScrolled] = useState(false);
  const [appLock, setAppLock] = useState(false);
  const open = (menu: MyMenu) => () => onPressMenu?.(menu);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <PageHeader title="마이" elevated={scrolled} />

      <ScrollView
        contentContainerStyle={styles.content}
        scrollEventThrottle={16}
        onScroll={(e) => setScrolled(e.nativeEvent.contentOffset.y > 0)}
      >
        <ProfileCard {...(profile ?? LOADING_PROFILE)} onPressEdit={profile ? open('profile') : undefined} />
        {profileError ? (
          <Pressable accessibilityRole="button" onPress={onRetryProfile} style={styles.errorRow}>
            <Text style={styles.errorText}>{profileError}</Text>
            <Text style={styles.retryText}>다시 시도</Text>
          </Pressable>
        ) : null}
        {/* 해지 기록(절약 리포트) API 가 아직 없어 0 으로 보여 준다 */}
        <SavingsReportCard savedAmount={0} cancelledCount={0} onPressReport={open('report')} />

        <View style={styles.sections}>
          <SettingsSection title="구독 관리">
            <SettingsRow
              icon={<ListIcon width={13.8} height={11.8} />}
              title="내 구독 관리"
              value={subscriptionCount === undefined ? '' : `${subscriptionCount}개`}
              onPress={open('subscriptions')}
            />
            <SettingsRow
              icon={<CardIcon width={17.8} height={13.8} />}
              title="결제수단 관리"
              value="없음"
              onPress={open('paymentMethods')}
            />
            <SettingsRow
              icon={<SymbolInCircle symbol="₩" fontSize={10.5} />}
              title="월 예산"
              value="미설정"
              onPress={open('budget')}
            />
            <SettingsRow
              icon={<BellIcon width={17.8} height={21.3} />}
              title="알림 설정"
              value={notificationLabel ?? ''}
              onPress={open('notifications')}
            />
          </SettingsSection>

          <SettingsSection title="커뮤니티">
            <SettingsRow
              icon={<ChatIcon width={20.8} height={15.8} />}
              title="커뮤니티 활동"
              subtitle="내가 쓴 글 · 참여 중인 파티"
              onPress={open('communityActivity')}
            />
          </SettingsSection>

          <SettingsSection title="데이터 · 보안">
            <SettingsRow
              icon={<DownloadIcon width={17.8} height={16.8} />}
              title="데이터 내보내기"
              subtitle="CSV, 엑셀로 저장"
              onPress={open('export')}
            />
            <SettingsRow
              icon={<CloudIcon width={18.94} height={13.18} />}
              title="백업 / 동기화"
              subtitle="백업 기록 없음"
              onPress={open('backup')}
            />
            <SettingsRow
              icon={<LockIcon width={13.8} height={17.3} />}
              title="앱 잠금"
              subtitle="Face ID로 잠그기"
              accessory={<Toggle value={appLock} onChange={setAppLock} accessibilityLabel="앱 잠금" />}
            />
          </SettingsSection>

          <SettingsSection title="고객지원">
            <SettingsRow icon={<InfoIcon width={17.8} height={17.8} />} title="공지사항" onPress={open('notices')} />
            <SettingsRow
              icon={<SymbolInCircle symbol="?" fontSize={12} />}
              title="문의하기"
              onPress={open('contact')}
            />
          </SettingsSection>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onLogout}
          style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}
        >
          <Text style={styles.logoutText}>로그아웃</Text>
        </Pressable>

        <View style={styles.footer}>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={open('withdraw')}>
            <Text style={styles.withdraw}>회원탈퇴</Text>
          </Pressable>
          <Text style={styles.version}>{`루틴슬림 v${Constants.expoConfig?.version ?? ''}`}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** 원형 테두리 아이콘 안에 글자(₩, ?)를 얹은 메뉴 아이콘 */
function SymbolInCircle({ symbol, fontSize }: { symbol: string; fontSize: number }) {
  return (
    <View style={styles.symbolIcon}>
      <CircleIcon width={17.8} height={17.8} style={StyleSheet.absoluteFill} />
      <Text style={[styles.symbolText, { fontSize }]}>{symbol}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
  },
  content: {
    gap: 14,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  sections: {
    gap: 17,
    marginTop: 3,
  },
  symbolIcon: {
    width: 17.8,
    height: 17.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolText: {
    fontWeight: '700',
    color: colors.primary,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  errorText: {
    ...typography.small,
    flex: 1,
    color: colors.danger,
  },
  retryText: {
    ...typography.label,
    color: colors.danger,
  },
  logout: {
    height: 52,
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
  },
  logoutPressed: {
    backgroundColor: colors.backgroundMuted,
  },
  logoutText: {
    ...typography.settingsTitle,
    color: colors.textPrimary,
  },
  footer: {
    alignItems: 'center',
    gap: 11,
    marginTop: 4,
  },
  withdraw: {
    ...typography.caption,
    color: colors.textMuted,
  },
  version: {
    ...typography.small,
    color: colors.textPlaceholder,
  },
});
