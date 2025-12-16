import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { PrismaService } from '../prisma.service';
import { CloudinaryService } from './cloudinary.service';

@Module({
  controllers: [UserController],
  providers: [PrismaService, CloudinaryService],
})
export class UserModule {}