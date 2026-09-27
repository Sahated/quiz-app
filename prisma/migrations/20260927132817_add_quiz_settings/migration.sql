-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "category" TEXT,
ADD COLUMN     "defaultTimeLimit" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "rules" TEXT;
