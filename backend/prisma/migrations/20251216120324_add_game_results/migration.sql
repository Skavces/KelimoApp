-- AlterTable
ALTER TABLE "User" ADD COLUMN     "customAvatar" TEXT;

-- CreateTable
CREATE TABLE "UserGameResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "wrong" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserGameResult_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserGameResult" ADD CONSTRAINT "UserGameResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
