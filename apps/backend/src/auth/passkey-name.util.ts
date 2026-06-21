// Default passkey label when none is given: "Passkey", then "Passkey 2", "Passkey 3", …
// Picks the lowest free slot, so a freed name (after deletion) gets reused.
export function nextPasskeyName(existing: Array<string | null>): string {
  const taken = new Set(existing.filter((n): n is string => !!n));
  if (!taken.has('Passkey')) return 'Passkey';
  let n = 2;
  while (taken.has(`Passkey ${n}`)) n++;
  return `Passkey ${n}`;
}
