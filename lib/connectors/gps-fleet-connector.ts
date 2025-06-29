/**
 * GPS Fleet Connector
 * Unified connector for fleet GPS management
 * Follows the user's specific plan for fleet tracking integration
 */

import prisma from '@/lib/prisma';
import { systemConfigService } from '@/lib/system-config-service';

export interface FleetVehicle {
  id: string;
  name: string;
  licensePlate: string;
  driverName: string;
  status: 'idle' | 'in_transit' | 'en_route' | 'loading' | 'unloading' | 'maintenance' | 'assigned' | 'out_of_service';
  lat: number;
  lng: number;
  currentLat?: number;
  currentLng?: number;
  capacityKg?: number;
  vehicleType?: 'VAN' | 'TRUCK' | 'SEMI';
  driverId?: string;
  fuelConsumption?: number;
  gpsProvider?: string;
  gpsEnabled: boolean;
  lastUpdate: Date;
  currentRoute?: string;
  distanceFromBase?: number;
  estimatedArrival?: Date;
}

export interface VehiclePosition {
  vehicleId: string;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  altitude?: number;
  accuracy?: number;
  timestamp: Date;
  address?: string;
}

export interface FleetStatus {
  totalVehicles: number;
  activeVehicles: number;
  idleVehicles: number;
  inTransitVehicles: number;
  maintenanceVehicles: number;
  averageSpeed: number;
  totalDistance: number;
  onlineVehicles: number;
}

class FleetGPSConnector {
  private positionCache: Map<string, VehiclePosition> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 30 * 1000; // 30 seconds

  /**
   * Get vehicle positions from GPS
   * Main method as specified in user's plan
   */
  public async getVehiclePositions(vehicleIds?: string[]): Promise<VehiclePosition[]> {
    try {
      console.log('🛰️ Fetching vehicle GPS positions...');
      
      // Build where clause
      const where: any = {
        gpsEnabled: true
      };
      
      if (vehicleIds && vehicleIds.length > 0) {
        where.id = { in: vehicleIds };
      }

      // Get vehicles with GPS data
      const vehicles = await prisma.vehicle.findMany({
        where,
        select: {
          id: true,
          name: true,
          licensePlate: true,
          lat: true,
          lng: true,
          currentLat: true,
          currentLng: true,
          lastUpdate: true,
          gpsProvider: true
        }
      });

      // Transform to VehiclePosition format
      const positions: VehiclePosition[] = vehicles.map(vehicle => ({
        vehicleId: vehicle.id,
        lat: vehicle.currentLat || vehicle.lat,
        lng: vehicle.currentLng || vehicle.lng,
        timestamp: vehicle.lastUpdate || new Date(),
        address: `Vehicle ${vehicle.name} (${vehicle.licensePlate})`
      }));

      // Cache positions
      positions.forEach(pos => {
        this.positionCache.set(pos.vehicleId, pos);
        this.cacheExpiry.set(pos.vehicleId, Date.now() + this.CACHE_TTL);
      });

      console.log(`✅ Retrieved ${positions.length} vehicle positions`);
      return positions;
    } catch (error) {
      console.error('❌ Error fetching vehicle positions:', error);
      throw error;
    }
  }

  /**
   * Get vehicle status from GPS
   * As specified in user's plan
   */
  public async getVehicleStatus(vehicleId: string): Promise<FleetVehicle | null> {
    try {
      console.log(`🔍 Fetching vehicle status for: ${vehicleId}`);

      // Check cache first
      if (this.isCacheValid(vehicleId)) {
        const cached = this.positionCache.get(vehicleId);
        if (cached) {
          console.log('💾 Returning cached vehicle status');
        }
      }

      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
        include: {
          assignments: {
            where: { status: 'active' },
            include: {
              cargoOffer: {
                select: { 
                  title: true,
                  fromCity: true,
                  toCity: true,
                  deliveryDate: true
                }
              }
            }
          }
        }
      });

