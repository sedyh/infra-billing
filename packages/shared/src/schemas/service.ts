import { z } from 'zod';
import { periodSchema, serviceTypeSchema } from '../enums';
import {
  countryCodeSchema,
  currencySchema,
  isoDateSchema,
  moneySchema,
  uuidSchema,
} from './common';

export const serviceSchema = z.object({
  uuid: uuidSchema,
  providerUuid: uuidSchema,
  name: z.string(),
  type: serviceTypeSchema,
  externalId: z.string().nullable(),
  countryCode: countryCodeSchema.nullable(),
  cost: moneySchema,
  currency: currencySchema,
  period: periodSchema,
  nextBillingAt: isoDateSchema.nullable(),
  isActive: z.boolean(),
  isManaged: z.boolean(),
  costOverridden: z.boolean(),
  nameOverridden: z.boolean(),
  meta: z.record(z.string(), z.unknown()),
  paymentsCount: z.number().int().nonnegative().optional(),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});
export type Service = z.infer<typeof serviceSchema>;

export const createServiceSchema = z.object({
  providerUuid: uuidSchema,
  name: z.string().min(1),
  type: serviceTypeSchema,
  cost: moneySchema,
  currency: currencySchema,
  period: periodSchema,
  countryCode: countryCodeSchema.optional(),
  nextBillingAt: isoDateSchema.optional(),
  isActive: z.boolean().optional(),
});
export type CreateService = z.infer<typeof createServiceSchema>;

export const updateServiceSchema = z.object({
  // Only honoured for manual services — moving a synced one would orphan it from sync.
  providerUuid: uuidSchema.optional(),
  name: z.string().min(1).optional(),
  type: serviceTypeSchema.optional(),
  cost: moneySchema.optional(),
  currency: currencySchema.optional(),
  period: periodSchema.optional(),
  countryCode: countryCodeSchema.nullable().optional(),
  nextBillingAt: isoDateSchema.nullable().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateService = z.infer<typeof updateServiceSchema>;
