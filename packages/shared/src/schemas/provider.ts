import { z } from 'zod';
import { providerKindSchema } from '../enums';
import { currencySchema, isoDateSchema, moneySchema, uuidSchema } from './common';

/** Provider as returned by the API. The API token is NEVER returned. */
export const providerSchema = z.object({
  uuid: uuidSchema,
  name: z.string(),
  kind: providerKindSchema,
  faviconLink: z.string().nullable(),
  loginUrl: z.string().nullable(),
  balance: moneySchema.nullable(),
  balanceCurrency: currencySchema.nullable(),
  balanceSyncedAt: isoDateSchema.nullable(),
  lastSyncAt: isoDateSchema.nullable(),
  lastSyncError: z.string().nullable(),
  servicesCount: z.number().int().nonnegative().optional(),
  paymentsCount: z.number().int().nonnegative().optional(),
  // Non-secret credential hints (hostbill/billmgr/selectel/4vps) so the edit form can prefill them.
  // The password, totpSecret and token are NEVER returned.
  baseUrl: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  accountId: z.string().nullable().optional(),
  projectName: z.string().nullable().optional(),
  panelId: z.string().nullable().optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});
export type Provider = z.infer<typeof providerSchema>;

// Bearer-token providers (timeweb, hetzner) use `token`. HostBill/BILLmanager use
// `baseUrl` + `username` (email) + `password`. BILLmanager with OTP 2FA additionally
// takes `totpSecret` (the base32 seed) so the backend can generate one-time codes.
// Beget uses `username` (account login) + `password` (Cloud API), plus optional `totpSecret`
// (OTP 2FA) and `apiPassword` (the separate panel API password — enables the balance lookup).
// None are ever echoed back.
const credentialFields = {
  token: z.string().min(1).optional(),
  baseUrl: z.string().url().optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  totpSecret: z.string().min(1).optional(),
  // Selectel: account number (Keystone domain) for the service user, and the optional Cloud
  // Platform project name (enables cloud/OpenStack server listing).
  accountId: z.string().min(1).optional(),
  projectName: z.string().min(1).optional(),
  // 4VPS: panel id (which billing panel the API key belongs to). Combined with `token`.
  panelId: z.string().min(1).optional(),
  // Beget: the separate panel "Beget API" password (legacy hosting API) — enables balance sync.
  apiPassword: z.string().min(1).optional(),
};

export const createProviderSchema = z.object({
  name: z.string().min(1),
  kind: providerKindSchema,
  loginUrl: z.string().url().optional(),
  ...credentialFields,
});
export type CreateProvider = z.infer<typeof createProviderSchema>;

export const updateProviderSchema = z.object({
  name: z.string().min(1).optional(),
  loginUrl: z.string().url().nullable().optional(),
  ...credentialFields,
});
export type UpdateProvider = z.infer<typeof updateProviderSchema>;
