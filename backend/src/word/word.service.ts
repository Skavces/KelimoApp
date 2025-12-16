import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SwipeStatus } from '@prisma/client';

@Injectable()
export class WordService {
  constructor(private prisma: PrismaService) {}

  async saveGameResult(userId: string, dto: { gameType: string; score: number; correct: number; wrong: number }) {
    const finalScore = dto.score < 0 ? 0 : dto.score;

    return this.prisma.userGameResult.create({
      data: {
        userId,
        gameType: dto.gameType,
        score: finalScore,
        correct: dto.correct,
        wrong: dto.wrong,
      },
    });
  }

  async getProgressStats(userId: string) {
    const learnedCount = await this.prisma.userWordSwipe.count({
      where: { userId, status: SwipeStatus.LEARNED },
    });

    const allGames = await this.prisma.userGameResult.aggregate({
      where: { userId },
      _sum: {
        correct: true,
        wrong: true,
        score: true,
      },
    });

    const totalCorrect = allGames._sum.correct || 0;
    const totalWrong = allGames._sum.wrong || 0;
    const totalQuestions = totalCorrect + totalWrong;
    const totalScore = allGames._sum.score || 0;

    const accuracy = totalQuestions > 0 
      ? Math.round((totalCorrect / totalQuestions) * 100) 
      : 0;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const lastWeekSwipes = await this.prisma.userWordSwipe.findMany({
      where: {
        userId,
        status: SwipeStatus.LEARNED,
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true },
    });

    const lastWeekGames = await this.prisma.userGameResult.findMany({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true, score: true },
    });

