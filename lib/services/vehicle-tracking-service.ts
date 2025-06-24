// Real-time Vehicle Tracking Service
import prisma from '@/lib/prisma';
import { APIProviderRegistry } from '../universal-api-bridge';
import { HereGPSAdapter } from '../gps-adapters/here-adapter';
import { SamsaraGPSAdapter } from '../gps-adapters/samsara-adapter';
import { CustomGPSAdapter } from '../gps-adapters/custom-adapter';
import type { UniversalGPSAPI, VehicleLocation } from '../universal-api-bridge';

export interface TrackingUpdate {
  vehicleId: string;
  location: VehicleLocation;
  timestamp: Date;
  provider: string;
  success: boolean;
  error?: string;
}

export class VehicleTrackingService {
  private static instance: VehicleTrackingService;
  private trackingIntervals = new Map<string, NodeJS.Timeout>();
  private isInitialized = false;

  private constructor() {}

  static getInstance(): VehicleTrackingService {
    if (!VehicleTrackingService.instance) {
      VehicleTrackingService.instance = new VehicleTrackingService();
    }
    return VehicleTrackingService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Register GPS adapters with the provider registry
      this.registerGPSAdapters();
      
      // Start tracking for all GPS-enabled vehicles
      await this.startAllVehicleTracking();
      
      this.isInitialized = true;
      console.log('Vehicle tracking service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize vehicle tracking service:', error);
      throw error;
    }
  }

  private registerGPSAdapters(): void {
    // Note: These will be properly initialized when vehicles with GPS providers are found
    // For now, we register placeholder adapters
    APIProviderRegistry.registerProvider('gps', 'here', new HereGPSAdapter({ apiKey: 'demo' }));
    APIProviderRegistry.registerProvider('gps', 'samsara', new SamsaraGPSAdapter({ token: 'demo' }));
    APIProviderRegistry.registerProvider('gps', 'custom', new CustomGPSAdapter({ 
      apiKey: 'demo', 
      additionalConfig: { baseUrl: 'https://api.example.com' } 
    }));
  }

  async startAllVehicleTracking(): Promise<void> {
    try {
      // Get all GPS-enabled vehicles
      const gpsVehicles = await prisma.vehicle.findMany({
        where: {
          gpsEnabled: true,
          gpsProvider: { not: null }
        },
        select: {
          id: true,
          name: true,
          gpsProvider: true,
          fleet: {
            select: {
              userId: true
            }
          }
        }
      });

      console.log(`Found ${gpsVehicles.length} GPS-enabled vehicles`);

      // Start tracking for each vehicle
      for (const vehicle of gpsVehicles) {
        if (vehicle.gpsProvider) {
          await this.startVehicleTracking(vehicle.id, vehicle.gpsProvider, vehicle.fleet.userId);
        }
      }
    } catch (error) {
      console.error('Failed to start vehicle tracking:', error);
    }
  }

  async startVehicleTracking(vehicleId: string, gpsProvider: string, userId: string): Promise<void> {
    // Stop existing tracking if any
    this.stopVehicleTracking(vehicleId);

    try {
      // Get GPS adapter for this provider
      const gpsAdapter = this.getGPSAdapter(gpsProvider, userId);
      if (!gpsAdapter) {
        console.error(`No GPS adapter found for provider: ${gpsProvider}`);
        return;
      }

      // Start periodic tracking (every 30 seconds)
      const interval = setInterval(async () => {
        await this.updateVehicleLocation(vehicleId, gpsAdapter, gpsProvider);
      }, 30000); // 30 seconds

      this.trackingIntervals.set(vehicleId, interval);
      
      // Initial location update
      await this.updateVehicleLocation(vehicleId, gpsAdapter, gpsProvider);
      
      console.log(`Started tracking vehicle ${vehicleId} with ${gpsProvider} provider`);
    } catch (error) {
      console.error(`Failed to start tracking for vehicle ${vehicleId}:`, error);
    }
  }

  async stopVehicleTracking(vehicleId: string): Promise<void> {
    const interval = this.trackingIntervals.get(vehicleId);
    if (interval) {
      clearInterval(interval);
      this.trackingIntervals.delete(vehicleId);
      console.log(`Stopped tracking vehicle ${vehicleId}`);
    }
  }

  private async updateVehicleLocation(
    vehicleId: string, 
    gpsAdapter: UniversalGPSAPI, 
    provider: string
  ): Promise<TrackingUpdate> {
    const startTime = Date.now();
    
    try {
      // Get location from GPS provider
      const response = await gpsAdapter.getVehicleLocation(vehicleId);
      
      if (!response.success || !response.data) {
        console.error(`GPS tracking failed for vehicle ${vehicleId}:`, response.error);
        return {
          vehicleId,
          location: {} as VehicleLocation,
          timestamp: new Date(),
          provider,
          success: false,
          error: response.error
        };
      }

      const location = response.data;

      // Update vehicle location in database
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: {
          lat: location.latitude,
          lng: location.longitude,
          updatedAt: new Date()
        }
      });

      // Log GPS tracking data
      await prisma.gpsLog.create({
        data: {
          vehicleId,
          lat: location.latitude,
          lng: location.longitude,
          speed: location.speed,
          timestamp: location.timestamp
        }
      });

      const update: TrackingUpdate = {
        vehicleId,
        location,
        timestamp: new Date(),
        provider,
        success: true
      };

      // Emit real-time update (for WebSocket connections)
      this.emitLocationUpdate(update);

      return update;
    } catch (error) {
      console.error(`Error updating location for vehicle ${vehicleId}:`, error);
      return {
        vehicleId,
        location: {} as VehicleLocation,
        timestamp: new Date(),
        provider,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private getGPSAdapter(provider: string, userId: string): UniversalGPSAPI | null {
    // Try to get user-specific adapter first
    let adapter = APIProviderRegistry.getProvider<UniversalGPSAPI>('gps', `${provider}_${userId}`);
    
    // Fall back to generic adapter
    if (!adapter) {
      adapter = APIProviderRegistry.getProvider<UniversalGPSAPI>('gps', provider);
    }

    return adapter;
  }

  private emitLocationUpdate(update: TrackingUpdate): void {
    // This would typically emit to WebSocket connections
    // For now, we'll just log it
    console.log(`Location update for vehicle ${update.vehicleId}:`, {
      lat: update.location.latitude,
      lng: update.location.longitude,
      status: update.location.status,
      provider: update.provider
    });
  }

  async getFleetStatus(userId: string): Promise<VehicleLocation[]> {
    try {
      // Get all GPS-enabled vehicles for this user
      const vehicles = await prisma.vehicle.findMany({
        where: {
          gpsEnabled: true,
          gpsProvider: { not: null },
          fleet: { userId }
        },
        select: {
          id: true,
          name: true,
          lat: true,
          lng: true,
          status: true,
          gpsProvider: true,
          updatedAt: true
        }
      });

      // Convert to VehicleLocation format
      return vehicles
        .filter(v => v.lat && v.lng)
        .map(vehicle => ({
          vehicleId: vehicle.id,
          latitude: vehicle.lat!,
          longitude: vehicle.lng!,
          speed: 0, // Would be from GPS data
          heading: 0, // Would be from GPS data
          timestamp: vehicle.updatedAt,
          status: this.mapVehicleStatus(vehicle.status),
          address: undefined,
          odometer: undefined
        }));
    } catch (error) {
      console.error('Failed to get fleet status:', error);
      return [];
    }
  }

  private mapVehicleStatus(status: string): 'moving' | 'stopped' | 'idle' | 'offline' {
    switch (status) {
      case 'in_transit':
      case 'en_route':
        return 'moving';
      case 'loading':
      case 'unloading':
        return 'stopped';
      case 'idle':
        return 'idle';
      default:
        return 'offline';
    }
  }

  async enableVehicleTracking(vehicleId: string, gpsProvider: string, userId: string): Promise<boolean> {
    try {
      // Update vehicle in database
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: {
          gpsEnabled: true,
          gpsProvider
        }
      });

      // Start tracking
      await this.startVehicleTracking(vehicleId, gpsProvider, userId);
      return true;
    } catch (error) {
      console.error(`Failed to enable tracking for vehicle ${vehicleId}:`, error);
      return false;
    }
  }

  async disableVehicleTracking(vehicleId: string): Promise<boolean> {
    try {
      // Update vehicle in database
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: {
          gpsEnabled: false,
          gpsProvider: null
        }
      });

      // Stop tracking
      await this.stopVehicleTracking(vehicleId);
      return true;
    } catch (error) {
      console.error(`Failed to disable tracking for vehicle ${vehicleId}:`, error);
      return false;
    }
  }

  getTrackingStats(): { activeVehicles: number; totalProviders: number } {
    return {
      activeVehicles: this.trackingIntervals.size,
      totalProviders: 3 // HERE, Samsara, Custom
    };
  }
}

// Export singleton instance
export const vehicleTrackingService = VehicleTrackingService.getInstance();