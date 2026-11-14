import type { DateKey } from '@/utils/date';

/*
 * 사용량 점검 데이터 모양.
 * 앱 사용 기록·서비스별 정리 방법을 주는 서버 API 가 아직 없어서, 지금은 화면에 빈 값({})을 넘긴다.
 */

export type UsageRecord =
  /** 앱을 열어 사용량을 셀 수 있는 서비스. access: 기간 첫날부터 하루씩 '1'(접속) / '0' */
  | { kind: 'tracked'; access: string; lastAccessDate?: DateKey }
  /** 백그라운드로 쓰여 접속 일 수를 셀 수 없는 서비스 (iCloud 등) */
  | { kind: 'background' };

/** 서비스별 정리 방법 정보 */
export type CleanupOptionInfo = {
  /** 더 저렴한 요금제. note: 바꾸면 달라지는 점 */
  cheaperPlan?: { name: string; price: number; note?: string };
  /** 파티원 모집 시 나눌 인원 (본인 포함) */
  partyMembers?: number;
  /** 정리 방법 선택 화면에서 해지 선택 시 보여줄 안내 */
  cancelNote?: string;
  /** 전후 비교 화면에서 해지 시 함께 달라지는 점 */
  cancelEffect?: string;
};

/** 사용 기록 API 가 생기기 전까지 쓰는 빈 값 */
export const NO_USAGE: Record<string, UsageRecord> = {};
export const NO_CLEANUP_OPTIONS: Record<string, CleanupOptionInfo> = {};
