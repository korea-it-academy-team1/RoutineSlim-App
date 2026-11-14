/** 'HH:mm:ss' 또는 'HH:mm' → 'HH:mm' */
export function toHourMinute(time: string) {
  return time.slice(0, 5);
}

/** 'HH:mm' → 서버 LocalTime 형식 'HH:mm:ss' */
export function toServerTime(hourMinute: string) {
  return `${hourMinute}:00`;
}

/** 알림 일수 표시: 0 → '당일', 3 → 'D-3' */
export function formatReminderDay(days: number) {
  return days === 0 ? '당일' : `D-${days}`;
}

/** 마이 탭 '알림 설정' 오른쪽 값. 예) 'D-3 · 09:00' */
export function formatNotification(days: number, time: string) {
  return `${formatReminderDay(days)} · ${toHourMinute(time)}`;
}

/** 가입일부터 오늘까지 며칠째인지 (가입 당일 = 1일째) */
export function slimDays(createdAt: string, now = new Date()) {
  // 서버는 'YYYY-MM-DDTHH:mm:ss' (시간대 없음) 로 보낸다. 날짜만 떼어 달력 날짜 차이로 센다
  const [y, m, d] = createdAt.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return 1;
  const joined = Date.UTC(y, m - 1, d);
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.max(1, Math.floor((today - joined) / 86_400_000) + 1);
}

/** 간단한 이메일 형식 검사 (빈 값은 호출 전에 거른다) */
export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
