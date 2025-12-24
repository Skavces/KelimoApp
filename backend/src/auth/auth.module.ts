import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GoogleWebStrategy } from './strategies/google-web.strategy';
import { GoogleMobileStrategy } from './strategies/google-mobile.strategy';

@Module({
  imports: [
    PassportModule.register({ session: false }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'devsupersecret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleWebStrategy,GoogleMobileStrategy, PrismaService, JwtStrategy, GoogleAuthGuard],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
