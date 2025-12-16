import { 
  Controller, 
  Post, 
  UseGuards, 
  UseInterceptors, 
  UploadedFile, 
  Req, 
  Get,
  HttpException, 
  HttpStatus     
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma.service';
import { CloudinaryService } from './cloudinary.service';

@Controller('users')
export class UserController {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
    });
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) throw new HttpException('Dosya yüklenemedi', HttpStatus.BAD_REQUEST);

    const cloudResult = await this.cloudinaryService.uploadImage(file).catch(() => {
        throw new HttpException('Cloudinary yükleme hatası', HttpStatus.BAD_REQUEST);
    });

    const avatarUrl = cloudResult.secure_url;

    // 2. Veritabanına bu URL'i kaydet
    await this.prisma.user.update({
      where: { id: req.user.userId },
      data: { avatar: avatarUrl },
    });

    return { url: avatarUrl };
  }
}