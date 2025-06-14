-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'client';

-- CreateTable
CREATE TABLE "ai_agents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "capabilities" JSONB NOT NULL,
    "configuration" JSONB NOT NULL,
    "performance" JSONB NOT NULL,
    "marketplace" BOOLEAN NOT NULL DEFAULT false,
    "price" DOUBLE PRECISION,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "requiresAPI" JSONB NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fleet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fleet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "location" JSONB,
    "fuelLevel" DOUBLE PRECISION,
    "mileage" DOUBLE PRECISION,
    "fleetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startPoint" JSONB NOT NULL,
    "endPoint" JSONB NOT NULL,
    "waypoints" JSONB,
    "distance" DOUBLE PRECISION,
    "duration" DOUBLE PRECISION,
    "fuelCost" DOUBLE PRECISION,
    "tollCost" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "fleetId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "optimized" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APIIntegration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "configuration" JSONB NOT NULL,
    "credentials" JSONB NOT NULL,
    "endpoints" JSONB NOT NULL,
    "headers" JSONB,
    "settings" JSONB,
    "description" TEXT,
    "documentation" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastSync" TIMESTAMP(3),
    "lastError" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "APIIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "agentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentMetric" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "performance" JSONB NOT NULL,
    "usage" JSONB NOT NULL,
    "errors" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FleetMetric" (
    "id" TEXT NOT NULL,
    "fleetId" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FleetMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "cost" DOUBLE PRECISION,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "vehicleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentAPIConnection" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentAPIConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CargoOffer" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fromLocation" TEXT NOT NULL,
    "toLocation" TEXT NOT NULL,
    "distance" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION NOT NULL,
    "volume" DOUBLE PRECISION,
    "cargoType" TEXT NOT NULL,
    "loadingDate" TIMESTAMP(3) NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "priceType" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyRating" DOUBLE PRECISION,
    "requirements" TEXT[],
    "truckType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "urgency" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CargoOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemAlert" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'info',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SystemAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_agents_marketplace_idx" ON "ai_agents"("marketplace");

-- CreateIndex
CREATE INDEX "ai_agents_category_idx" ON "ai_agents"("category");

-- CreateIndex
CREATE INDEX "ai_agents_isTemplate_idx" ON "ai_agents"("isTemplate");

-- CreateIndex
CREATE INDEX "Fleet_userId_idx" ON "Fleet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_licensePlate_key" ON "Vehicle"("licensePlate");

-- CreateIndex
CREATE INDEX "Vehicle_fleetId_idx" ON "Vehicle"("fleetId");

-- CreateIndex
CREATE INDEX "Vehicle_status_idx" ON "Vehicle"("status");

-- CreateIndex
CREATE INDEX "Route_fleetId_idx" ON "Route"("fleetId");

-- CreateIndex
CREATE INDEX "Route_status_idx" ON "Route"("status");

-- CreateIndex
CREATE INDEX "APIIntegration_userId_idx" ON "APIIntegration"("userId");

-- CreateIndex
CREATE INDEX "APIIntegration_type_idx" ON "APIIntegration"("type");

-- CreateIndex
CREATE INDEX "APIIntegration_provider_idx" ON "APIIntegration"("provider");

-- CreateIndex
CREATE INDEX "Review_agentId_idx" ON "Review"("agentId");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "AgentMetric_agentId_idx" ON "AgentMetric"("agentId");

-- CreateIndex
CREATE INDEX "AgentMetric_timestamp_idx" ON "AgentMetric"("timestamp");

-- CreateIndex
CREATE INDEX "FleetMetric_fleetId_idx" ON "FleetMetric"("fleetId");

-- CreateIndex
CREATE INDEX "FleetMetric_timestamp_idx" ON "FleetMetric"("timestamp");

-- CreateIndex
CREATE INDEX "Maintenance_vehicleId_idx" ON "Maintenance"("vehicleId");

-- CreateIndex
CREATE INDEX "Maintenance_status_idx" ON "Maintenance"("status");

-- CreateIndex
CREATE INDEX "Maintenance_scheduledAt_idx" ON "Maintenance"("scheduledAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgentAPIConnection_agentId_integrationId_key" ON "AgentAPIConnection"("agentId", "integrationId");

-- CreateIndex
CREATE INDEX "CargoOffer_status_idx" ON "CargoOffer"("status");

-- CreateIndex
CREATE INDEX "CargoOffer_fromLocation_idx" ON "CargoOffer"("fromLocation");

-- CreateIndex
CREATE INDEX "CargoOffer_toLocation_idx" ON "CargoOffer"("toLocation");

-- CreateIndex
CREATE INDEX "SystemAlert_read_idx" ON "SystemAlert"("read");

-- AddForeignKey
ALTER TABLE "ai_agents" ADD CONSTRAINT "ai_agents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fleet" ADD CONSTRAINT "Fleet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "Fleet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "Fleet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APIIntegration" ADD CONSTRAINT "APIIntegration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "ai_agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentMetric" ADD CONSTRAINT "AgentMetric_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "ai_agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FleetMetric" ADD CONSTRAINT "FleetMetric_fleetId_fkey" FOREIGN KEY ("fleetId") REFERENCES "Fleet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAPIConnection" ADD CONSTRAINT "AgentAPIConnection_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "ai_agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAPIConnection" ADD CONSTRAINT "AgentAPIConnection_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "APIIntegration"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAPIConnection" ADD CONSTRAINT "AgentAPIConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
