import type { SignupRequest } from '../api/authApi';

/** 회원가입 화면 입력값 */
export type SignupForm = {
  memberName: string;
  password: string;
  passwordConfirm: string;
  name: string;
  email: string;
  phone: string;
};

/** DB 컬럼 크기 (서버 V1__init.sql member) */
const MAX_MEMBER_NAME = 50;
const MAX_NAME = 50;
const MAX_EMAIL = 255;
const MAX_PHONE = 30;
/** BCrypt 는 72바이트까지만 쓴다 (그 뒤는 잘려서 비밀번호가 달라도 같다고 판단됨) */
const MAX_PASSWORD_BYTES = 72;
const MIN_PASSWORD_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9-]+$/;

/** UTF-8 바이트 수 (TextEncoder 없이) */
function utf8Length(text: string) {
  let bytes = 0;
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
  }
  return bytes;
}

/**
 * 입력값 확인. 문제가 있으면 화면에 보여 줄 문구, 없으면 null.
 * 서버는 아이디 중복만 검사하므로 필수값·형식·길이는 여기서 막는다.
 */
export function validateSignup(form: SignupForm): string | null {
  const memberName = form.memberName.trim();
  const name = form.name.trim();
  const email = form.email.trim();
  const phone = form.phone.trim();

  if (!memberName || !form.password || !name) return '아이디, 비밀번호, 이름을 입력해 주세요.';
  if (memberName.length > MAX_MEMBER_NAME) return `아이디는 ${MAX_MEMBER_NAME}자 이하로 입력해 주세요.`;
  if (/\s/.test(memberName)) return '아이디에는 공백을 넣을 수 없어요.';
  if (form.password.length < MIN_PASSWORD_LENGTH) return `비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상으로 입력해 주세요.`;
  if (utf8Length(form.password) > MAX_PASSWORD_BYTES) return '비밀번호가 너무 길어요. (영문 기준 72자 이하)';
  if (form.password !== form.passwordConfirm) return '비밀번호가 일치하지 않아요.';
  if (name.length > MAX_NAME) return `이름은 ${MAX_NAME}자 이하로 입력해 주세요.`;
  if (email && (email.length > MAX_EMAIL || !EMAIL_PATTERN.test(email))) return '이메일 형식을 확인해 주세요.';
  if (phone && (phone.length > MAX_PHONE || !PHONE_PATTERN.test(phone))) return '전화번호는 숫자와 - 만 입력해 주세요.';
  return null;
}

/** 화면 입력값 → 서버 요청. 선택 항목이 비었으면 null (email 은 DB UNIQUE) */
export function toSignupRequest(form: SignupForm): SignupRequest {
  return {
    memberName: form.memberName.trim(),
    memberPassword: form.password,
    name: form.name.trim(),
    email: form.email.trim() || null,
    phone: form.phone.trim() || null,
  };
}
