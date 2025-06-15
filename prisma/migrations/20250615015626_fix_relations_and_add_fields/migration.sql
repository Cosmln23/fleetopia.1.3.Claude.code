/*
  Warnings:

  - You are about to drop the column `read` on the `SystemAlert` table. All the data in the column will be lost.
  - Added the required column `deliveryDate` to the `CargoOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loadingDate` to the `CargoOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceType` to the `CargoOffer` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CargoOffer_fromLocation_idx";

-- DropIndex
DROP INDEX "CargoOffer_status_idx";

-- DropIndex
DROP INDEX "CargoOffer_toLocation_idx";

-- DropIndex
DROP INDEX "CargoOffer_urgency_idx";

-- AlterTable
ALTER TABLE "CargoOffer" ADD COLUMN     "deliveryDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "loadingDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "priceType" TEXT NOT NULL,
ADD COLUMN     "requirements" TEXT[],
ADD COLUMN     "volume" DOUBLE PRECISION,
ALTER COLUMN "status" SET DEFAULT 'new',
ALTER COLUMN "urgency" SET DEFAULT 'medium';

-- AlterTable
ALTER TABLE "SystemAlert" DROP COLUMN "read",
ADD COLUMN     "isProcessed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "relatedId" TEXT;

-- AddForeignKey
ALTER TABLE "CargoOffer" ADD CONSTRAINT "CargoOffer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
