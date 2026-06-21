import { createZodDto } from 'nestjs-zod';
import { setupSchema } from '@infra/shared';

export class SetupDto extends createZodDto(setupSchema) {}