      if (!vehicle) {
        console.log(`❌ Vehicle not found: ${vehicleId}`);
        return null;
      }

      // Calculate distance from base (assuming base is at 0,0 for now)
      const distanceFromBase = this.calculateDistance(
        vehicle.currentLat || vehicle.lat,
        vehicle.currentLng || vehicle.lng,
        0, 0
      );

      return {
        id: vehicle.id,
        name: vehicle.name,
        licensePlate: vehicle.licensePlate,
        driverName: vehicle.driverName,
        status: vehicle.status as any,
        lat: vehicle.lat,
        lng: vehicle.lng,
        currentLat: vehicle.currentLat,
        currentLng: vehicle.currentLng,
        capacityKg: vehicle.capacityKg,
        vehicleType: vehicle.vehicleType as any,
        driverId: vehicle.driverId,
        fuelConsumption: vehicle.fuelConsumption,
        gpsProvider: vehicle.gpsProvider,
        gpsEnabled: vehicle.gpsEnabled,
        lastUpdate: vehicle.lastUpdate || new Date(),
        currentRoute: vehicle.currentRoute,
        distanceFromBase,
        estimatedArrival: vehicle.assignments[0]?.cargoOffer?.deliveryDate
      };
    } catch (error) {
      console.error(`❌ Error fetching vehicle status for ${vehicleId}:`, error);
      throw error;
    }
  }

  /**
   * Get vehicle capacity and specifications
   * As specified in user's plan
   */
  public async getVehicleCapacity(vehicleId: string): Promise<{
    vehicleId: string;
    capacityKg: number;
    currentLoad: number;
    availableCapacity: number;
    vehicleType: string;
    fuelConsumption: number;
    specifications: any;
  } | null> {
    try {
      console.log(`📦 Fetching vehicle capacity for: ${vehicleId}`);

      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId },
        include: {
          assignments: {
            where: { status: 'active' },
            include: {
              cargoOffer: {
                select: { weight: true }
              }
            }
          }
        }
      });

      if (!vehicle) {
        return null;
      }

      // Calculate current load from active assignments
      const currentLoad = vehicle.assignments.reduce(
        (total, assignment) => total + (assignment.cargoOffer?.weight || 0),
        0
      );

      const maxCapacity = vehicle.capacityKg || 3500; // Default 3.5 tons
      const availableCapacity = Math.max(0, maxCapacity - currentLoad);

      return {
        vehicleId: vehicle.id,
        capacityKg: maxCapacity,
        currentLoad,
        availableCapacity,
        vehicleType: vehicle.vehicleType || 'TRUCK',
        fuelConsumption: vehicle.fuelConsumption || 8.0,
        specifications: {
          name: vehicle.name,
          licensePlate: vehicle.licensePlate,
          driverName: vehicle.driverName,
          gpsEnabled: vehicle.gpsEnabled,
          status: vehicle.status
        }
      };
    } catch (error) {
      console.error(`❌ Error fetching vehicle capacity for ${vehicleId}:`, error);
      throw error;
    }
  }

  /**
   * Get overall fleet status
   */
  public async getFleetStatus(): Promise<FleetStatus> {
    try {
      console.log('📊 Fetching fleet status...');

      const totalVehicles = await prisma.vehicle.count();
      
      const statusCounts = await prisma.vehicle.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      });

      const activeVehicles = statusCounts.find(s => s.status === 'in_transit')?._count.status || 0;
      const idleVehicles = statusCounts.find(s => s.status === 'idle')?._count.status || 0;
      const inTransitVehicles = statusCounts.find(s => s.status === 'in_transit')?._count.status || 0;
      const maintenanceVehicles = statusCounts.find(s => s.status === 'maintenance')?._count.status || 0;

      const onlineVehicles = await prisma.vehicle.count({
        where: { gpsEnabled: true }
      });

      // Calculate average speed (mock for now)
      const averageSpeed = 65; // km/h

      // Calculate total distance (mock for now)
      const totalDistance = 1250; // km

      return {
        totalVehicles,
        activeVehicles: activeVehicles + inTransitVehicles,
        idleVehicles,
        inTransitVehicles,
        maintenanceVehicles,
        averageSpeed,
        totalDistance,
        onlineVehicles
      };
    } catch (error) {
      console.error('❌ Error fetching fleet status:', error);
      throw error;
    }
  }

  /**
   * Update vehicle position
   */
  public async updateVehiclePosition(
    vehicleId: string, 
    lat: number, 
    lng: number,
    options?: {
      speed?: number;
      heading?: number;
      accuracy?: number;
      address?: string;
    }
  ): Promise<boolean> {
    try {
      console.log(`📍 Updating vehicle position: ${vehicleId} -> (${lat}, ${lng})`);

      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: {
          currentLat: lat,
          currentLng: lng,
          lastUpdate: new Date()
        }
      });

      // Update cache
      const position: VehiclePosition = {
        vehicleId,
        lat,
        lng,
        speed: options?.speed,
        heading: options?.heading,
        accuracy: options?.accuracy,
        timestamp: new Date(),
        address: options?.address
      };

      this.positionCache.set(vehicleId, position);
      this.cacheExpiry.set(vehicleId, Date.now() + this.CACHE_TTL);

      console.log(`✅ Vehicle position updated: ${vehicleId}`);
      return true;
    } catch (error) {
      console.error(`❌ Error updating vehicle position for ${vehicleId}:`, error);
      return false;
    }
  }

  /**
   * Get vehicles near location
   */
  public async getVehiclesNearLocation(
    lat: number, 
    lng: number, 
    radiusKm: number = 50
  ): Promise<FleetVehicle[]> {
    try {
      console.log(`🎯 Finding vehicles near (${lat}, ${lng}) within ${radiusKm}km`);

      const vehicles = await prisma.vehicle.findMany({
        where: {
          gpsEnabled: true,
          status: { not: 'out_of_service' }
        }
      });

      // Filter by distance
      const nearbyVehicles = vehicles.filter(vehicle => {
        const distance = this.calculateDistance(
          lat, lng,
          vehicle.currentLat || vehicle.lat,
          vehicle.currentLng || vehicle.lng
        );
        return distance <= radiusKm;
      });

      // Transform to FleetVehicle format
      const fleetVehicles: FleetVehicle[] = nearbyVehicles.map(vehicle => ({
        id: vehicle.id,
        name: vehicle.name,
        licensePlate: vehicle.licensePlate,
        driverName: vehicle.driverName,
        status: vehicle.status as any,
        lat: vehicle.lat,
        lng: vehicle.lng,
        currentLat: vehicle.currentLat,
        currentLng: vehicle.currentLng,
        capacityKg: vehicle.capacityKg,
        vehicleType: vehicle.vehicleType as any,
        driverId: vehicle.driverId,
        fuelConsumption: vehicle.fuelConsumption,
        gpsProvider: vehicle.gpsProvider,
        gpsEnabled: vehicle.gpsEnabled,
        lastUpdate: vehicle.lastUpdate || new Date(),
        currentRoute: vehicle.currentRoute,
        distanceFromBase: this.calculateDistance(
          lat, lng,
          vehicle.currentLat || vehicle.lat,
          vehicle.currentLng || vehicle.lng
        )
      }));

      console.log(`✅ Found ${fleetVehicles.length} vehicles nearby`);
      return fleetVehicles;
    } catch (error) {
      console.error('❌ Error finding nearby vehicles:', error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.positionCache.clear();
    this.cacheExpiry.clear();
    console.log('🧹 GPS Fleet cache cleared');
  }

  // Private helper methods

  private isCacheValid(vehicleId: string): boolean {
    const expiry = this.cacheExpiry.get(vehicleId);
    return expiry ? Date.now() < expiry : false;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

// Export singleton instance
export const gpsFleetConnector = new FleetGPSConnector();

// Export for external use
export default gpsFleetConnector;