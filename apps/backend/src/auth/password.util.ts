import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// scrypt password hashing (node:crypto, no extra deps). Stored as "saltHex:hashHex".
// scrypt is a standardized memory-hard KDF; for a single-user self-hosted panel it's a good fit
// and avoids the native build of argon2.
const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;
const SALT_BYTES = 16;

export function hashPassword(plain: string): string {
  const salt = randomBytes(SALT_BYTES);
  const hash = scryptSync(plain, salt, KEYLEN, { N, r: R, p: P });
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPassword(plain: string, stored: string | null | undefined): boolean {
  if (!stored) return false;
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(plain, Buffer.from(saltHex, 'hex'), expected.length, { N, r: R, p: P });
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
