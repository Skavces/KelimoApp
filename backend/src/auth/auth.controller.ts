import { Controller, Get, Req, Res, UseGuards, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Response } from 'express';

const mobileReturnUrlStore = new Map<string, string>();

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google-web'))
  async googleWeb() {
    return;
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google-web'))
  async googleWebRedirect(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { token } = await this.authService.validateGoogleUser(req.user);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const url = `${frontendUrl}/auth/success?token=${encodeURIComponent(token)}`;

    return res.redirect(url);
  }

  @Get('google/mobile')
  @UseGuards(AuthGuard('google-mobile'))
  async googleMobile(@Req() req, @Query('returnUrl') returnUrl?: string) {
    const key = req.ip || 'dev';
    if (returnUrl) mobileReturnUrlStore.set(key, returnUrl);
    return;
  }

  @Get('google/mobile/redirect')
  @UseGuards(AuthGuard('google-mobile'))
  async googleMobileRedirect(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { token } = await this.authService.validateGoogleUser(req.user);

    const key = req.ip || 'dev';
    const returnUrl = mobileReturnUrlStore.get(key);

    const fallback =
      this.configService.get<string>('MOBILE_REDIRECT_URL') ||
      'exp://127.0.0.1:19000/--/google-auth';

    const base = returnUrl || fallback;

    mobileReturnUrlStore.delete(key);

    const url = `${base}${base.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
    return res.redirect(url);
  }
}
