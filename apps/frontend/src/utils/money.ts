import type { Period, Rate } from '@infra/shared';

/** RUB per 1 unit of each currency code; RUB itself is always 1. */
export function buildRubMap(rates: Rate[] | undefined): Map<string, number> {
  const map = new Map<string, number>([['RUB', 1]]);
  for (const r of rates ?? []) {
    const value = Number(r.rate);
    if (Number.isFinite(value) && value > 0) map.set(r.code, value);
  }
  return map;
}

/**
 * Convert a decimal-string amount from one currency to the base via RUB
 * (mirrors backend CurrencyService.convert). Used for ordering only, so unlike
 * the backend (which falls back to the raw amount when a rate is missing) a
 * missing rate returns null — mixing unconverted magnitudes into a sort would
 * silently produce a wrong order, while null rows are grouped at the end.
 */
export function toBaseAmount(
  amount: string | number,
  from: string | null | undefined,
  base: string,
  rubPer: Map<string, number>,
): number | null {
  const value = Number(amount);
  if (!Number.isFinite(value)) return null;
  if (from === base) return value;
  const fromRate = from ? rubPer.get(from) : undefined;
  const baseRate = rubPer.get(base);
  if (fromRate === undefined || baseRate === undefined) return null;
  return (value * fromRate) / baseRate;
}

const HOURS_PER_MONTH = 730;

/**
 * Per-period cost → monthly cost, same factors as apps/backend/src/common/money.ts
 * (kept as plain numbers: this value is only compared, never displayed).
 * onetime → 0, matching the analytics treatment of capital expenses.
 */
export function monthlyAmount(cost: string, period: Period): number {
  const c = Number(cost);
  switch (period) {
    case 'monthly':
      return c;
    case 'yearly':
      return c / 12;
    case 'quarterly':
      return c / 3;
    case 'daily':
      return c * (HOURS_PER_MONTH / 24);
    case 'hourly':
      return c * HOURS_PER_MONTH;
    default:
      return 0;
  }
}
