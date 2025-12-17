import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { WordService } from './word.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
import { SwipeStatus } from '@prisma/client';

@Controller('words')
@UseGuards(JwtAuthGuard) 
export class WordController {
  constructor(private readonly wordService: WordService) {}

  @Post('game-result')
  async saveGameResult(
    @Req() req,
    @Body() body: { gameType: string; score: number; correct: number; wrong: number },
  ) {
    return this.wordService.saveGameResult(req.user.userId, body);
  }

  @Get('progress')
  async getProgress(@Req() req) {
    return this.wordService.getProgressStats(req.user.userId);
  }

  @Get('stats') 
  async getStats(@Req() req) {
    return this.wordService.getUserStats(req.user.userId);
  }

  @Get('feed')
  async getFeed(@Req() req) {
    return this.wordService.getFeedWords(req.user.userId);
  }

  @Post(':id/swipe')
  async swipe(
    @Param('id') wordId: string,
    @Body('status') status: SwipeStatus,
    @Req() req,
  ) {
    return this.wordService.swipeWord(req.user.userId, wordId, status);
  }

  @Get('learned')
  async getLearned(@Req() req) {
    return this.wordService.getLearnedWords(req.user.userId);
  }

  @Get('quiz')
  getQuiz(
    @Req() req,
    @Query('mode') mode: 'EN_TR' | 'TR_EN' = 'EN_TR', 
  ) {
    return this.wordService.generateQuiz(req.user.userId, mode);
  }

  @Get('game/scramble')
  getScrambleGame(@Req() req) {
    return this.wordService.getScrambleWords(req.user.userId);
  }

  @Get('game/fill-blank')
  getFillBlank(@Req() req) {
    return this.wordService.getFillBlankGame(req.user.userId);
  }

  @Get('game/memory')
  getMemoryGame(@Req() req) {
    return this.wordService.getMemoryGame(req.user.userId);
  }

  @Get('game/dictation')
  getDictationGame(@Req() req) {
    return this.wordService.getDictationGame(req.user.userId);
  }
}