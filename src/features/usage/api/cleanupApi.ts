import { authorizedRequest } from '@/features/auth/authorizedRequest';

import type { CleanupAction } from '../utils/cleanupPlan';

/** 서버 CleanupAction ('그대로 두기'는 저장하지 않는다) */
export type CleanupActionDto = 'CANCEL' | 'DOWNGRADE' | 'PARTY';

/** 서버 CleanupItemDTO — 정리 목록 1건 (금액은 월 환산) */
export type CleanupItemDto = {
  subscriptionId: string;
  subscriptionName: string;
  action: CleanupActionDto;
  monthlyAmount: number;
  newMonthlyAmount: number;
  nextBillingDate: string | null; // 'YYYY-MM-DD'
  remindOn: string | null; // 'YYYY-MM-DD', 결제일 3일 전
  createdAt: string;
};

/** 담기 요청 1건. KEEP 이면 서버가 목록에서 뺀다 */
export type CleanupSaveItemDto = {
  subscriptionId: string;
  action: CleanupActionDto | 'KEEP';
  /** DOWNGRADE·PARTY 일 때 정리 후 월 금액 */
  newMonthlyAmount?: number;
};

/** 내 정리 목록 (해지·삭제된 구독은 빠진다) */
export function getCleanupItems() {
  return authorizedRequest<CleanupItemDto[]>('/cleanup');
}

/** 정리 목록에 담기 (구독마다 덮어쓰기) → 저장 후 전체 목록 */
export function saveCleanupItems(items: CleanupSaveItemDto[]) {
  return authorizedRequest<CleanupItemDto[]>('/cleanup', { method: 'POST', body: { items } });
}

/** 정리 목록에서 빼기 */
export async function deleteCleanupItem(subscriptionId: string) {
  await authorizedRequest<null>(`/cleanup/${subscriptionId}`, { method: 'DELETE' });
}

/** 앱 정리 방법 → 서버 값 */
export const toCleanupActionDto = (action: CleanupAction): CleanupActionDto | 'KEEP' =>
  action === 'cancel' ? 'CANCEL' : action === 'downgrade' ? 'DOWNGRADE' : action === 'party' ? 'PARTY' : 'KEEP';
