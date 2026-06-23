import Decimal from 'decimal.js';
import { PaymentData, ServiceData } from '../connector.interface';
import { LinodeInstance, LinodeInvoice, LinodePayment, LinodeType } from './linode.types';

// Linode denominates everything in USD; responses carry no currency code.
export const LINODE_CURRENCY = 'USD';

// Linode timestamps look like "2018-01-15T00:01:01" (often no zone) → treat as UTC.
function parseDate(s: string): Date {
  return new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : `${s}Z`);
}

// Monthly price (USD) for an instance: a region-specific override wins over the base type price.
// Unknown type (/linode/types failed) → cost unset, the owner can fill it in.
function priceForInstance(
  type: string,
  region: string,
  priceByType: Map<string, LinodeType>,
): Decimal | undefined {
  const t = priceByType.get(type);
  if (!t) return undefined;
  const monthly = t.region_prices?.find((rp) => rp.id === region)?.monthly ?? t.price?.monthly;
  return monthly == null ? undefined : new Decimal(String(monthly));
}

// `region` is a region id (e.g. "us-east"); `countryByRegion` maps it to ISO-2 (GET /regions).
// Unknown region → countryCode unset (create defaults to 'XX').
export function mapLinodeInstance(
  i: LinodeInstance,
  priceByType: Map<string, LinodeType>,
  countryByRegion: Map<string, string>,
): ServiceData {
  const country = countryByRegion.get(i.region);
  return {
    externalId: String(i.id),
    name: i.label || `linode-${i.id}`,
    type: 'vps',
    countryCode: country ? country.toUpperCase() : undefined,
    cost: priceForInstance(i.type, i.region, priceByType),
    currency: LINODE_CURRENCY,
    period: 'monthly',
    meta: {
      region: i.region,
      type: i.type,
      status: i.status,
      vcpus: i.specs?.vcpus,
      memory: i.specs?.memory,
      disk: i.specs?.disk,
      ipv4: i.ipv4,
      image: i.image,
    },
  };
}

// Payments = money paid to Linode → topup. Namespace the id so it can't collide with invoices.
export function mapLinodePayment(p: LinodePayment): PaymentData {
  return {
    externalId: `payment:${p.id}`,
    type: 'topup',
    amount: new Decimal(String(p.usd)),
    currency: LINODE_CURRENCY,
    date: parseDate(p.date),
    description: 'Payment',
  };
}

// Invoices = Linode's charges → charge. No line-item link to a Linode, so it stays provider-level.
export function mapLinodeInvoice(inv: LinodeInvoice): PaymentData {
  return {
    externalId: `invoice:${inv.id}`,
    type: 'charge',
    amount: new Decimal(String(inv.total)),
    currency: LINODE_CURRENCY,
    date: parseDate(inv.date),
    description: inv.label || undefined,
  };
}
