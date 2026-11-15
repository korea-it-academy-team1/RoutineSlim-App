import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/common/BackHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/Button';
import { FormField, FormInput } from '@/components/ui/FormField';
import { colors, radius, spacing, typography } from '@/theme';
import { formatWon } from '@/utils/format';

import { LoadState } from '../components/LoadState';

const QUICK_AMOUNTS = [50_000, 100_000, 150_000, 200_000];
const MAX_BUDGET = 100_000_000;
/** 예산의 이만큼을 넘으면 주의 색으로 */
const WARNING_RATIO = 0.8;

/** 지금 구독 월 합계보다 조금 넉넉하게, 만 원 단위로 올린 추천 예산 */
export function recommendBudget(monthlyTotal: number) {
  if (monthlyTotal <= 0) return null;
  return Math.ceil((monthlyTotal * 1.1) / 10_000) * 10_000;
}

const withComma = (amount: number) => amount.toLocaleString('ko-KR');

type BudgetScreenProps = {
  /** 저장된 월 예산. 내 정보를 불러오는 중이면 undefined, 미설정이면 null */
  budget: number | null | undefined;
  loadError?: string;
  onRetry: () => void;
  /** 이번 달 구독료 (결제 완료 + 남은 예정). 불러오는 중이면 null */
  spent: number | null;
  /** 이용 중인 구독의 월 환산 합계 (추천 예산 계산) */
  monthlyTotal: number;
  saving: boolean;
  saveError?: string;
  onBack: () => void;
  /** null 이면 예산 해제 */
  onSave: (budget: number | null) => void;
};

export function BudgetScreen({ budget, loadError, onRetry, onBack, ...rest }: BudgetScreenProps) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <BackHeader title="월 예산" onBack={onBack} />
      {budget !== undefined ? (
        // 서버 값으로 입력칸을 채우도록, 내 정보를 받은 뒤에 폼을 만든다
        <BudgetForm key={String(budget)} budget={budget} {...rest} />
      ) : (
        <LoadState error={loadError} onRetry={onRetry} />
      )}
    </SafeAreaView>
  );
}

type BudgetFormProps = Omit<BudgetScreenProps, 'budget' | 'loadError' | 'onRetry' | 'onBack'> & {
  budget: number | null;
};

function BudgetForm({ budget, spent, monthlyTotal, saving, saveError, onSave }: BudgetFormProps) {
  const [text, setText] = useState(budget ? withComma(budget) : '');
  const amount = Number(text.replace(/[^0-9]/g, '')) || 0;
  const recommended = recommendBudget(monthlyTotal);

  const changed = amount !== (budget ?? 0);
  const canSave = amount > 0 && amount <= MAX_BUDGET && changed && !saving;

  // 진행 막대는 저장된 예산 기준 (입력 중인 값은 저장 후 반영)
  const ratio = budget && spent !== null ? spent / budget : null;
  const barColor =
    ratio === null
      ? colors.primary
      : ratio > 1
        ? colors.danger
        : ratio >= WARNING_RATIO
          ? colors.warning
          : colors.primary;

  const setAmount = (value: number) => setText(withComma(value));

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.statusCard}>
          <Text style={styles.statusLabel}>이번 달 구독료</Text>
          <Text style={styles.statusAmount}>{spent === null ? '—' : formatWon(spent)}</Text>
          {budget ? (
            <>
              <View style={styles.track}>
                <View style={[styles.bar, { width: `${Math.min(ratio ?? 0, 1) * 100}%`, backgroundColor: barColor }]} />
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusMeta}>{`예산 ${formatWon(budget)}`}</Text>
                {spent !== null ? (
                  <Text style={[styles.statusMetaBold, { color: barColor }]}>
                    {spent > budget ? `${formatWon(spent - budget)} 초과` : `${formatWon(budget - spent)} 남음`}
                  </Text>
                ) : null}
              </View>
            </>
          ) : (
            <Text style={styles.statusMeta}>예산을 정하면 이번 달 구독료와 비교해 보여 드려요.</Text>
          )}
          <Text style={styles.statusNote}>이미 결제한 금액과 이번 달에 남은 결제 예정 금액을 합친 값이에요.</Text>
        </Card>

        <FormField label="월 예산">
          <FormInput
            value={text}
            onChangeText={(t) => {
              const digits = t.replace(/[^0-9]/g, '').slice(0, 9);
              setText(digits ? withComma(Number(digits)) : '');
            }}
            keyboardType="number-pad"
            placeholder="예: 100,000"
            accessibilityLabel="월 예산"
            trailing={<Text style={styles.unit}>원</Text>}
          />
          {amount > MAX_BUDGET ? <Text style={styles.fieldError}>1억 원 이하로 입력해 주세요.</Text> : null}
        </FormField>

        <View style={styles.chips}>
          {QUICK_AMOUNTS.map((value) => {
            const selected = value === amount;
            return (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setAmount(value)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{`${value / 10_000}만 원`}</Text>
              </Pressable>
            );
          })}
        </View>

        {recommended ? (
          <Pressable accessibilityRole="button" onPress={() => setAmount(recommended)} style={styles.recommend}>
            <Text style={styles.recommendTitle}>{`추천 예산 ${formatWon(recommended)}`}</Text>
            <Text style={styles.recommendBody}>
              {`지금 이용 중인 구독의 월 합계는 ${formatWon(monthlyTotal)}이에요. 조금 넉넉하게 잡은 금액이에요. 누르면 입력돼요.`}
            </Text>
          </Pressable>
        ) : null}

        {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}
        <View style={styles.spacer} />
        <Button size="md" title={saving ? '저장 중…' : '저장'} disabled={!canSave} onPress={() => onSave(amount)} />
        {budget ? (
          <Button
            size="md"
            variant="secondary"
            title="예산 해제"
            disabled={saving}
            onPress={() => onSave(null)}
            titleStyle={styles.secondaryTitle}
          />
        ) : null}
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
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  statusCard: {
    gap: spacing.sm,
  },
  statusLabel: {
    ...typography.listTitle,
    color: colors.textSubtle,
  },
  statusAmount: {
    ...typography.amountLg,
    color: colors.textTitle,
  },
  track: {
    height: 10,
    overflow: 'hidden',
    borderRadius: radius.pill,
    backgroundColor: colors.usageEmpty,
  },
  bar: {
    height: '100%',
    borderRadius: radius.pill,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusMeta: {
    ...typography.captionSm,
    color: colors.textSubtle,
  },
  statusMetaBold: {
    ...typography.captionSmBold,
  },
  statusNote: {
    ...typography.meta,
    color: colors.textMuted,
  },
  unit: {
    ...typography.formInput,
    color: colors.textSubtle,
  },
  fieldError: {
    ...typography.small,
    color: colors.danger,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },
  chipSelected: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  chipText: {
    ...typography.caption12Medium,
    color: colors.textBody,
  },
  chipTextSelected: {
    fontWeight: '700',
    color: colors.primaryStrong,
  },
  recommend: {
    gap: spacing.xs,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.primarySoft,
  },
  recommendTitle: {
    ...typography.infoTitle,
    color: colors.infoTitle,
  },
  recommendBody: {
    ...typography.infoBody,
    color: colors.infoBody,
  },
  saveError: {
    ...typography.small,
    color: colors.danger,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
  secondaryTitle: {
    color: colors.primary,
  },
});
