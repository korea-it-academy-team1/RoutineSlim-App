import { categoryFromId } from '../categories';
import type { SubscriptionScanDto } from '../api/subscriptionApi';
import type { ScanResult } from '../types';

const CYCLE: Record<SubscriptionScanDto['billingCycle'], ScanResult['cycle']> = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
};

/** 서버 스캔 응답 → 스캔 결과 화면 입력값 */
export function toScanResult(dto: SubscriptionScanDto, fallbackFileName: string): ScanResult {
  const storeName = dto.recognized?.storeName;
  return {
    source: {
      title: storeName ? `${storeName} 결제 내역` : '결제 내역',
      fileName: dto.fileName ?? fallbackFileName,
    },
    name: dto.name ?? '',
    price: dto.amount,
    cycle: CYCLE[dto.billingCycle] ?? 'monthly',
    nextBillingDate: dto.nextBillingDate,
    category: categoryFromId(dto.categoryId),
    presetId: dto.presetId,
  };
}
