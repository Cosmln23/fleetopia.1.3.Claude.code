// Samsara Fleet Management GPS Adapter
import { BaseGPSAdapter } from './base-gps-adapter';
import { VehicleLocation, APIResponse, APICredentials } from '../universal-api-bridge';

export class SamsaraGPSAdapter extends BaseGPSAdapter {
  private apiToken: string;
  private baseUrl = 'https://api.samsara.com/v1';

  constructor(credentials: APICredentials) {
    super(credentials, 'samsara');
    this.apiToken = credentials.token || credentials.apiKey || '';
  }

  async getVehicleLocation(vehicleId: string): Promise<APIResponse<VehicleLocation>> {
    const startTime = Date.now();
    
    try {
      const url = `${this.baseUrl}/fleet/vehicles/${vehicleId}/locations`;
      const response = await this.makeRequest(url, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return this.createErrorResponse(
          `Samsara API error: ${response.statusText}`,
          Date.now() - startTime
        );
      }

      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
        return this.createErrorResponse(
          'No location data found for vehicle',
          Date.now() - startTime
        );
      }

      // Get the most recent location
      const latestLocation = data.data[0];
      const location = this.sanitizeVehicleLocation({
        latitude: latestLocation.latitude,
        longitude: latestLocation.longitude,
        speed: latestLocation.speedMilesPerHour || 0,
        heading: latestLocation.heading || 0,
        timestamp: latestLocation.time,
        status: latestLocation.vehicleState || 'unknown'
      }, vehicleId);
      
      if (!location) {
        return this.createErrorResponse(
          'Invalid location data from Samsara API',
          Date.now() - startTime
        );
      }

      return this.createSuccessResponse(location, Date.now() - startTime);
    } catch (error) {
      return this.createErrorResponse(
        `Samsara API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        Date.now() - startTime
      );
    }
  }

  async getFleetStatus(): Promise<APIResponse<VehicleLocation[]>> {
    const startTime = Date.now();
    
    try {
      const url = `${this.baseUrl}/fleet/vehicles/locations`;
      const response = await this.makeRequest(url, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return this.createErrorResponse(
          `Samsara API error: ${response.statusText}`,
          Date.now() - startTime
        );
      }

      const data = await response.json();
      const vehicles: VehicleLocation[] = [];
      
      if (data.data && Array.isArray(data.data)) {
        for (const vehicleData of data.data) {
          if (vehicleData.locations && vehicleData.locations.length > 0) {
            const latestLocation = vehicleData.locations[0];
            const location = this.sanitizeVehicleLocation({
              latitude: latestLocation.latitude,
              longitude: latestLocation.longitude,
              speed: latestLocation.speedMilesPerHour || 0,
              heading: latestLocation.heading || 0,
              timestamp: latestLocation.time,
              status: vehicleData.vehicleState || 'unknown'
            }, vehicleData.id);
            
            if (location) vehicles.push(location);
          }
        }
      }

      return this.createSuccessResponse(vehicles, Date.now() - startTime);
    } catch (error) {
      return this.createErrorResponse(
        `Samsara API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        Date.now() - startTime
      );
    }
  }

  async trackRoute(params: any): Promise<APIResponse<any>> {
    const startTime = Date.now();
    return this.createErrorResponse('Route tracking not implemented for Samsara adapter', Date.now() - startTime);
  }

  async createGeofence(params: any): Promise<APIResponse<any>> {
    const startTime = Date.now();
    
    try {
      const { name, coordinates, type } = params;
      const url = `${this.baseUrl}/fleet/assets/locations`;
      
      const requestBody = {
        name,
        polygon: coordinates.map((coord: any) => ({
          latitude: coord.lat,
          longitude: coord.lng
        }))
      };

      const response = await this.makeRequest(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        return this.createErrorResponse(
          `Samsara geofence error: ${response.statusText}`,
          Date.now() - startTime
        );
      }

      const data = await response.json();
      return this.createSuccessResponse(data, Date.now() - startTime);
    } catch (error) {
      return this.createErrorResponse(
        `Samsara geofence creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        Date.now() - startTime
      );
    }
  }

  async getVehicleAlerts(vehicleId: string): Promise<APIResponse<any[]>> {
    const startTime = Date.now();
    
    try {
      const url = `${this.baseUrl}/fleet/vehicles/${vehicleId}/safety/events`;
      const response = await this.makeRequest(url, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return this.createErrorResponse(
          `Samsara alerts error: ${response.statusText}`,
          Date.now() - startTime
        );
      }

      const data = await response.json();
      return this.createSuccessResponse(data.data || [], Date.now() - startTime);
    } catch (error) {
      return this.createErrorResponse(
        `Samsara alerts request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        Date.now() - startTime
      );
    }
  }

  async getFuelConsumption(vehicleId: string, timeRange: any): Promise<APIResponse<any>> {
    const startTime = Date.now();
    return this.createErrorResponse('Fuel consumption not implemented for Samsara adapter', Date.now() - startTime);
  }

  async getDriverBehavior(driverId: string, timeRange: any): Promise<APIResponse<any>> {
    const startTime = Date.now();
    return this.createErrorResponse('Driver behavior not implemented for Samsara adapter', Date.now() - startTime);
  }
}