/*
  Warnings:

  - You are about to drop the column `status` on the `AgentAPIConnection` table. All the data in the column will be lost.
  - You are about to drop the column `cargoType` on the `CargoOffer` table. All the data in the column will be lost.
  - You are about to drop the column `companyRating` on the `CargoOffer` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryDate` on the `CargoOffer` table. All the data in the column will be lost.
  - You are about to drop the column `distance` on the `CargoOffer` table. All the data in the column will be lost.
  - You are about to drop the column `loadingDate` on the `CargoOffer` table. All the data in the column will be lost.
  - You are about to drop the column `priceType` on the `CargoOffer` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `CargoOffer` table. All the data in the column will be lost.
  - You are about to drop the column `truckType` on the `CargoOffer` table. All the data in the column will be lost.
  - You are about to drop the column `volume` on the `CargoOffer` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `fuelLevel` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `mileage` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Vehicle` table. All the data in the column will be lost.
  - Added the required column `currentRoute` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `driverName` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lat` to the `Vehicle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lng` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "SystemAlert_read_idx";

-- DropIndex
DROP INDEX "Vehicle_status_idx";

-- AlterTable
ALTER TABLE "AgentAPIConnection" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "CargoOffer" DROP COLUMN "cargoType",
DROP COLUMN "companyRating",
DROP COLUMN "deliveryDate",
DROP COLUMN "distance",
DROP COLUMN "loadingDate",
DROP COLUMN "priceType",
DROP COLUMN "requirements",
DROP COLUMN "truckType",
DROP COLUMN "volume",
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "companyName" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'open',
ALTER COLUMN "urgency" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SystemAlert" ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "createdAt",
DROP COLUMN "fuelLevel",
DROP COLUMN "location",
DROP COLUMN "mileage",
DROP COLUMN "name",
DROP COLUMN "type",
DROP COLUMN "updatedAt",
ADD COLUMN     "currentRoute" TEXT NOT NULL,
ADD COLUMN     "driverName" TEXT NOT NULL,
ADD COLUMN     "lat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lng" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- CreateTable
CREATE TABLE "GpsLog" (
    "id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicleId" TEXT NOT NULL,

    CONSTRAINT "GpsLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RealTimeMetric" (
    "id" TEXT NOT NULL,
    "fuelEfficiency" DOUBLE PRECISION NOT NULL,
    "averageSpeed" DOUBLE PRECISION NOT NULL,
    "alertsCount" INTEGER NOT NULL,
    "compliance" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vehicleId" TEXT NOT NULL,

    CONSTRAINT "RealTimeMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GpsLog_vehicleId_idx" ON "GpsLog"("vehicleId");

-- CreateIndex
CREATE INDEX "RealTimeMetric_vehicleId_idx" ON "RealTimeMetric"("vehicleId");

-- CreateIndex
CREATE INDEX "AgentAPIConnection_agentId_idx" ON "AgentAPIConnection"("agentId");

-- CreateIndex
CREATE INDEX "AgentAPIConnection_integrationId_idx" ON "AgentAPIConnection"("integrationId");

-- CreateIndex
CREATE INDEX "AgentAPIConnection_userId_idx" ON "AgentAPIConnection"("userId");

-- CreateIndex
CREATE INDEX "CargoOffer_urgency_idx" ON "CargoOffer"("urgency");

-- AddForeignKey
ALTER TABLE "GpsLog" ADD CONSTRAINT "GpsLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealTimeMetric" ADD CONSTRAINT "RealTimeMetric_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
