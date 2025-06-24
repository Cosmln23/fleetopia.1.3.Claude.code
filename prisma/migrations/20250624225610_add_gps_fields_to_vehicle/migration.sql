-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "gpsEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "gpsProvider" TEXT;
