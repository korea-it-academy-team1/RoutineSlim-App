/*
 * ============================================================================
 * [홈 구현 1/8] 구독 API 호출 함수
 * ============================================================================
 * "서버에 무엇을 보내고 무엇을 받는지" 만 담당한다. 화면용 모양으로 바꾸는 건 toSubscription.ts(3번).
 * 서버 코드: RoutineSlim-Server domain/subscription/controller/SubscriptionController.java
 *            응답 DTO: domain/subscription/dto/SubscriptionResponse.java
 * 전체 순서와 파일 목록은 docs/home-guide.md
 *
 * 먼저 할 것: 로그인 5번 src/features/auth/authorizedRequest.ts 를 구현해야 한다 (지금 export {} 만 있음).
 *   이 파일의 함수는 모두 authorizedRequest() 로 부른다 (X-Member-Id 헤더를 자동으로 붙여 줌).
 *
 * ----------------------------------------------------------------------------
 * 서버 API
 * ----------------------------------------------------------------------------
 *   GET /api/v1/subscriptions            헤더 X-Member-Id → SubscriptionResponse[]  (삭제된 구독은 빠짐)
 *   GET /api/v1/subscriptions?status=ACTIVE   status 하나로 거를 수 있음 (TRIAL / ACTIVE / PAUSED / CANCELED)
 *   - 홈은 status 없이 한 번에 받아서 앱에서 거른다 (TRIAL + ACTIVE 를 같이 써야 해서)
 *   - 응답은 { success, data } 껍데기 없이 배열 그대로
 *   - 지금 dev 서버는 SecurityConfig 때문에 이 API 가 403 이다 (서버 쪽 수정 필요, docs/home-guide.md 참고)
 *
 * ----------------------------------------------------------------------------
 * 만들 것
 * ----------------------------------------------------------------------------
 *   (1) 서버 응답 타입 (SubscriptionResponse.java 필드 그대로, 날짜는 문자열로 온다)
 *
 *       export type BillingCycleDto = 'WEEKLY' | 'MONTHLY' | 'YEARLY';
 *       export type SubscriptionStatusDto = 'TRIAL' | 'ACTIVE' | 'PAUSED' | 'CANCELED';
 *
 *       export type SubscriptionDto = {
 *         id: string;                 // UUID
 *         name: string;               // 서비스 이름 (예: 넷플릭스)
 *         categoryId: number;         // subscription_category 번호 (1 OTT, 2 음악, 3 클라우드, 4 쇼핑)
 *         presetId: number | null;    // 프리셋에서 골랐으면 번호, 직접 입력이면 null
 *         cardId: number | null;
 *         amount: number;             // 1회 결제 금액 (원)
 *         currency: string;           // 'KRW'
 *         billingCycle: BillingCycleDto;
 *         cycleInterval: number;      // 주기 배수 (3개월마다 = MONTHLY + 3)
 *         monthlyAmount: number;      // 월 환산 금액 (서버가 계산). 홈 총액은 이 값의 합
 *         startDate: string;          // 'YYYY-MM-DD'
 *         billingDay: number;
 *         nextBillingDate: string;    // 'YYYY-MM-DD'. 서버 배치가 매일 00:05 에 지난 결제일을 다음 날짜로 넘긴다
 *         status: SubscriptionStatusDto;
 *         trialEndDate: string | null;
 *         notifyEnabled: boolean;
 *         notifyDaysBefore: number | null;
 *         memo: string | null;
 *         canceledAt: string | null;
 *         createdAt: string;
 *         updatedAt: string;
 *       };
 *
 *   (2) export function getSubscriptions(status?: SubscriptionStatusDto): Promise<SubscriptionDto[]>
 *       - status 가 있으면 경로 뒤에 `?status=${status}` 를 붙인다
 *       - return authorizedRequest<SubscriptionDto[]>(path);
 *
 *   (나중에) 등록·수정·삭제 화면을 연결할 때 같은 파일에 추가한다
 *       POST /api/v1/subscriptions, PUT /{id}, PATCH /{id}/status, DELETE /{id}
 *
 * ----------------------------------------------------------------------------
 * 확인 방법
 * ----------------------------------------------------------------------------
 *   로그인 후 아무 화면에서 잠깐 console.log(await getSubscriptions()) → 배열이 찍히면 성공.
 *   빈 배열이면 Postman 등으로 POST /api/v1/subscriptions 를 몇 개 넣어 둔다.
 */
import { authorizedRequest } from '@/features/auth/authorizedRequest';

