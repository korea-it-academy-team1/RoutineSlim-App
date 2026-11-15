import { authorizedRequest } from '@/features/auth/authorizedRequest';

/** 최근 사용 정도 (회원이 직접 체크). 서버 UsageLevel */
export type UsageLevelDto = 'OFTEN' | 'SOMETIMES' | 'RARELY' | 'NEVER';

/** 서버 UsageCheckDTO — 구독당 최신 1건 */
export type UsageCheckDto = {
  subscriptionId: string;
  usageLevel: UsageLevelDto;
  checkedOn: string; // 'YYYY-MM-DD'
};

/** 내 구독들의 사용량 체크 */
export function getUsageChecks() {
  return authorizedRequest<UsageCheckDto[]>('/usage');
}

/** 한 구독의 사용 정도 저장 (다시 체크하면 덮어쓴다) */
export function saveUsageCheck(subscriptionId: string, usageLevel: UsageLevelDto) {
  return authorizedRequest<UsageCheckDto>(`/usage/${subscriptionId}`, { method: 'PUT', body: { usageLevel } });
}
