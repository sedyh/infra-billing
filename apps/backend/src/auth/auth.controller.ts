import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from '@simplewebauthn/server';
import {
  API,
  API_SUB,
  type AuthConfig,
  ID_PARAM,
  type Me,
  type Passkey,
  type SetupStatus,
} from '@infra/shared';
import { Request, Response } from 'express';
import { AuthService, SESSION_COOKIE } from './auth.service';
import { AuthConfigService } from './auth-config.service';
import { WebAuthnService } from './webauthn.service';
import { LoginDto } from './login.dto';
import { SetupDto } from './dto/setup.dto';
import { UpdateAuthConfigDto } from './dto/update-auth-config.dto';
import { PasskeyRegisterVerifyDto } from './dto/passkey-register-verify.dto';
import { PasskeyLoginVerifyDto } from './dto/passkey-login-verify.dto';
import { Public } from './public.decorator';

@Controller(API.AUTH)
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly authConfig: AuthConfigService,
    private readonly webauthn: WebAuthnService,
  ) {}

  // ---- public: first-run bootstrap + login ----

  @Public()
  @Get(API_SUB.AUTH_SETUP)
  setupStatus(): Promise<SetupStatus> {
    return this.authConfig.getStatus();
  }

  @Public()
  @Post(API_SUB.AUTH_SETUP)
  @HttpCode(200)
  async setup(@Body() dto: SetupDto, @Res({ passthrough: true }) res: Response): Promise<Me> {
    await this.authConfig.setup(dto.username, dto.password);
    res.cookie(SESSION_COOKIE, await this.auth.sign(dto.username), this.auth.cookieOptions());
    return { username: dto.username };
  }

  @Public()
  @Post(API_SUB.AUTH_LOGIN)
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response): Promise<Me> {
    if (!(await this.auth.verifyCredentials(dto.username, dto.password))) {
      throw new UnauthorizedException('Invalid username or password');
    }
    res.cookie(SESSION_COOKIE, await this.auth.sign(dto.username), this.auth.cookieOptions());
    return { username: dto.username };
  }

  @Public()
  @Post(API_SUB.AUTH_LOGOUT)
  @HttpCode(204)
  logout(@Res({ passthrough: true }) res: Response): void {
    res.clearCookie(SESSION_COOKIE, this.auth.cookieOptions());
  }

  @Public()
  @Post(API_SUB.AUTH_PASSKEY_LOGIN_OPTIONS)
  @HttpCode(200)
  passkeyLoginOptions(): Promise<unknown> {
    return this.webauthn.loginOptions();
  }

  @Public()
  @Post(API_SUB.AUTH_PASSKEY_LOGIN_VERIFY)
  @HttpCode(200)
  async passkeyLoginVerify(
    @Body() dto: PasskeyLoginVerifyDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Me> {
    const username = await this.webauthn.verifyLogin(dto.response as AuthenticationResponseJSON);
    res.cookie(SESSION_COOKIE, await this.auth.sign(username), this.auth.cookieOptions());
    return { username };
  }

  // ---- authenticated: session probe + auth settings ----

  @Get(API_SUB.AUTH_ME)
  me(@Req() req: Request & { user?: string }): Me {
    return { username: req.user ?? '' };
  }

  @Get(API_SUB.AUTH_CONFIG)
  getConfig(): Promise<AuthConfig> {
    return this.authConfig.getConfig();
  }

  @Patch(API_SUB.AUTH_CONFIG)
  updateConfig(@Body() dto: UpdateAuthConfigDto): Promise<AuthConfig> {
    return this.authConfig.patchConfig(dto);
  }

  @Post(API_SUB.AUTH_PASSKEY_REGISTER_OPTIONS)
  @HttpCode(200)
  passkeyRegisterOptions(): Promise<unknown> {
    return this.webauthn.registerOptions();
  }

  @Post(API_SUB.AUTH_PASSKEY_REGISTER_VERIFY)
  @HttpCode(200)
  passkeyRegisterVerify(@Body() dto: PasskeyRegisterVerifyDto): Promise<Passkey> {
    return this.webauthn.verifyRegistration(dto.response as RegistrationResponseJSON, dto.name);
  }

  @Get(API_SUB.AUTH_PASSKEYS)
  listPasskeys(): Promise<Passkey[]> {
    return this.webauthn.list();
  }

  @Delete(API_SUB.AUTH_PASSKEY_BY_ID)
  @HttpCode(204)
  deletePasskey(@Param(ID_PARAM) uuid: string): Promise<void> {
    return this.webauthn.delete(uuid);
  }
}
