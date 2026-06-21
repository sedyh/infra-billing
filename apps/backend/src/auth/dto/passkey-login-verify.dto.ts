import { createZodDto } from 'nestjs-zod';
import { passkeyLoginVerifySchema } from '@infra/shared';

export class PasskeyLoginVerifyDto extends createZodDto(passkeyLoginVerifySchema) {}
