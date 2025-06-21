/*
  Warnings:

  - You are about to drop the column `createdAt` on the `AgentAPIConnection` table. All the data in the column will be lost.
  - You are about to drop the column `alertsCount` on the `RealTimeMetric` table. All the data in the column will be lost.
  - You are about to drop the column `averageSpeed` on the `RealTimeMetric` table. All the data in the column will be lost.
  - You are about to drop the column `compliance` on the `RealTimeMetric` table. All the data in the column will be lost.
  - You are about to drop the column `fuelEfficiency` on the `RealTimeMetric` table. All the data in the column will be lost.
  - You are about to drop the column `vehicleId` on the `RealTimeMetric` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gpsDeviceImei]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fromCity` to the `CargoOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toCity` to the `CargoOffer` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `CargoOffer` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cargoType` on table `CargoOffer` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `metricType` to the `RealTimeMetric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `RealTimeMetric` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VehicleLocationType" AS ENUM ('MANUAL_COORDS', 'MANUAL_ADDRESS', 'GPS_API');

-- CreateEnum
CREATE TYPE "OfferRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- AlterEnum
ALTER TYPE "VehicleStatus" ADD VALUE 'en_route';

-- DropForeignKey
ALTER TABLE "CargoOffer" DROP CONSTRAINT "CargoOffer_userId_fkey";

-- DropForeignKey
ALTER TABLE "GpsLog" DROP CONSTRAINT "GpsLog_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "RealTimeMetric" DROP CONSTRAINT "RealTimeMetric_vehicleId_fkey";

-- DropIndex
DROP INDEX "AgentAPIConnection_agentId_idx";

-- DropIndex
DROP INDEX "AgentAPIConnection_integrationId_idx";

-- DropIndex
DROP INDEX "AgentAPIConnection_userId_idx";

-- DropIndex
DROP INDEX "GpsLog_vehicleId_idx";

-- DropIndex
DROP INDEX "RealTimeMetric_vehicleId_idx";

-- AlterTable
ALTER TABLE "AgentAPIConnection" DROP COLUMN "createdAt",
ADD COLUMN     "lastUsed" TIMESTAMP(3),
ADD COLUMN     "metrics" JSONB,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "CargoOffer" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "acceptedByUserId" TEXT,
ADD COLUMN     "companyRating" DOUBLE PRECISION,
ADD COLUMN     "distance" DOUBLE PRECISION,
ADD COLUMN     "fromCity" TEXT NOT NULL,
ADD COLUMN     "fromLocation" TEXT,
ADD COLUMN     "toCity" TEXT NOT NULL,
ADD COLUMN     "toLocation" TEXT,
ADD COLUMN     "vehicleType" TEXT,
ALTER COLUMN "urgency" DROP DEFAULT,
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "cargoType" SET NOT NULL;

-- AlterTable
ALTER TABLE "GpsLog" ADD COLUMN     "speed" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "RealTimeMetric" DROP COLUMN "alertsCount",
DROP COLUMN "averageSpeed",
DROP COLUMN "compliance",
DROP COLUMN "fuelEfficiency",
DROP COLUMN "vehicleId",
ADD COLUMN     "metricType" TEXT NOT NULL,
ADD COLUMN     "value" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "SystemAlert" ADD COLUMN     "details" TEXT,
ALTER COLUMN "type" SET DEFAULT 'info';

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currentRouteId" TEXT,
ADD COLUMN     "gpsDeviceImei" TEXT,
ADD COLUMN     "locationType" "VehicleLocationType" NOT NULL DEFAULT 'MANUAL_COORDS',
ADD COLUMN     "manualLocationAddress" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "currentRoute" DROP NOT NULL,
ALTER COLUMN "lat" DROP NOT NULL,
ALTER COLUMN "lng" DROP NOT NULL,
ALTER COLUMN "fuelConsumption" SET DEFAULT 30.0;

-- AlterTable
ALTER TABLE "ai_agents" ADD COLUMN     "confidenceScore" DOUBLE PRECISION,
ADD COLUMN     "depth" INTEGER,
ADD COLUMN     "evolutionCycle" INTEGER,
ADD COLUMN     "evolutionStatus" TEXT,
ADD COLUMN     "lastEvolution" TIMESTAMP(3),
ADD COLUMN     "layer" TEXT,
ADD COLUMN     "mcpCompatible" BOOLEAN,
ADD COLUMN     "modificationsCount" INTEGER,
ADD COLUMN     "protocolCompliance" TEXT,
ADD COLUMN     "successRate" DOUBLE PRECISION,
ADD COLUMN     "validationScore" INTEGER,
ADD COLUMN     "weight" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cargoOfferId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferRequest" (
    "id" TEXT NOT NULL,
    "cargoOfferId" TEXT NOT NULL,
    "transporterId" TEXT NOT NULL,
    "status" "OfferRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfferRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "cargoOfferId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChatMessage_cargoOfferId_idx" ON "ChatMessage"("cargoOfferId");

-- CreateIndex
CREATE INDEX "ChatMessage_senderId_idx" ON "ChatMessage"("senderId");

-- CreateIndex
CREATE INDEX "ChatMessage_cargoOfferId_createdAt_idx" ON "ChatMessage"("cargoOfferId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");

-- CreateIndex
CREATE INDEX "OfferRequest_cargoOfferId_idx" ON "OfferRequest"("cargoOfferId");

-- CreateIndex
CREATE INDEX "OfferRequest_transporterId_idx" ON "OfferRequest"("transporterId");

-- CreateIndex
CREATE UNIQUE INDEX "OfferRequest_cargoOfferId_transporterId_key" ON "OfferRequest"("cargoOfferId", "transporterId");

-- CreateIndex
CREATE INDEX "Assignment_cargoOfferId_idx" ON "Assignment"("cargoOfferId");

-- CreateIndex
CREATE INDEX "Assignment_vehicleId_idx" ON "Assignment"("vehicleId");

-- CreateIndex
CREATE INDEX "Assignment_userId_idx" ON "Assignment"("userId");

-- CreateIndex
CREATE INDEX "Assignment_status_idx" ON "Assignment"("status");

-- CreateIndex
CREATE INDEX "CargoOffer_status_idx" ON "CargoOffer"("status");

-- CreateIndex
CREATE INDEX "CargoOffer_userId_idx" ON "CargoOffer"("userId");

-- CreateIndex
CREATE INDEX "CargoOffer_status_createdAt_idx" ON "CargoOffer"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CargoOffer_acceptedByUserId_idx" ON "CargoOffer"("acceptedByUserId");

-- CreateIndex
CREATE INDEX "CargoOffer_createdAt_idx" ON "CargoOffer"("createdAt");

-- CreateIndex
CREATE INDEX "CargoOffer_urgency_idx" ON "CargoOffer"("urgency");

-- CreateIndex
CREATE INDEX "CargoOffer_fromCountry_idx" ON "CargoOffer"("fromCountry");

-- CreateIndex
CREATE INDEX "CargoOffer_toCountry_idx" ON "CargoOffer"("toCountry");

-- CreateIndex
CREATE INDEX "CargoOffer_weight_idx" ON "CargoOffer"("weight");

-- CreateIndex
CREATE INDEX "CargoOffer_deliveryDate_idx" ON "CargoOffer"("deliveryDate");

-- CreateIndex
CREATE INDEX "CargoOffer_status_userId_idx" ON "CargoOffer"("status", "userId");

-- CreateIndex
CREATE INDEX "CargoOffer_status_acceptedByUserId_idx" ON "CargoOffer"("status", "acceptedByUserId");

-- CreateIndex
CREATE INDEX "GpsLog_vehicleId_timestamp_idx" ON "GpsLog"("vehicleId", "timestamp");

-- CreateIndex
CREATE INDEX "RealTimeMetric_metricType_timestamp_idx" ON "RealTimeMetric"("metricType", "timestamp");

-- CreateIndex
CREATE INDEX "SystemAlert_type_idx" ON "SystemAlert"("type");

-- CreateIndex
CREATE INDEX "SystemAlert_createdAt_idx" ON "SystemAlert"("createdAt");

-- CreateIndex
CREATE INDEX "SystemAlert_isProcessed_idx" ON "SystemAlert"("isProcessed");

-- CreateIndex
CREATE INDEX "SystemAlert_read_idx" ON "SystemAlert"("read");

-- CreateIndex
CREATE INDEX "SystemAlert_type_createdAt_idx" ON "SystemAlert"("type", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_gpsDeviceImei_key" ON "Vehicle"("gpsDeviceImei");

-- CreateIndex
CREATE INDEX "Vehicle_status_idx" ON "Vehicle"("status");

-- CreateIndex
CREATE INDEX "Vehicle_fleetId_status_idx" ON "Vehicle"("fleetId", "status");

-- CreateIndex
CREATE INDEX "Vehicle_type_idx" ON "Vehicle"("type");

-- CreateIndex
CREATE INDEX "Vehicle_createdAt_idx" ON "Vehicle"("createdAt");

-- CreateIndex
CREATE INDEX "Vehicle_updatedAt_idx" ON "Vehicle"("updatedAt");

-- AddForeignKey
ALTER TABLE "CargoOffer" ADD CONSTRAINT "CargoOffer_acceptedByUserId_fkey" FOREIGN KEY ("acceptedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CargoOffer" ADD CONSTRAINT "CargoOffer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_cargoOfferId_fkey" FOREIGN KEY ("cargoOfferId") REFERENCES "CargoOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SystemAlert" ADD CONSTRAINT "SystemAlert_relatedId_fkey" FOREIGN KEY ("relatedId") REFERENCES "CargoOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GpsLog" ADD CONSTRAINT "GpsLog_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferRequest" ADD CONSTRAINT "OfferRequest_cargoOfferId_fkey" FOREIGN KEY ("cargoOfferId") REFERENCES "CargoOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferRequest" ADD CONSTRAINT "OfferRequest_transporterId_fkey" FOREIGN KEY ("transporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
