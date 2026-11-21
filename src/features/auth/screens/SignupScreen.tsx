import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EyeIcon from '@/assets/icons/eye.svg';
import LockIcon from '@/assets/icons/lock.svg';
import UserIcon from '@/assets/icons/user.svg';
import { BackHeader } from '@/components/common/BackHeader';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { colors, spacing, typography } from '@/theme';

import type { SignupForm } from '../utils/signupForm';

type SignupScreenProps = {
  onBack: () => void;
  /** 가입 버튼. 입력값 확인·서버 요청은 route 가 한다 */
  onSubmit: (form: SignupForm) => void;
  errorMessage?: string | null;
  submitting?: boolean;
};

/**
 * 회원가입. Figma 시안이 없어 로그인 화면의 입력칸(TextField)·버튼 스타일을 그대로 쓴다.
 * 항목은 서버 SignupRequestDTO 와 웹(RoutineSlim-Web SignupForm) 과 같다.
 */
export function SignupScreen({ onBack, onSubmit, errorMessage, submitting = false }: SignupScreenProps) {
  const [form, setForm] = useState<SignupForm>({
    memberName: '',
    password: '',
    passwordConfirm: '',
    name: '',
    email: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const update = (key: keyof SignupForm) => (text: string) => setForm((prev) => ({ ...prev, [key]: text }));

  const eyeToggle = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
      hitSlop={8}
      onPress={() => setShowPassword((v) => !v)}
    >
      <EyeIcon width={19.7} height={9.95} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <BackHeader title="회원가입" onBack={onBack} />

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.subtitle}>계정을 만들고 구독 관리를 시작하세요.</Text>

          <View style={styles.form}>
            <TextField
              label="아이디 *"
              placeholder="아이디 입력"
              value={form.memberName}
              onChangeText={update('memberName')}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              maxLength={50}
              leftIcon={<UserIcon width={15.7} height={17.2} />}
            />
            <TextField
              label="비밀번호 *"
              placeholder="8자 이상"
              value={form.password}
              onChangeText={update('password')}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              leftIcon={<LockIcon width={14.7} height={18.2} />}
              rightAccessory={eyeToggle}
            />
            <TextField
              label="비밀번호 확인 *"
              placeholder="비밀번호 다시 입력"
              value={form.passwordConfirm}
              onChangeText={update('passwordConfirm')}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              leftIcon={<LockIcon width={14.7} height={18.2} />}
            />
            <TextField
              label="이름 *"
              placeholder="이름 입력"
              value={form.name}
              onChangeText={update('name')}
              autoComplete="name"
              maxLength={50}
            />
            <TextField
              label="이메일 (선택)"
              placeholder="example@email.com"
              value={form.email}
              onChangeText={update('email')}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              maxLength={255}
            />
            <TextField
              label="전화번호 (선택)"
              placeholder="010-1234-5678"
              value={form.phone}
              onChangeText={update('phone')}
              autoComplete="tel"
              keyboardType="phone-pad"
              maxLength={30}
            />
          </View>

          {errorMessage ? (
            <Text style={styles.error} accessibilityRole="alert">
              {errorMessage}
            </Text>
          ) : null}

          <Button
            title={submitting ? '가입 중...' : '가입하기'}
            style={styles.submit}
            disabled={submitting}
            onPress={() => onSubmit(form)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  form: {
    marginTop: 19,
    gap: 13,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.sm,
  },
  submit: {
    marginTop: spacing.lg,
  },
});
