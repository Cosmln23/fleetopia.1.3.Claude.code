/*
  Warnings:

  - Added the required column `price` to the `OfferRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OfferRequest" DROP CONSTRAINT "OfferRequest_cargoOfferId_fkey";

-- DropForeignKey
ALTER TABLE "OfferRequest" DROP CONSTRAINT "OfferRequest_transporterId_fkey";

-- AlterTable
ALTER TABLE "OfferRequest" ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;

-- AddForeignKey
ALTER TABLE "OfferRequest" ADD CONSTRAINT "OfferRequest_cargoOfferId_fkey" FOREIGN KEY ("cargoOfferId") REFERENCES "CargoOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferRequest" ADD CONSTRAINT "OfferRequest_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
