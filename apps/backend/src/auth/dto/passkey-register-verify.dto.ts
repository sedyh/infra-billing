import { createZodDto } from 'nestjs-zod';
import { passkeyRegisterVerifySchema } from '@infra/shared';

export class PasskeyRegisterVerifyDto extends createZodDto(passkeyRegisterVerifySchema) {}
