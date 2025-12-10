-- CreateEnum
CREATE TYPE "SwipeStatus" AS ENUM ('VIEWED', 'LEARNED', 'SKIPPED');

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "example" TEXT,
    "level" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWordSwipe" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wordId" TEXT NOT NULL,
    "status" "SwipeStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserWordSwipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserWordSwipe_userId_wordId_idx" ON "UserWordSwipe"("userId", "wordId");

-- AddForeignKey
ALTER TABLE "UserWordSwipe" ADD CONSTRAINT "UserWordSwipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWordSwipe" ADD CONSTRAINT "UserWordSwipe_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
