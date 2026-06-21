import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthService, SESSION_COOKIE } from './auth.service';
import { IS_PUBLIC_KEY } from './public.decorator';

type AuthedRequest = Request & {
  cookies?: Record<string, string>;
  user?: string;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const username = await this.auth.verify(req.cookies?.[SESSION_COOKIE]);
    if (!username) throw new UnauthorizedException();
    req.user = username;
    return true;
  }
}
