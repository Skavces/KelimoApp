import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SwipeStatus } from '@prisma/client';

@Injectable()
export class WordService {
  constructor(private prisma: PrismaService) {}

  async getFeedWords() {
    return this.prisma.word.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
  }

  async swipeWord(userId: string, wordId: string, status: SwipeStatus) {
    return this.prisma.userWordSwipe.create({
      data: {
        userId,
        wordId,
        status,
      },
    });
  }
}
