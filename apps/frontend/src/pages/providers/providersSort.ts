import type { Provider } from '@infra/shared';
import type { SortValue } from '@/hooks/useTableSort';
import { toBaseAmount } from '@/utils/money';

export const PROVIDER_SORT_KEYS = ['name', 'balance', 'services', 'payments'] as const;
export type ProviderSortKey = (typeof PROVIDER_SORT_KEYS)[number];

interface ProviderSortContext {
  /** RUB per unit of each currency (buildRubMap). */
  rub: Map<string, number>;
  /** Base currency from settings. */
  base: string;
}

/** Balances are compared in the base currency; providers without one go last. */
export function providerSortAccessors(
  ctx: ProviderSortContext,
): Record<ProviderSortKey, (p: Provider) => SortValue> {
  return {
    name: (p) => p.name,
    balance: (p) =>
      p.balance == null ? null : toBaseAmount(p.balance, p.balanceCurrency, ctx.base, ctx.rub),
    services: (p) => p.servicesCount ?? 0,
    payments: (p) => p.paymentsCount ?? 0,
  };
}
