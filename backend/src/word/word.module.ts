import { Module } from '@nestjs/common';
import { WordService } from './word.service';
import { WordController } from './word.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [WordController],
  providers: [WordService, PrismaService],
})
export class WordModule {}