export type BillingCycleDto = 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export type SubscriptionStatusDto = 'TRIAL' | 'ACTIVE' | 'PAUSED' | 'CANCELED';

export type SubscriptionDto = {
  id: string;                 // UUID
  name: string;               // 서비스 이름 (예: 넷플릭스)
  categoryId: number;         // subscription_category 번호 (1 OTT, 2 음악, 3 클라우드, 4 쇼핑)
  presetId: number | null;    // 프리셋에서 골랐으면 번호, 직접 입력이면 null
  cardId: number | null;
  amount: number;             // 1회 결제 금액 (원)
  currency: string;           // 'KRW'
  billingCycle: BillingCycleDto;
  cycleInterval: number;      // 주기 배수 (3개월마다 = MONTHLY + 3)
  monthlyAmount: number;      // 월 환산 금액 (서버가 계산). 홈 총액은 이 값의 합
  startDate: string;          // 'YYYY-MM-DD'
  billingDay: number;
  nextBillingDate: string;    // 'YYYY-MM-DD'. 서버 배치가 매일 00:05 에 지난 결제일을 다음 날짜로 넘긴다
  status: SubscriptionStatusDto;
  trialEndDate: string | null;
  notifyEnabled: boolean;
  notifyDaysBefore: number | null;
  memo: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
};
export async function getSubscriptions(
  status?: SubscriptionStatusDto):
   Promise<SubscriptionDto[]> {
  const path = status ?
   `/api/v1/subscriptions?status=${status}`
    : '/api/v1/subscriptions';
  return authorizedRequest<SubscriptionDto[]>(path);
}

/** 서버 SubscriptionCreateRequest (보내지 않은 값은 서버 기본값) */
export type SubscriptionCreateBody = {
  name: string;
  categoryId: number;
  amount: number;
  billingCycle: BillingCycleDto;
  /** 'YYYY-MM-DD' */
  startDate: string;
  /** 프리셋(service_preset)에서 골랐으면 그 번호 */
  presetId?: number | null;
  cardId?: number | null;
  memo?: string | null;
};

export function createSubscription(body: SubscriptionCreateBody) {
  return authorizedRequest<SubscriptionDto>('/api/v1/subscriptions', { method: 'POST', body });
}

/** 서버 SubscriptionUpdateRequest (전체 값을 보낸다) */
export type SubscriptionUpdateBody = SubscriptionCreateBody & {
  currency?: string;
  cycleInterval?: number;
  trialEndDate?: string | null;
  notifyEnabled?: boolean;
  notifyDaysBefore?: number | null;
};

export function getSubscription(id: string) {
  return authorizedRequest<SubscriptionDto>(`/api/v1/subscriptions/${id}`);
}

export function updateSubscription(id: string, body: SubscriptionUpdateBody) {
  return authorizedRequest<SubscriptionDto>(`/api/v1/subscriptions/${id}`, { method: 'PUT', body });
}

/** 서버 SubscriptionScanResponse. 못 읽은 값은 null */
export type SubscriptionScanDto = {
  fileName: string | null;
  name: string | null;
  presetId: number | null;
  categoryId: number | null;
  amount: number | null;
  billingCycle: BillingCycleDto;
  /** 영수증 결제일 'YYYY-MM-DD' */
  startDate: string | null;
  /** 결제일과 주기로 계산한 다음 결제일 */
  nextBillingDate: string | null;
  presetMatched: boolean;
  recognized: { storeName: string | null; itemNames: string[] } | null;
};

/** 올릴 이미지. 웹은 File, 앱(iOS·Android)은 uri 로 보낸다 */
export type ReceiptImage = { uri: string; name: string; type: string; file?: File };

/**
 * 영수증·결제 내역 이미지 인식 (저장하지 않음).
 * POST /api/v1/subscriptions/scan  multipart/form-data, 필드 이름 image. jpg, png, pdf, 최대 10MB
 * 서버에 CLOVA OCR 설정이 없으면 503 (application-local.yml 의 clova.ocr.url / secret)
 */
export function scanReceipt(image: ReceiptImage) {
  const form = new FormData();
  if (image.file) {
    form.append('image', image.file, image.name);
  } else {
    // React Native 의 FormData 는 { uri, name, type } 객체를 파일로 보낸다
    form.append('image', { uri: image.uri, name: image.name, type: image.type } as unknown as Blob);
  }
  return authorizedRequest<SubscriptionScanDto>('/api/v1/subscriptions/scan', { method: 'POST', body: form });
}
