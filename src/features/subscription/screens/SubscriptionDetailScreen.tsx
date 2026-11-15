import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackHeader } from '@/components/common/BackHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FormField, FormInput } from '@/components/ui/FormField';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Toggle } from '@/components/ui/Toggle';
import type { PaymentDto } from '@/features/payment/api/paymentApi';
import { LoadState } from '@/features/my/components/LoadState';
import { colors, spacing, typography } from '@/theme';
import type { DateKey } from '@/utils/date';
import { formatMonthDay, formatWon } from '@/utils/format';

import type { SubscriptionDto, SubscriptionStatusDto } from '../api/subscriptionApi';
import { CATEGORY_META, CATEGORY_ORDER, categoryFromId } from '../categories';
import { ServiceLogoView } from '../components/ServiceLogoView';
import { getServiceBrand } from '../serviceBrands';
import type { SubscriptionCategory } from '../types';
import { digitsOnly, formatDateInput, parseDateInput, type BillingCycle } from '../utils/billingForm';

const CATEGORY_OPTIONS = CATEGORY_ORDER.map((c) => ({ value: c, label: CATEGORY_META[c].label }));
const CYCLE_FROM_DTO: Record<SubscriptionDto['billingCycle'], BillingCycle> = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};
const CYCLE_LABEL: Record<BillingCycle, string> = { weekly: '매주', monthly: '매월', yearly: '매년' };
const STATUS_LABEL: Record<SubscriptionStatusDto, string> = {
  TRIAL: '체험판',
  ACTIVE: '이용 중',
  PAUSED: '일시정지',
  CANCELED: '해지',
};
const MEMO_MAX_LENGTH = 100;

/** 저장할 값. 라우트가 서버 PUT 본문으로 바꾼다 */
export type SubscriptionEdit = {
  name: string;
  category: SubscriptionCategory;
  price: number;
  cycle: BillingCycle;
  nextBillingDate: DateKey;
  notifyEnabled: boolean;
  memo: string | null;
};

type SubscriptionDetailScreenProps = {
  /** 불러오는 중이면 null */
  subscription: SubscriptionDto | null;
  /** 최근 청구 기록. 불러오는 중이면 null */
  payments: PaymentDto[] | null;
  loadError?: string;
  onRetry: () => void;
  /** 저장·상태 변경·삭제 요청 중 */
  busy: boolean;
  /** 실패 안내 */
  actionError?: string;
  onBack: () => void;
  onSave: (edit: SubscriptionEdit) => void;
  onChangeStatus: (status: SubscriptionStatusDto) => void;
  onDelete: () => void;
};

export function SubscriptionDetailScreen({
  subscription,
  loadError,
  onRetry,
  onBack,
  ...rest
}: SubscriptionDetailScreenProps) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <BackHeader title="구독 상세" onBack={onBack} />
      {subscription ? (
        // 서버 값으로 입력칸을 채우도록 구독을 받은 뒤에 폼을 만든다. 저장 후 새 값이 오면 다시 채운다
        <DetailForm key={`${subscription.id}-${subscription.updatedAt}`} subscription={subscription} {...rest} />
      ) : (
        <LoadState error={loadError} onRetry={onRetry} />
      )}
    </SafeAreaView>
  );
}

type DetailFormProps = Omit<SubscriptionDetailScreenProps, 'subscription' | 'loadError' | 'onRetry' | 'onBack'> & {
  subscription: SubscriptionDto;
};

