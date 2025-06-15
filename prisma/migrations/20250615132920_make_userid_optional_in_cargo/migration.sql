/*
  Warnings:

  - You are about to drop the column `fromLocation` on the `CargoOffer` table. All the data in the column will be lost.
  - You are about to drop the column `toLocation` on the `CargoOffer` table. All the data in the column will be lost.
  - Added the required column `fromAddress` to the `CargoOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromCountry` to the `CargoOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toAddress` to the `CargoOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toCountry` to the `CargoOffer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CargoOffer" DROP COLUMN "fromLocation",
DROP COLUMN "toLocation",
ADD COLUMN     "fromAddress" TEXT NOT NULL,
ADD COLUMN     "fromCountry" TEXT NOT NULL,
ADD COLUMN     "toAddress" TEXT NOT NULL,
ADD COLUMN     "toCountry" TEXT NOT NULL;
