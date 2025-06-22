-- AlterEnum
ALTER TYPE "CargoStatus" ADD VALUE 'OPEN';

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false;
