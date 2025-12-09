import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    return;
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    console.log('>>> /auth/google/redirect hit, user from Google:', req.user);

    const { user, token } = await this.authService.validateGoogleUser(req.user);

    const redirectUrl = `http://localhost:5173/auth/success?token=${token}`;

    console.log('>>> Redirecting to:', redirectUrl);

    return res.redirect(redirectUrl);
  }
}
