// Look-alike characters (0/O/o, 1/l/I) are dropped so a revealed password is easy to read back.
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*-_';

// Cryptographically strong random password (~6 bits/char). Rejection sampling avoids the modulo
// bias a plain `% length` would introduce, so every character is uniformly distributed.
export function generatePassword(length = 20): string {
  const max = 256 - (256 % CHARSET.length);
  const buf = new Uint8Array(length);
  let result = '';
  while (result.length < length) {
    crypto.getRandomValues(buf);
    for (let i = 0; i < buf.length && result.length < length; i++) {
      if (buf[i] < max) result += CHARSET[buf[i] % CHARSET.length];
    }
  }
  return result;
}
