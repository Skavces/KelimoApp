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

@Controller('words')
export class WordController {
  constructor(private readonly wordService: WordService) {}

  @UseGuards(JwtAuthGuard) 
  @Get('feed')
  async getFeed(@Req() req) {
    const userId = req.user.userId; 
    return this.wordService.getFeedWords(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/swipe')
  async swipe(
    @Param('id') wordId: string,
    @Body('status') status: string,
    @Req() req,
  ) {
    const userId = req.user.userId;
    return this.wordService.swipeWord(userId, wordId, status as any);
  }

  @UseGuards(JwtAuthGuard)
  @Get('learned')
  async getLearned(@Req() req) {
    const userId = req.user.userId;
    return this.wordService.getLearnedWords(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats') 
  async getStats(@Req() req) {
    return this.wordService.getUserStats(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('quiz')
  getQuiz(
    @Req() req, // @GetUser yerine @Req kullanıyoruz
    @Query('mode') mode: 'EN_TR' | 'TR_EN' = 'EN_TR', // @Query import edilmeli
  ) {
    const userId = req.user.userId; // ID'yi request'ten alıyoruz
    return this.wordService.generateQuiz(userId, mode);
  }

  @UseGuards(JwtAuthGuard)
  @Get('game/scramble')
  getScrambleGame(@Req() req) {
    return this.wordService.getScrambleWords(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('game/fill-blank')
  getFillBlank(@Req() req) {
    return this.wordService.getFillBlankGame(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('game/memory')
  getMemoryGame(@Req() req) {
    return this.wordService.getMemoryGame(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('game/dictation')
  getDictationGame(@Req() req) {
    return this.wordService.getDictationGame(req.user.userId);
  }
}