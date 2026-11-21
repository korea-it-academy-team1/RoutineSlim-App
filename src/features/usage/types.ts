/*
 * 정리 방법 데이터 모양.
 * 서비스별 더 저렴한 요금제·파티원 인원을 주는 서버 API 가 아직 없어서, 지금은 빈 값({})을 쓴다.
 * 그래서 정리 방법은 '해지하기'·'그대로 두기' 두 가지만 나온다. API 가 생기면 NO_CLEANUP_OPTIONS 대신 넘긴다.
 */

/** 서비스별 정리 방법 정보 */
export type CleanupOptionInfo = {
  /** 더 저렴한 요금제 (월 금액). note: 바꾸면 달라지는 점 */
  cheaperPlan?: { name: string; price: number; note?: string };
  /** 파티원 모집 시 나눌 인원 (본인 포함) */
  partyMembers?: number;
  /** 정리 방법 선택 화면에서 해지 선택 시 보여줄 안내 */
  cancelNote?: string;
  /** 전후 비교 화면에서 해지 시 함께 달라지는 점 */
  cancelEffect?: string;
};

/** 정리 방법 API 가 생기기 전까지 쓰는 빈 값 */
export const NO_CLEANUP_OPTIONS: Record<string, CleanupOptionInfo> = {};
