/*
  Warnings:

  - The `status` column on the `Vehicle` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('idle', 'in_transit', 'loading', 'unloading', 'maintenance', 'assigned', 'out_of_service');

-- AlterTable
ALTER TABLE "Vehicle" DROP COLUMN "status",
ADD COLUMN     "status" "VehicleStatus" NOT NULL DEFAULT 'idle';
