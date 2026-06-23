// Linode (Akamai) API v4 response shapes (https://api.linode.com/v4). Only consumed fields are
// typed. Money is always USD. Lists use page/pages pagination ({ data, page, pages, results }).

/** Pagination envelope shared by every list endpoint. */
export interface LinodePaged<T> {
  data: T[];
  page: number;
  pages: number;
  results: number;
}

export interface LinodeAccount {
  balance: number; // postpaid: positive = owed, negative = account credit (USD)
  balance_uninvoiced: number; // running estimate of the current period (USD)
}

export interface LinodeInstance {
  id: number;
  label: string;
  region: string; // region id, e.g. "us-east" → country via /regions
  type: string; // Linode type id, e.g. "g6-standard-1" → priced via /linode/types
  status?: string;
  ipv4?: string[];
  ipv6?: string;
  image?: string;
  specs?: { vcpus?: number; memory?: number; disk?: number; transfer?: number };
  [key: string]: unknown;
}

export interface LinodeTypePrice {
  hourly: number;
  monthly: number; // USD
}

export interface LinodeType {
  id: string;
  price: LinodeTypePrice;
  region_prices?: Array<{ id: string; hourly: number; monthly: number }>; // per-region overrides
}

export interface LinodeRegion {
  id: string; // e.g. "us-east"
  country: string; // ISO 3166-1 alpha-2, lowercase, e.g. "us"
}

export interface LinodePayment {
  id: number;
  date: string; // ISO timestamp, e.g. "2018-01-15T00:01:01"
  usd: number; // amount paid, USD
}

export interface LinodeInvoice {
  id: number;
  date: string;
  label: string;
  total: number; // after-tax total, USD
}
