import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { WordService } from './word.service';

@Controller('words')
export class WordController {
  constructor(private readonly wordService: WordService) {}

  @Get('feed')
  async getFeed() {
    return this.wordService.getFeedWords();
  }

  @Post(':id/swipe')
  async swipe(
    @Param('id') wordId: string,
    @Body('userId') userId: string,
    @Body('status') status: string,
  ) {
    return this.wordService.swipeWord(userId, wordId, status as any);
  }
}
