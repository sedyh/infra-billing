import { z } from 'zod';

// WebAuthn ceremony payloads are pass-through. The precise PublicKeyCredential*OptionsJSON /
// *ResponseJSON shapes are defined by @simplewebauthn/* (the browser lib types the frontend, the
// server lib validates on the backend), so re-declaring them in zod would only drift. We validate
// strictly only the few fields we actually read (e.g. the optional passkey name).

export const passkeyRegisterVerifySchema = z.object({
  response: z.unknown(),
  name: z.string().max(64).optional(),
});
export type PasskeyRegisterVerify = z.infer<typeof passkeyRegisterVerifySchema>;

export const passkeyLoginVerifySchema = z.object({
  response: z.unknown(),
});
export type PasskeyLoginVerify = z.infer<typeof passkeyLoginVerifySchema>;
