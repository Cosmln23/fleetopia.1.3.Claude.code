/*
  Warnings:

  - The `status` column on the `CargoOffer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "CargoStatus" AS ENUM ('NEW', 'TAKEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELED');

-- AlterTable
ALTER TABLE "CargoOffer" DROP COLUMN "status",
ADD COLUMN     "status" "CargoStatus" NOT NULL DEFAULT 'NEW';
