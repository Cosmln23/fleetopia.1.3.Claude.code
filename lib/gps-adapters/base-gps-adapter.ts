// Base GPS Adapter - Universal interface for all GPS providers
import { UniversalGPSAPI, VehicleLocation, APIResponse, APICredentials } from '../universal-api-bridge';

export abstract class BaseGPSAdapter implements UniversalGPSAPI {
  protected credentials: APICredentials;
  protected provider: string;

  constructor(credentials: APICredentials, provider: string) {
    this.credentials = credentials;
    this.provider = provider;
  }

  // Abstract methods that each adapter must implement
  abstract getVehicleLocation(vehicleId: string): Promise<APIResponse<VehicleLocation>>;
  abstract getFleetStatus(): Promise<APIResponse<VehicleLocation[]>>;
  abstract trackRoute(params: any): Promise<APIResponse<any>>;
  abstract createGeofence(params: any): Promise<APIResponse<any>>;
  abstract getVehicleAlerts(vehicleId: string): Promise<APIResponse<any[]>>;
  abstract getFuelConsumption(vehicleId: string, timeRange: any): Promise<APIResponse<any>>;
  abstract getDriverBehavior(driverId: string, timeRange: any): Promise<APIResponse<any>>;

  // Common utility methods
  protected createSuccessResponse<T>(data: T, responseTime: number = 0): APIResponse<T> {
    return {
      success: true,
      data,
      responseTime,
      provider: this.provider
    };
  }

  protected createErrorResponse(error: string, responseTime: number = 0): APIResponse<never> {
    return {
      success: false,
      error,
      responseTime,
      provider: this.provider
    };
  }

  protected async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const startTime = Date.now();
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      return response;
    } catch (error) {
      throw new Error(`Network request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Common GPS data validation
  protected validateCoordinates(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }

  protected sanitizeVehicleLocation(rawData: any, vehicleId: string): VehicleLocation | null {
    if (!rawData || typeof rawData !== 'object') return null;
    
    const lat = parseFloat(rawData.latitude || rawData.lat || 0);
    const lng = parseFloat(rawData.longitude || rawData.lng || rawData.lon || 0);
    
    if (!this.validateCoordinates(lat, lng)) return null;

    return {
      vehicleId,
      latitude: lat,
      longitude: lng,
      speed: parseFloat(rawData.speed || 0),
      heading: parseFloat(rawData.heading || rawData.bearing || 0),
      timestamp: new Date(rawData.timestamp || rawData.time || Date.now()),
      status: this.normalizeVehicleStatus(rawData.status),
      address: rawData.address || undefined,
      odometer: rawData.odometer ? parseFloat(rawData.odometer) : undefined
    };
  }

  private normalizeVehicleStatus(status: any): 'moving' | 'stopped' | 'idle' | 'offline' {
    if (!status || typeof status !== 'string') return 'offline';
    
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus.includes('moving') || normalizedStatus.includes('driving')) return 'moving';
    if (normalizedStatus.includes('stopped') || normalizedStatus.includes('parked')) return 'stopped';
    if (normalizedStatus.includes('idle') || normalizedStatus.includes('waiting')) return 'idle';
    return 'offline';
  }
}