import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';

interface GoogleUserData {
  googleId: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async validateGoogleUser(userData: GoogleUserData) {
    let user = await this.prisma.user.findUnique({
      where: { googleId: userData.googleId },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          googleId: userData.googleId,
          email: userData.email,
          name: userData.name,
          avatar: userData.avatar,
        },
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const token = this.jwt.sign(payload);

    return { user, token };
  }
}
