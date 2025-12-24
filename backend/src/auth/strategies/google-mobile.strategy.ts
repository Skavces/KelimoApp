import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleMobileStrategy extends PassportStrategy(Strategy, 'google-mobile') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL_MOBILE!,
      scope: ['email', 'profile'],
      passReqToCallback: true,
      state: false,
    });
  }

  async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const { id, emails, displayName, photos } = profile;

    done(null, {
      googleId: id,
      email: emails?.[0]?.value,
      name: displayName,
      avatar: photos?.[0]?.value,
    });
  }
}
