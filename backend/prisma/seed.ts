// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';

const prisma = new PrismaClient();

async function loadWordsFromCsv() {
  const filePath = path.join(__dirname, 'words.csv');

  if (!fs.existsSync(filePath)) {
    console.log('prisma/words.csv bulunamadı, seed atlanıyor.');
    return [];
  }

  const records: { text: string; meaning: string; example?: string | null }[] =
    [];

  const parser = fs
    .createReadStream(filePath)
    .pipe(
      parse({
        columns: true,        // ilk satırı header kabul et
        trim: true,
        skip_empty_lines: true,
      }),
    );

  for await (const record of parser) {
    if (!record.text || !record.meaning) continue;

    records.push({
      text: record.text,
      meaning: record.meaning,
      example: record.example || null,
    });
  }

  return records;
}

async function main() {
  const words = await loadWordsFromCsv();

  if (!words.length) {
    console.log('CSV boş veya okunamadı, eklenecek kelime yok.');
    return;
  }

  console.log(`Toplam ${words.length} kelime import ediliyor...`);

  await prisma.word.createMany({
    data: words,
    skipDuplicates: true, // aynı text varsa tekrar ekleme
  });

  console.log('Kelime import işlemi bitti.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
