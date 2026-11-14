import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/common/BackHeader';
import { OptionSheet } from '@/components/common/OptionSheet';
import { Button } from '@/components/ui/Button';
import { FormField, FormSelect } from '@/components/ui/FormField';
import { colors, spacing, typography } from '@/theme';

import type { MyInfoDto, NotificationSettingsBody } from '../api/userApi';
import { LoadState } from '../components/LoadState';
import { formatReminderDay, toHourMinute, toServerTime } from '../utils/myInfo';

/** 서버 허용 범위는 0~30일. 자주 쓰는 값만 고르게 한다 */
const DAY_CHOICES = [0, 1, 2, 3, 5, 7, 14, 30];

/** 00:00 ~ 23:30, 30분 간격 */
const TIME_CHOICES = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, '0');
  return `${h}:${i % 2 ? '30' : '00'}`;
});

type NotificationSettingsScreenProps = {
  info: MyInfoDto | null;
  loadError?: string;
  onRetry: () => void;
  saving: boolean;
  saveError?: string;
  onBack: () => void;
  onSubmit: (body: NotificationSettingsBody) => void;
};

export function NotificationSettingsScreen({
  info,
  loadError,
  onRetry,
  onBack,
  ...formProps
}: NotificationSettingsScreenProps) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <BackHeader title="알림 설정" onBack={onBack} />
      {info ? (
        <NotificationForm key={info.memberId} info={info} {...formProps} />
      ) : (
        <LoadState error={loadError} onRetry={onRetry} />
      )}
    </SafeAreaView>
  );
}

type NotificationFormProps = Pick<NotificationSettingsScreenProps, 'saving' | 'saveError' | 'onSubmit'> & {
  info: MyInfoDto;
};

function NotificationForm({ info, saving, saveError, onSubmit }: NotificationFormProps) {
  const initialTime = toHourMinute(info.notificationTime);
  const [days, setDays] = useState(info.defaultNotificationDays);
  const [time, setTime] = useState(initialTime);
  const [openSheet, setOpenSheet] = useState<'days' | 'time' | null>(null);

  // 서버 값이 목록에 없으면(예: 4일, 09:15) 그 값도 고를 수 있게 넣어 둔다
  const dayOptions = [...new Set([...DAY_CHOICES, info.defaultNotificationDays])]
    .sort((a, b) => a - b)
    .map((d) => ({
      value: String(d),
      label: d === 0 ? '결제 당일' : `결제 ${d}일 전`,
    }));
  const timeOptions = [...new Set([...TIME_CHOICES, initialTime])].sort().map((t) => ({ value: t, label: t }));

  const changed = days !== info.defaultNotificationDays || time !== initialTime;

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>새 구독을 등록할 때 기본으로 쓰는 알림이에요.</Text>

        <FormField label="알림 시점">
          <FormSelect
            value={days === 0 ? '결제 당일' : `결제 ${days}일 전 (${formatReminderDay(days)})`}
            placeholder="알림 시점 선택"
            onPress={() => setOpenSheet('days')}
          />
        </FormField>

        <FormField label="알림 시간">
          <FormSelect value={time} placeholder="알림 시간 선택" onPress={() => setOpenSheet('time')} />
        </FormField>

        {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}

        <View style={styles.spacer} />

        <Button
          size="md"
          title={saving ? '저장 중…' : '저장'}
          disabled={!changed || saving}
          onPress={() =>
            onSubmit({
              defaultNotificationDays: days,
              notificationTime: toServerTime(time),
            })
          }
        />
      </ScrollView>

      <OptionSheet
        visible={openSheet === 'days'}
        title="알림 시점"
        options={dayOptions}
        selected={String(days)}
        onSelect={(v) => setDays(Number(v))}
        onClose={() => setOpenSheet(null)}
      />
      <OptionSheet
        visible={openSheet === 'time'}
        title="알림 시간"
        options={timeOptions}
        selected={time}
        onSelect={setTime}
        onClose={() => setOpenSheet(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
  },
  content: {
    flexGrow: 1,
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  intro: {
    ...typography.bodyRegular,
    color: colors.textSubtle,
  },
  saveError: {
    ...typography.small,
    color: colors.danger,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
});
