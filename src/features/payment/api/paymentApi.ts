import { authorizedRequest } from '@/features/auth/authorizedRequest';
import type { BillingCycleDto, SubscriptionStatusDto } from '@/features/subscription/api/subscriptionApi';

/** 서버 PaymentDTO — 청구 기록 1건 */
export type PaymentDto = {
  subscriptionId: string; // UUID
  subscriptionName: string;
  categoryId: number; // 1 OTT, 2 음악, 3 클라우드, 4 쇼핑
  billedOn: string; // 'YYYY-MM-DD'
  amount: number; // 청구 당시 금액 (원)
  currency: string; // 'KRW'
  billingCycle: BillingCycleDto; // 구독의 결제 주기
  status: SubscriptionStatusDto; // 구독의 현재 상태 (해지했으면 CANCELED)
};

/** 서버 MonthlyPaymentResponseDTO */
export type MonthlyPaymentDto = {
  yearMonth: string; // 'YYYY-MM'
  totalAmount: number;
  count: number;
  payments: PaymentDto[]; // 청구일 순
};

/**
 * 월별 청구 기록. 서버가 결제일마다 남긴 실제 기록이라 지난달 통계·캘린더에 쓴다.
 * 결제일이 지나야 기록이 생기므로 이번 달은 남은 예정분을 따로 더해야 한다 (utils/monthlyPayments.ts).
 */
export async function getMonthlyPayments(year: number, month: number): Promise<MonthlyPaymentDto> {
  const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
  return authorizedRequest<MonthlyPaymentDto>(`/payment/monthly?yearMonth=${yearMonth}`);
}

/** 한 구독의 최근 청구 기록 (최근 청구일 순, 최대 24건) */
export async function getSubscriptionPayments(subscriptionId: string, limit = 6): Promise<PaymentDto[]> {
  return authorizedRequest<PaymentDto[]>(`/payment/subscription/${subscriptionId}?limit=${limit}`);
}