    const daysMap = new Map<string, number>();
    const trDays = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = trDays[d.getDay()];
      if (!daysMap.has(dayName)) daysMap.set(dayName, 0);
    }

    lastWeekSwipes.forEach((swipe) => {
      const dayName = trDays[swipe.createdAt.getDay()];
      daysMap.set(dayName, (daysMap.get(dayName) || 0) + 10);
    });

    lastWeekGames.forEach((game) => {
      const dayName = trDays[game.createdAt.getDay()];
      daysMap.set(dayName, (daysMap.get(dayName) || 0) + Math.round(game.score / 10));
    });

    const weeklyData = Array.from(daysMap, ([name, words]) => ({ name, words })).reverse();
    const { streak } = await this.getUserStats(userId); 
    const badges = [
      { id: 1, unlocked: learnedCount >= 10 }, // Yeni Başlayan
      { id: 2, unlocked: streak >= 7 },       // Alev Alev
      { id: 3, unlocked: learnedCount >= 100 }, // Kelime Avcısı
      { id: 4, unlocked: accuracy >= 90 && totalQuestions >= 20 }, // Usta Dilci
    ];

    const recentGames = await this.prisma.userGameResult.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, 
      take: 10, 
    });

    return {
      totalScore,
      totalLearned: learnedCount,
      accuracy,
      weeklyData,
      badges,
      streak,
      recentGames,
    };
  }

  async getFeedWords(userId: string) {
    const words = await this.prisma.word.findMany({
      where: {
        NOT: {
          swipes: {
            some: { userId: userId, status: SwipeStatus.LEARNED },
          },
        },
      },
      take: 100,
    });

    const shuffled = words.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 20);
  }

  async swipeWord(userId: string, wordId: string, status: SwipeStatus) {
    const existingSwipe = await this.prisma.userWordSwipe.findFirst({
      where: { userId, wordId },
    });

    if (existingSwipe) {
      return this.prisma.userWordSwipe.update({
        where: { id: existingSwipe.id },
        data: { status },
      });
    } else {
      return this.prisma.userWordSwipe.create({
        data: { userId, wordId, status },
      });
    }
  }

  async getUserStats(userId: string) {
    const learnedCount = await this.prisma.userWordSwipe.count({
      where: { userId, status: SwipeStatus.LEARNED },
    });

    const totalCount = await this.prisma.word.count();
    const activities = await this.prisma.userWordSwipe.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const uniqueDates = Array.from(new Set(activities.map(a => a.createdAt.toISOString().split('T')[0])));
    let streak = 0;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    if (uniqueDates.length === 0) {
      streak = 0;
    } 
    else if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) {
      streak = 0;
    } 
    else {
      let currentDateStr = uniqueDates.includes(today) ? today : yesterday;
      streak = 1;

      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDateStr = uniqueDates[i];
        const expectedDateObj = new Date(currentDateStr);
        expectedDateObj.setDate(expectedDateObj.getDate() - 1);
        const expectedDateStr = expectedDateObj.toISOString().split('T')[0];

        if (prevDateStr === expectedDateStr) {
          streak++;
          currentDateStr = prevDateStr;
        } else {
          break;
        }
      }
    }

    return { learnedCount, totalCount, streak };
  }

  async getLearnedWords(userId: string) {
    return this.prisma.word.findMany({
      where: {
        swipes: {
          some: { userId: userId, status: SwipeStatus.LEARNED },
        },
      },
      orderBy: { text: 'asc' },
    });
  }

  async generateQuiz(userId: string, mode: 'EN_TR' | 'TR_EN') {

    const learnedWords = await this.getLearnedWordsForGame(userId, 5);

    const shuffled = learnedWords.sort(() => 0.5 - Math.random());
    
    const questions = shuffled.slice(0, 10).map((word) => {

      const otherWords = learnedWords.filter((w) => w.id !== word.id);
      const wrongOptions = otherWords
        .sort(() => 0.5 - Math.random())
        .slice(0, 3); // 3 tane yanlış

      const optionsRaw = [...wrongOptions, word];
      const optionsShuffled = optionsRaw.sort(() => 0.5 - Math.random());

      if (mode === 'EN_TR') {
        return {
          id: word.id,
          question: word.text, 
          correctAnswer: word.meaning, 
          options: optionsShuffled.map((o) => o.meaning), 
        };
      } else {
        return {
          id: word.id,
          question: word.meaning, 
          correctAnswer: word.text, 
          options: optionsShuffled.map((o) => o.text), 
        };
      }
    });

    return questions;
  }

  async getScrambleWords(userId: string) {
    const learnedWords = await this.getLearnedWordsForGame(userId, 5);

    const shuffled = learnedWords.sort(() => 0.5 - Math.random()).slice(0, 10);

    return shuffled.map(w => ({
      id: w.id,
      word: w.text,
      meaning: w.meaning
    }));
  }

  async getFillBlankGame(userId: string) {
    const words = await this.prisma.word.findMany({
      where: {
        example: { not: null },
        swipes: {
          some: { userId: userId, status: SwipeStatus.LEARNED },
        },
      },
    });

    if (words.length < 5) {
      throw new HttpException('Yeterli örnek cümleli kelime yok. Öğrenmeye devam et!', HttpStatus.BAD_REQUEST);
    }

    const targetWords = words.sort(() => 0.5 - Math.random()).slice(0, 10);

    return targetWords.map((word) => {
      const distractors = words
        .filter((w) => w.id !== word.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const options = [...distractors, word].sort(() => 0.5 - Math.random());

      const exampleSentence = word.example || ""; 

      const hiddenSentence = exampleSentence.replace(
        new RegExp(`\\b${word.text}\\b`, 'gi'), 
        '{{BLANK}}'
      );

      return {
        id: word.id,
        question: hiddenSentence,
        correctAnswer: word.text,
        options: options.map(o => o.text),
        meaning: word.meaning
      };
    });
  }

  async getMemoryGame(userId: string) {
    const words = await this.getLearnedWordsForGame(userId, 6); 

    const selectedWords = words.sort(() => 0.5 - Math.random()).slice(0, 6);

    const cards: any[] = [];

    selectedWords.forEach((word) => {
      cards.push({
        id: `${word.id}-en`,
        matchId: word.id,
        text: word.text,
        type: 'EN'
      });

      cards.push({
        id: `${word.id}-tr`,
        matchId: word.id,
        text: word.meaning,
        type: 'TR'
      });
    });

    return cards.sort(() => 0.5 - Math.random());
  }

  async getDictationGame(userId: string) {
    const words = await this.getLearnedWordsForGame(userId, 5);

    const shuffled = words.sort(() => 0.5 - Math.random()).slice(0, 10);

    return shuffled.map(w => ({
      id: w.id,
      word: w.text,
      meaning: w.meaning
    }));
  }

  private async getLearnedWordsForGame(userId: string, minCount: number) {
    const words = await this.prisma.word.findMany({
      where: {
        swipes: {
          some: { userId: userId, status: SwipeStatus.LEARNED },
        },
      },
    });

    if (words.length < minCount) {
      throw new HttpException(
        `Yeterli kelime yok. Bu oyun için en az ${minCount} kelime öğrenmelisin.`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return words;
  }
}