import { createHmac, timingSafeEqual } from 'crypto';

export const ADMIN_COOKIE = 'mj_admin_session';
const SESSION_MAX_AGE_SEC = 60 * 60 * 12; // 12시간

function secret(): string {
  const s = process.env.ADMIN_PASSWORD;
  if (!s) throw new Error('Missing environment variable: ADMIN_PASSWORD');
  return s;
}

function sign(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('hex');
}

/** 비밀번호가 맞으면 서명된 세션 토큰 문자열을 반환, 틀리면 null */
export function createSessionToken(password: string): string | null {
  if (password !== secret()) return null;
  const issuedAt = Date.now().toString();
  const sig = sign(issuedAt);
  return `${issuedAt}.${sig}`;
}

/** 쿠키에 담긴 세션 토큰이 유효한지(서명 일치 + 만료 전) 확인 */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [issuedAt, sig] = token.split('.');
  if (!issuedAt || !sig) return false;

  const expected = sign(issuedAt);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const age = (Date.now() - Number(issuedAt)) / 1000;
  return age >= 0 && age <= SESSION_MAX_AGE_SEC;
}
