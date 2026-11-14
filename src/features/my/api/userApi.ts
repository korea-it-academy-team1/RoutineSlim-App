/*
 * 마이페이지 API 호출 함수
 *
 * 서버 코드: RoutineSlim-Server domain/user/controller/UserController.java
 *            DTO: domain/user/dto/UserDTO.java, NotificationSettingsRequestDTO.java
 * 모두 authorizedRequest() 로 부른다 (X-Member-Id 헤더를 자동으로 붙여 줌).
 *
 * 서버 API (경로 앞에 /api/v1 이 없다)
 *   GET    /users/getMyInfo              → UserDTO
 *   PUT    /users/updateMyInfo           { name, email, phone } → 200, 본문 없음
 *                                        name 은 필수. email/phone 은 보낸 값으로 덮어쓴다 (null 이면 지워짐)
 *   DELETE /users/withdrawUser           → 200 (soft delete. 이후 같은 UUID 로 부르면 오류)
 *   PUT    /users/notification-settings  { defaultNotificationDays: 0~30, notificationTime: 'HH:mm:ss' } → 200
 */
import { authorizedRequest } from '@/features/auth/authorizedRequest';

/** 서버 UserDTO. 날짜·시간은 문자열로 온다 */
export type MyInfoDto = {
  memberId: string;
  /** 로그인 아이디 (수정 불가) */
  memberName: string;
  name: string;
  email: string | null;
  phone: string | null;
  /** 결제 며칠 전에 알릴지 (0 = 당일) */
  defaultNotificationDays: number;
  /** 'HH:mm:ss' */
  notificationTime: string;
  /** 'YYYY-MM-DDTHH:mm:ss' */
  createdAt: string;
  updatedAt: string | null;
};

export type UpdateMyInfoBody = {
  name: string;
  email: string | null;
  phone: string | null;
};

export type NotificationSettingsBody = {
  defaultNotificationDays: number;
  /** 'HH:mm:ss' */
  notificationTime: string;
};

export function getMyInfo() {
  return authorizedRequest<MyInfoDto>('/users/getMyInfo');
}

export function updateMyInfo(body: UpdateMyInfoBody) {
  return authorizedRequest<void>('/users/updateMyInfo', {
    method: 'PUT',
    body,
  });
}

export function withdrawUser() {
  return authorizedRequest<void>('/users/withdrawUser', { method: 'DELETE' });
}

export function updateNotificationSettings(body: NotificationSettingsBody) {
  return authorizedRequest<void>('/users/notification-settings', {
    method: 'PUT',
    body,
  });
}
