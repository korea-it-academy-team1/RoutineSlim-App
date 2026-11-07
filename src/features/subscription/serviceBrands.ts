/*
 * ============================================================================
 * [홈 구현 2/8] 서비스별 로고·대표색 표
 * ============================================================================
 * 서버(DB)에는 로고 그림과 대표색이 없다 (service_preset.logo_url 은 비어 있고, 대표색 컬럼은 없음).
 * 그래서 앱이 "서비스 이름 → 로고·대표색" 표를 들고 있는다. toSubscription.ts(3번)가 이 표를 쓴다.
 *
 * ----------------------------------------------------------------------------
 * 만들 것
 * ----------------------------------------------------------------------------
 *   (1) export type ServiceBrand = { logo: ServiceLogo; accent: { color: string; soft: string } };
 *       - ServiceLogo 는 ./types 에 이미 있다
 *
 *   (2) export const SERVICE_BRANDS: Record<string, ServiceBrand>
 *       - 키는 서비스 이름. 서버 V2__seed_categories_presets.sql 의 service_preset.service_name 과 똑같이 쓴다
 *         넷플릭스 / 디즈니+ / YouTube Premium / 스포티파이 / iCloud+ / 쿠팡 와우
 *       - 값은 data/mockSubscriptions.ts 의 logo, accent 를 그대로 옮긴다 (svg import 도 같이 옮김)
 *       - presetId(숫자)를 키로 쓰지 않는 이유: DB 마다 번호가 달라질 수 있어서. 이름은 시드에 고정돼 있다
 *
 *   (3) export function getServiceBrand(name: string): ServiceBrand
 *       - 표에 있으면 그 값
 *       - 없으면 (직접 입력한 구독) 기본값: 이름 첫 글자 텍스트 로고
 *           logo:   { kind: 'text', text: name.slice(0, 1), color: '#FFFFFF', fontSize: 16.56, background: '#A5AABB' }
 *           accent: { color: colors.primary, soft: colors.backgroundMuted } 처럼 theme 색에서 고른다
 *
 *   주의: mockSubscriptions.ts 는 아직 캘린더·통계 화면이 쓰고 있으니 지우지 않는다.
 *         두 곳에 같은 값이 생기지만, 캘린더·통계도 API 로 바꿀 때 목업을 정리한다.
 *
 * ----------------------------------------------------------------------------
 * 확인 방법
 * ----------------------------------------------------------------------------
 *   getServiceBrand('넷플릭스').logo.text === 'N'
 *   getServiceBrand('왓챠').logo.text === '왓'
 */

// 아직 구현 전. 구현하면 이 줄은 지운다
export {};
