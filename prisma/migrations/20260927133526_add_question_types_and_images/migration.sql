-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE', 'MULTIPLE');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "type" "QuestionType" NOT NULL DEFAULT 'SINGLE';
