import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/common/BackHeader';
import { Button } from '@/components/ui/Button';
import { FormField, FormInput } from '@/components/ui/FormField';
import { colors, spacing, typography } from '@/theme';

import type { MyInfoDto, UpdateMyInfoBody } from '../api/userApi';
import { LoadState } from '../components/LoadState';
import { isEmail } from '../utils/myInfo';

type ProfileEditScreenProps = {
  /** 불러오는 중이면 null */
  info: MyInfoDto | null;
  loadError?: string;
  onRetry: () => void;
  /** 저장 요청 중 */
  saving: boolean;
  /** 저장 실패 안내 */
  saveError?: string;
  onBack: () => void;
  onSubmit: (body: UpdateMyInfoBody) => void;
};

export function ProfileEditScreen({ info, loadError, onRetry, onBack, ...formProps }: ProfileEditScreenProps) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <BackHeader title="프로필 편집" onBack={onBack} />
      {info ? (
        // 서버 값으로 입력칸을 한 번만 채우도록, 정보가 생긴 뒤에 폼을 만든다
        <ProfileForm key={info.memberId} info={info} {...formProps} />
      ) : (
        <LoadState error={loadError} onRetry={onRetry} />
      )}
    </SafeAreaView>
  );
}

type ProfileFormProps = Pick<ProfileEditScreenProps, 'saving' | 'saveError' | 'onSubmit'> & { info: MyInfoDto };

function ProfileForm({ info, saving, saveError, onSubmit }: ProfileFormProps) {
  const [name, setName] = useState(info.name);
  const [email, setEmail] = useState(info.email ?? '');
  const [phone, setPhone] = useState(info.phone ?? '');

  const trimmedEmail = email.trim();
  const emailInvalid = trimmedEmail.length > 0 && !isEmail(trimmedEmail);
  const changed =
    name.trim() !== info.name || trimmedEmail !== (info.email ?? '') || phone.trim() !== (info.phone ?? '');
  const canSubmit = name.trim().length > 0 && !emailInvalid && changed && !saving;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({
      name: name.trim(),
      // 빈 칸은 null 로 보낸다 (서버는 받은 값으로 덮어쓴다)
      email: trimmedEmail || null,
      phone: phone.trim() || null,
    });
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormField label="아이디">
          <FormInput value={info.memberName} editable={false} style={styles.readOnly} accessibilityLabel="아이디" />
        </FormField>

        <FormField label="이름">
          <FormInput value={name} onChangeText={setName} placeholder="이름" maxLength={50} accessibilityLabel="이름" />
        </FormField>

        <FormField label="이메일 (선택)">
          <FormInput
            value={email}
            onChangeText={setEmail}
            placeholder="example@routineslim.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={100}
            accessibilityLabel="이메일"
          />
          {emailInvalid ? <Text style={styles.fieldError}>이메일 형식을 확인해 주세요.</Text> : null}
        </FormField>

        <FormField label="전화번호 (선택)">
          <FormInput
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/[^0-9-]/g, ''))}
            placeholder="010-0000-0000"
            keyboardType="phone-pad"
            maxLength={13}
            accessibilityLabel="전화번호"
          />
        </FormField>

        {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}

        <View style={styles.spacer} />

        <Button size="md" title={saving ? '저장 중…' : '저장'} disabled={!canSubmit} onPress={submit} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  readOnly: {
    color: colors.textDisabled,
  },
  fieldError: {
    ...typography.small,
    color: colors.danger,
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
