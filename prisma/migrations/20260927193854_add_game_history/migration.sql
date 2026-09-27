-- CreateEnum
CREATE TYPE "HistoryRole" AS ENUM ('HOST', 'PLAYER');

-- CreateTable
CREATE TABLE "GameHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "quizId" INTEGER NOT NULL,
    "quizTitle" TEXT NOT NULL,
    "role" "HistoryRole" NOT NULL,
    "roomCode" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "place" INTEGER NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GameHistory" ADD CONSTRAINT "GameHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameHistory" ADD CONSTRAINT "GameHistory_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
