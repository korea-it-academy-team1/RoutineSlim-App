import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EyeIcon from '@/assets/icons/eye.svg';
import LockIcon from '@/assets/icons/lock.svg';
import UserIcon from '@/assets/icons/user.svg';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { TextField } from '@/components/ui/TextField';
import { colors, spacing, typography } from '@/theme';

import { BiometricLoginCard } from '../components/BiometricLoginCard';
import { LoginHero } from '../components/LoginHero';
import { SocialLoginButtons, type SocialProvider } from '../components/SocialLoginButtons';

type LoginScreenProps = {
  onLogin?: (credentials: { id: string; password: string; keepLoggedIn: boolean }) => void;
  onSocialLogin?: (provider: SocialProvider) => void;
  onBiometricLogin?: () => void;
  onResetPassword?: () => void;
  onSignUp?: () => void;
};

export function LoginScreen({
  onLogin,
  onSocialLogin,
  onBiometricLogin,
  onResetPassword,
  onSignUp,
}: LoginScreenProps) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <LoginHero savingsAmount="61,790" />

        <View style={styles.form}>
          <TextField
            label="아이디"
            placeholder="이메일 또는 아이디"
            value={id}
            onChangeText={setId}
            autoCapitalize="none"
            autoComplete="username"
            keyboardType="email-address"
            leftIcon={<UserIcon width={15.7} height={17.2} />}
          />
          <TextField
            label="비밀번호"
            placeholder="비밀번호 입력"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoComplete="password"
            leftIcon={<LockIcon width={14.7} height={18.2} />}
            rightAccessory={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                hitSlop={8}
                onPress={() => setShowPassword((v) => !v)}
              >
                <EyeIcon width={19.7} height={9.95} />
              </Pressable>
            }
          />
        </View>

        <View style={styles.optionsRow}>
          <Checkbox label="로그인 상태 유지" checked={keepLoggedIn} onChange={setKeepLoggedIn} />
          <Pressable accessibilityRole="link" hitSlop={8} onPress={onResetPassword}>
            <Text style={styles.resetPassword}>비밀번호 재설정</Text>
          </Pressable>
        </View>

        <Button title="로그인" style={styles.loginButton} onPress={() => onLogin?.({ id, password, keepLoggedIn })} />

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>또는 간편 로그인</Text>
          <View style={styles.dividerLine} />
        </View>

        <SocialLoginButtons onPress={(provider) => onSocialLogin?.(provider)} />

        <View style={styles.biometric}>
          <BiometricLoginCard onPress={() => onBiometricLogin?.()} />
        </View>

        <View style={styles.signUpRow}>
          <Text style={styles.signUpPrompt}>아직 회원이 아니신가요?</Text>
          <Pressable accessibilityRole="link" hitSlop={8} onPress={onSignUp}>
            <Text style={styles.signUpLink}>회원가입</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: 9,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  form: {
    marginTop: 19,
    gap: 13,
  },
  optionsRow: {
    marginTop: 14,
    paddingHorizontal: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resetPassword: {
    ...typography.caption,
    color: colors.textMuted,
  },
  loginButton: {
    marginTop: spacing.lg,
  },
  divider: {
    marginTop: 22,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.small,
    color: colors.textMuted,
    width: 118,
    textAlign: 'center',
  },
  biometric: {
    marginTop: spacing.xl,
  },
  signUpRow: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  signUpPrompt: {
    ...typography.body,
    color: colors.textMuted,
  },
  signUpLink: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});
