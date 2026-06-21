import { createZodDto } from 'nestjs-zod';
import { updateAuthConfigSchema } from '@infra/shared';

export class UpdateAuthConfigDto extends createZodDto(updateAuthConfigSchema) {}
