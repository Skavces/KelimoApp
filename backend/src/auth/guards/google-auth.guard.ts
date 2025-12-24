import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { ExecutionContext } from '@nestjs/common';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const platform = req?.query?.platform === 'mobile' ? 'mobile' : 'web';

    return {
      state: platform,
      prompt: 'select_account',
      session: true,
    };
  }
}
