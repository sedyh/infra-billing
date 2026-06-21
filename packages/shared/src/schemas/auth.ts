import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const meSchema = z.object({
  username: z.string(),
});
export type Me = z.infer<typeof meSchema>;

// First-run / login-page bootstrap (public). Drives the setup-vs-login screen and which
// methods to render.
export const setupStatusSchema = z.object({
  needsSetup: z.boolean(),
  passwordEnabled: z.boolean(),
  passkeyEnabled: z.boolean(),
});
export type SetupStatus = z.infer<typeof setupStatusSchema>;

// First-run account creation (public, only when needsSetup).
export const setupSchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(8).max(128),
});
export type SetupInput = z.infer<typeof setupSchema>;

// Authenticated auth configuration (GET /auth/config). Never includes hash or secret.
export const authConfigSchema = z.object({
  username: z.string(),
  passwordEnabled: z.boolean(),
  passkeyEnabled: z.boolean(),
  rpId: z.string(),
  rpName: z.string(),
  rpOrigin: z.string(),
});
export type AuthConfig = z.infer<typeof authConfigSchema>;

// Username is set once at setup and is immutable afterwards — it's intentionally not updatable here.
export const updateAuthConfigSchema = z.object({
  passwordEnabled: z.boolean().optional(),
  passkeyEnabled: z.boolean().optional(),
  // Owner-set Relying Party config. Bounded to keep the singleton row sane; format isn't enforced
  // (a bad value only breaks the owner's own passkey ceremonies, fixable in the same screen).
  rpId: z.string().max(253).optional(),
  rpName: z.string().max(128).optional(),
  rpOrigin: z.string().max(2048).optional(),
});
export type UpdateAuthConfig = z.infer<typeof updateAuthConfigSchema>;

// A registered passkey, as listed in the settings tab (no public key / secrets).
export const passkeySchema = z.object({
  uuid: z.string(),
  name: z.string().nullable(),
  deviceType: z.string().nullable(),
  backedUp: z.boolean(),
  createdAt: z.string(),
  lastUsedAt: z.string().nullable(),
});
export type Passkey = z.infer<typeof passkeySchema>;
