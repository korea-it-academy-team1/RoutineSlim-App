import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

export type ServiceLogo =
  | { kind: 'text'; text: string; color: string; fontSize: number; background: string }
  | {
      kind: 'icon';
      Icon: FC<SvgProps>;
      size: number;
      background: string;
      /** 큰 로고(42px)용 별도 에셋. 없으면 Icon 을 비율대로 키운다 */
      large?: { Icon: FC<SvgProps>; size: number };
    };

export type SubscriptionCategory = 'ott' | 'music' | 'cloud' | 'shopping';

/*
 * [홈 구현 4/8] 서버 연동을 위해 Subscription 타입 넓히기 (전체 순서: docs/home-guide.md)
 *
 * 할 일
 *   (1) cycle 에 'weekly' 추가:  cycle: 'weekly' | 'monthly' | 'yearly';
 *       - 서버 billingCycle 이 WEEKLY 도 있어서
 *       - 넓히면 타입 오류가 나는 곳 (npx tsc --noEmit 로 확인)
 *           components/SubscriptionRow.tsx  CYCLE_LABEL 에 weekly: '매주' 추가 (그 파일 주석 참고)
 *           utils/renewal.ts                getRenewalDateInMonth 는 weekly 를 아직 모른다.
 *                                           캘린더 연동 전까지는 nextBillingDate 가 그 달이면 그날만 반환해도 된다
 *       - utils/billingForm.ts 의 BillingCycle(등록 화면)은 따로 있으니 이번에는 건드리지 않는다
 *   (2) monthlyPrice: number;  추가 — 월 환산 금액 (서버 monthlyAmount). 홈 총액은 이 값의 합
 *       price 는 지금처럼 1회 결제 금액 (행에 표시)
 *   (3) status: 'TRIAL' | 'ACTIVE' | 'PAUSED' | 'CANCELED';  추가 — 서버 값 그대로 (대문자)
 *   (4) data/mockSubscriptions.ts 의 목업 6개에도 monthlyPrice(= price), status('ACTIVE') 를 채운다
 *       (캘린더·통계 화면이 아직 목업을 쓰고, 홈 계산(5번)도 목업으로 먼저 확인하므로)
 */
export type Subscription = {
  id: string;
  name: string;
  category: SubscriptionCategory;
  /** 요금제 이름 (예: 스탠다드, 프리미엄) */
  plan?: string;
  /** 서비스 대표색 (확장 캘린더 금액 칩 등). color: 진한 색, soft: 옅은 배경 */
  accent: { color: string; soft: string };
  logo: ServiceLogo;
  price: number;
  /** 다음 결제일 (YYYY-MM-DD) */
  nextBillingDate: string;
  cycle: 'monthly' | 'yearly';
};
