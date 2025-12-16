import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SwipeStatus } from '@prisma/client';

@Injectable()
export class WordService {
  constructor(private prisma: PrismaService) {}

  async getFeedWords(userId: string) {
    const words = await this.prisma.word.findMany({
      where: {
        NOT: {
          swipes: {
            some: {
              userId: userId,
              status: SwipeStatus.LEARNED,
            },
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
      where: {
        userId,
        wordId,
      },
    });

    if (existingSwipe) {
      return this.prisma.userWordSwipe.update({
        where: { id: existingSwipe.id },
        data: { status },
      });
    } else {
      return this.prisma.userWordSwipe.create({
        data: {
          userId,
          wordId,
          status,
        },
      });
    }
  }

  async getUserStats(userId: string) {
    // 1. Öğrenilen Kelime Sayısı
    const learnedCount = await this.prisma.userWordSwipe.count({
      where: {
        userId,
        status: SwipeStatus.LEARNED,
      },
    });

    // 2. Toplam Kelime Sayısı (Dashboard'daki "Toplam Havuz" için lazım)
    const totalCount = await this.prisma.word.count();

    // 3. STREAK (GÜN SERİSİ) HESAPLAMA
    // Kullanıcının tüm swipe işlemlerinin tarihlerini çek
    const activities = await this.prisma.userWordSwipe.findMany({
      where: { userId },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    // Tarihleri YYYY-MM-DD formatına çevir ve tekrar edenleri temizle
    const uniqueDates = Array.from(new Set(activities.map(a => a.createdAt.toISOString().split('T')[0])));

    let streak = 0;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Dünü hesapla
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    // Hiç aktivite yoksa 0
    if (uniqueDates.length === 0) {
      streak = 0;
    } 
    // Bugün veya dün işlem yapılmadıysa seri bozulmuştur
    else if (!uniqueDates.includes(today) && !uniqueDates.includes(yesterday)) {
      streak = 0;
    } 
    else {
      // Başlangıç noktasını belirle (Bugün işlem yaptıysa bugün, yapmadıysa dün)
      let currentDateStr = uniqueDates.includes(today) ? today : yesterday;
      
      streak = 1; // En az 1 gün var

      // Geriye doğru ardışık günleri say
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDateStr = uniqueDates[i]; // Geçmişteki tarih
        
        // currentDateStr'den 1 gün öncesini hesapla
        const expectedDateObj = new Date(currentDateStr);
        expectedDateObj.setDate(expectedDateObj.getDate() - 1);
        const expectedDateStr = expectedDateObj.toISOString().split('T')[0];

        if (prevDateStr === expectedDateStr) {
          streak++;
          currentDateStr = prevDateStr; // Zinciri devam ettir
        } else {
          break; // Zincir koptu
        }
      }
    }

    return {
      learnedCount,
      totalCount, // Dashboard'da kullanıyorsun
      streak,     // Artık hesaplanmış gerçek streak
    };
  }

  async getLearnedWords(userId: string) {
    return this.prisma.word.findMany({
      where: {
        swipes: {
          some: {
            userId: userId,
            status: SwipeStatus.LEARNED,
          },
        },
      },
      orderBy: {
        text: 'asc',
      },
    });
  }

  async generateQuiz(userId: string, mode: 'EN_TR' | 'TR_EN') { // userId: string yapıldı
    // 1. Kullanıcının öğrendiği kelimeleri çek
    const learnedWords = await this.prisma.word.findMany({
      where: {
        swipes: { // BURASI DÜZELDİ: userWords -> swipes
          some: {
            userId: userId,
            status: SwipeStatus.LEARNED, // Enum kullanıldı
          },
        },
      },
    });

    // 2. Yeterli kelime var mı kontrolü
    if (learnedWords.length < 5) {
      // Importlar eklendiği için artık burası hata vermeyecek
      throw new HttpException(
        'Yeterli kelime yok. En az 5 kelime öğrenmelisin.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 3. Soruları karıştır
    const shuffled = learnedWords.sort(() => 0.5 - Math.random());
    
    // İlk 10 tanesini al
    const questions = shuffled.slice(0, 10).map((word) => {
      // Yanlış cevapları seç
      const otherWords = learnedWords.filter((w) => w.id !== word.id);
      const wrongOptions = otherWords
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

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
    const learnedWords = await this.prisma.word.findMany({
      where: {
        swipes: {
          some: { userId: userId, status: SwipeStatus.LEARNED },
        },
      },
    });

    if (learnedWords.length < 5) {
      throw new HttpException('Yeterli kelime yok.', HttpStatus.BAD_REQUEST);
    }

    // Karıştır ve 10 tane seç
    const shuffled = learnedWords.sort(() => 0.5 - Math.random()).slice(0, 10);

    return shuffled.map(w => ({
      id: w.id,
      word: w.text,    // İngilizcesi (Kurulacak kelime)
      meaning: w.meaning // Türkçesi (İpucu)
    }));
  }

  async getFillBlankGame(userId: string) {
    // 1. Örnek cümlesi (example) olan öğrenilmiş kelimeleri çek
    const words = await this.prisma.word.findMany({
      where: {
        example: { not: null }, // Null olmayanları getir diyoruz
        swipes: {
          some: { userId: userId, status: SwipeStatus.LEARNED },
        },
      },
    });

    if (words.length < 5) {
      throw new HttpException('Yeterli örnek cümleli kelime yok.', HttpStatus.BAD_REQUEST);
    }

    // 2. Karıştır ve 10 tane seç
    const targetWords = words.sort(() => 0.5 - Math.random()).slice(0, 10);

    // 3. Soruları hazırla
    return targetWords.map((word) => {
      // Yanlış şıkları seç
      const distractors = words
        .filter((w) => w.id !== word.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      // Şıkları birleştir ve karıştır
      const options = [...distractors, word].sort(() => 0.5 - Math.random());

      // word.example null ise boş string ("") kullan diyoruz.
      const exampleSentence = word.example || ""; 

      const hiddenSentence = exampleSentence.replace(
        new RegExp(`\\b${word.text}\\b`, 'gi'), 
        '{{BLANK}}'
      );

      return {
        id: word.id,
        question: hiddenSentence, // Gizlenmiş cümle
        correctAnswer: word.text, // Doğru kelime
        options: options.map(o => o.text), // Şıklar
        meaning: word.meaning // İpucu
      };
    });
  }

  async getMemoryGame(userId: string) {
    // 1. Öğrenilmiş kelimeleri al
    const words = await this.prisma.word.findMany({
      where: {
        swipes: {
          some: { userId: userId, status: SwipeStatus.LEARNED },
        },
      },
    });

    if (words.length < 6) {
      throw new HttpException('Yeterli kelime yok. En az 6 kelime öğrenmelisin.', HttpStatus.BAD_REQUEST);
    }

    // 2. Karıştır ve 6 tane seç
    const selectedWords = words.sort(() => 0.5 - Math.random()).slice(0, 6);

    // 3. Kartları oluştur
    //Never hatası almamak için açıkça any alıyoruz
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

    // 4. Shuffle all
    return cards.sort(() => 0.5 - Math.random());
  }

  async getDictationGame(userId: string) {
    // 1. Öğrenilen kelimeleri çek
    const words = await this.prisma.word.findMany({
      where: {
        swipes: {
          some: { userId: userId, status: SwipeStatus.LEARNED },
        },
      },
    });

    if (words.length < 5) {
      throw new HttpException('Yeterli kelime yok. En az 5 kelime öğrenmelisin.', HttpStatus.BAD_REQUEST);
    }

    // 2. Karıştır ve 10 tane seç
    const shuffled = words.sort(() => 0.5 - Math.random()).slice(0, 10);

    return shuffled.map(w => ({
      id: w.id,
      word: w.text,
      meaning: w.meaning // İpucu olarak kullanabiliriz
    }));
  }
}