function DetailForm({ subscription, payments, busy, actionError, onSave, onChangeStatus, onDelete }: DetailFormProps) {
  const initialCategory = categoryFromId(subscription.categoryId) ?? 'shopping';
  const initialCycle = CYCLE_FROM_DTO[subscription.billingCycle];
  const initialDate = formatDateInput(subscription.nextBillingDate.replace(/-/g, ''));

  const [name, setName] = useState(subscription.name);
  const [category, setCategory] = useState<SubscriptionCategory>(initialCategory);
  const [price, setPrice] = useState(String(subscription.amount));
  const [cycle, setCycle] = useState<BillingCycle>(initialCycle);
  const [dateText, setDateText] = useState(initialDate);
  const [notifyEnabled, setNotifyEnabled] = useState(subscription.notifyEnabled);
  const [memo, setMemo] = useState(subscription.memo ?? '');

  // 매주 결제는 등록 화면에서 고를 수 없지만, 서버에 있으면 그대로 보여 준다
  const cycleOptions = (
    initialCycle === 'weekly' ? (['weekly', 'monthly', 'yearly'] as const) : (['monthly', 'yearly'] as const)
  ).map((value) => ({ value, label: CYCLE_LABEL[value] }));

  const nextBillingDate = parseDateInput(dateText);
  const priceNumber = Number(price);
  const changed =
    name.trim() !== subscription.name ||
    category !== initialCategory ||
    priceNumber !== subscription.amount ||
    cycle !== initialCycle ||
    dateText !== initialDate ||
    notifyEnabled !== subscription.notifyEnabled ||
    memo.trim() !== (subscription.memo ?? '');
  const canSave = name.trim().length > 0 && priceNumber > 0 && nextBillingDate !== null && changed && !busy;

  const status = subscription.status;
  const brand = getServiceBrand(subscription.name);

  const save = () => {
    if (!canSave || !nextBillingDate) return;
    onSave({
      name: name.trim(),
      category,
      price: priceNumber,
      cycle,
      nextBillingDate,
      notifyEnabled,
      memo: memo.trim() || null,
    });
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card style={styles.heroCard}>
          <ServiceLogoView logo={brand.logo} size="lg" />
          <View style={styles.heroTexts}>
            <Text style={styles.heroName} numberOfLines={1}>
              {subscription.name}
            </Text>
            <Text style={styles.heroMeta}>
              {status === 'CANCELED' || status === 'PAUSED'
                ? `${formatWon(subscription.amount)} · ${CYCLE_LABEL[initialCycle]}`
                : `${formatWon(subscription.amount)} · ${CYCLE_LABEL[initialCycle]} · 다음 결제 ${formatMonthDay(subscription.nextBillingDate)}`}
            </Text>
          </View>
          <Badge
            label={STATUS_LABEL[status]}
            tone={status === 'ACTIVE' || status === 'TRIAL' ? 'primary' : 'neutral'}
          />
        </Card>

        <Text style={styles.sectionTitle}>결제 정보</Text>
        <FormField label="서비스 이름">
          <FormInput value={name} onChangeText={setName} maxLength={100} accessibilityLabel="서비스 이름" />
        </FormField>
        <FormField label="카테고리">
          <SegmentedControl options={CATEGORY_OPTIONS} value={category} onChange={setCategory} />
        </FormField>
        <FormField label="결제 금액">
          <FormInput
            value={price}
            onChangeText={(t) => setPrice(digitsOnly(t).slice(0, 9))}
            keyboardType="number-pad"
            accessibilityLabel="결제 금액"
            trailing={<Text style={styles.unit}>원</Text>}
          />
        </FormField>
        <FormField label="결제 주기">
          <SegmentedControl options={cycleOptions} value={cycle} onChange={setCycle} />
        </FormField>
        <FormField label="다음 결제일">
          <FormInput
            value={dateText}
            onChangeText={(t) => setDateText(formatDateInput(t))}
            keyboardType="number-pad"
            placeholder="YYYY. MM. DD"
            accessibilityLabel="다음 결제일"
          />
          {dateText.length > 0 && nextBillingDate === null ? (
            <Text style={styles.fieldError}>날짜를 YYYY. MM. DD 형식으로 입력해 주세요.</Text>
          ) : null}
        </FormField>
        <View style={styles.toggleRow}>
          <View style={styles.toggleTexts}>
            <Text style={styles.toggleTitle}>결제 알림</Text>
            <Text style={styles.toggleSub}>마이 &gt; 알림 설정의 시점에 알려 드려요</Text>
          </View>
          <Toggle value={notifyEnabled} onChange={setNotifyEnabled} accessibilityLabel="결제 알림" />
        </View>
        <FormField label="메모 (선택)">
          <FormInput
            value={memo}
            onChangeText={setMemo}
            maxLength={MEMO_MAX_LENGTH}
            placeholder="예: 가족 공유 계정"
            accessibilityLabel="메모"
          />
        </FormField>

        {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}
        <Button size="md" title={busy ? '처리 중…' : '변경 내용 저장'} disabled={!canSave} onPress={save} />

        <Text style={styles.sectionTitle}>최근 결제 기록</Text>
        <Card style={styles.paymentsCard}>
          {payments === null ? (
            <Text style={styles.empty}>불러오는 중…</Text>
          ) : payments.length === 0 ? (
            <Text style={styles.empty}>아직 결제 기록이 없어요</Text>
          ) : (
            payments.map((p, index) => (
              <View key={p.billedOn} style={[styles.paymentRow, index > 0 && styles.paymentDivider]}>
                <Text style={styles.paymentDate}>{p.billedOn.replace(/-/g, '. ')}</Text>
                <Text style={styles.paymentAmount}>{formatWon(p.amount)}</Text>
              </View>
            ))
          )}
        </Card>

        <Text style={styles.sectionTitle}>구독 상태</Text>
        <View style={styles.statusActions}>
          {status === 'PAUSED' || status === 'CANCELED' ? (
            <Button
              size="md"
              variant="secondary"
              title={status === 'PAUSED' ? '다시 시작' : '다시 구독'}
              disabled={busy}
              onPress={() => onChangeStatus('ACTIVE')}
              titleStyle={styles.secondaryTitle}
              style={styles.flex}
            />
          ) : (
            <Button
              size="md"
              variant="secondary"
              title="일시정지"
              disabled={busy}
              onPress={() => onChangeStatus('PAUSED')}
              titleStyle={styles.secondaryTitle}
              style={styles.flex}
            />
          )}
          {status !== 'CANCELED' ? (
            <Button
              size="md"
              variant="secondary"
              title="해지"
              disabled={busy}
              onPress={() => onChangeStatus('CANCELED')}
              titleStyle={styles.secondaryTitle}
              style={styles.flex}
            />
          ) : null}
        </View>
        <Text style={styles.statusNote}>
          해지·일시정지해도 지난 결제 기록은 통계와 캘린더에 남아요. 잘못 등록한 구독은 삭제해 주세요.
        </Text>
        <Button
          size="md"
          variant="secondary"
          title="구독 삭제"
          disabled={busy}
          onPress={onDelete}
          titleStyle={styles.deleteTitle}
        />
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
    gap: spacing.md,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroTexts: {
    flex: 1,
    gap: 2,
  },
  heroName: {
    ...typography.cardTitle,
    color: colors.textTitle,
  },
  heroMeta: {
    ...typography.captionSm,
    color: colors.textSubtle,
  },
  sectionTitle: {
    ...typography.sectionTitleTight,
    paddingTop: spacing.md,
    color: colors.textTitle,
  },
  unit: {
    ...typography.formInput,
    color: colors.textSubtle,
  },
  fieldError: {
    ...typography.small,
    color: colors.danger,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  toggleTexts: {
    flex: 1,
    gap: 2,
  },
  toggleTitle: {
    ...typography.label14,
    color: colors.textLabel,
  },
  toggleSub: {
    ...typography.meta,
    color: colors.textMuted,
  },
  actionError: {
    ...typography.small,
    color: colors.danger,
    textAlign: 'center',
  },
  paymentsCard: {
    paddingVertical: spacing.xs,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  paymentDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  paymentDate: {
    ...typography.body13,
    color: colors.textBody,
  },
  paymentAmount: {
    ...typography.listAmount,
    color: colors.textTitle,
  },
  empty: {
    ...typography.body13,
    paddingVertical: spacing.md,
    textAlign: 'center',
    color: colors.textSubtle,
  },
  statusActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryTitle: {
    color: colors.primary,
  },
  statusNote: {
    ...typography.meta,
    color: colors.textSubtle,
  },
  deleteTitle: {
    color: colors.danger,
  },
});
