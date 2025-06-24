// Custom GPS API Adapter - Universal adapter for any REST API
import { BaseGPSAdapter } from './base-gps-adapter';
import { VehicleLocation, APIResponse, APICredentials } from '../universal-api-bridge';

export class CustomGPSAdapter extends BaseGPSAdapter {
  private baseUrl: string;
  private apiKey: string;
  private authMethod: 'apikey' | 'bearer' | 'basic';

  constructor(credentials: APICredentials) {
    super(credentials, 'custom');
    this.baseUrl = credentials.additionalConfig?.baseUrl || '';
    this.apiKey = credentials.apiKey || '';
    this.authMethod = credentials.additionalConfig?.authMethod || 'apikey';
  }

  private getAuthHeaders(): Record<string, string> {
    switch (this.authMethod) {
      case 'bearer':
        return { 'Authorization': `Bearer ${this.apiKey}` };
      case 'basic':
        return { 'Authorization': `Basic ${Buffer.from(this.apiKey).toString('base64')}` };
      case 'apikey':
      default:
        return { 'X-API-Key': this.apiKey };
    }
  }

  async getVehicleLocation(vehicleId: string): Promise<APIResponse<VehicleLocation>> {
    const startTime = Date.now();
    
    try {
      const url = `${this.baseUrl}/vehicles/${vehicleId}/location`;
      const response = await this.makeRequest(url, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return this.createErrorResponse(
          `Custom GPS API error: ${response.statusText}`,
          Date.now() - startTime
        );
      }

      const data = await response.json();
      
      // Try to extract location data from common response formats
      const locationData = data.location || data.position || data.data || data;
      const location = this.sanitizeVehicleLocation(locationData, vehicleId);
      
      if (!location) {
        return this.createErrorResponse(
          'Invalid location data from custom GPS API',
          Date.now() - startTime
        );
      }

      return this.createSuccessResponse(location, Date.now() - startTime);
    } catch (error) {
      return this.createErrorResponse(
        `Custom GPS API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        Date.now() - startTime
      );
    }
  }

  async getFleetStatus(): Promise<APIResponse<VehicleLocation[]>> {
    const startTime = Date.now();
    
    try {
      const url = `${this.baseUrl}/vehicles/locations`;
      const response = await this.makeRequest(url, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return this.createErrorResponse(
          `Custom GPS API error: ${response.statusText}`,
          Date.now() - startTime
        );
      }

      const data = await response.json();
      const vehicles: VehicleLocation[] = [];
      
      // Try to extract vehicles array from common response formats
      const vehiclesData = data.vehicles || data.locations || data.data || data;
      
      if (Array.isArray(vehiclesData)) {
        for (const vehicleData of vehiclesData) {
          const location = this.sanitizeVehicleLocation(
            vehicleData, 
            vehicleData.vehicleId || vehicleData.id || vehicleData.deviceId
          );
          if (location) vehicles.push(location);
        }
      }

      return this.createSuccessResponse(vehicles, Date.now() - startTime);
    } catch (error) {
      return this.createErrorResponse(
        `Custom GPS API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        Date.now() - startTime
      );
    }
  }

  async trackRoute(params: any): Promise<APIResponse<any>> {
    const startTime = Date.now();
    
    try {
      const { vehicleId, origin, destination, waypoints } = params;
      const url = `${this.baseUrl}/vehicles/${vehicleId}/route`;
      
      const requestBody = {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        waypoints: waypoints || []
      };

      const response = await this.makeRequest(url, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        return this.createErrorResponse(
          `Custom GPS route error: ${response.statusText}`,
          Date.now() - startTime
        );
      }

      const data = await response.json();
      return this.createSuccessResponse(data, Date.now() - startTime);
    } catch (error) {
      return this.createErrorResponse(
        `Custom GPS route tracking failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        Date.now() - startTime
      );
    }
  }

  async createGeofence(params: any): Promise<APIResponse<any>> {
    const startTime = Date.now();
    
    try {
      const url = `${this.baseUrl}/geofences`;
      
      const response = await this.makeRequest(url, {
        method: 'POST',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        return this.createErrorResponse(
          `Custom GPS geofence error: ${response.statusText}`,
          Date.now() - startTime
        );
      }

      const data = await response.json();
      return this.createSuccessResponse(data, Date.now() - startTime);
    } catch (error) {
      return this.createErrorResponse(
        `Custom GPS geofence creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        Date.now() - startTime
      );
    }
  }

  async getVehicleAlerts(vehicleId: string): Promise<APIResponse<any[]>> {
    const startTime = Date.now();
    
    try {
      const url = `${this.baseUrl}/vehicles/${vehicleId}/alerts`;
      const response = await this.makeRequest(url, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return this.createErrorResponse(
          `Custom GPS alerts error: ${response.statusText}`,
          Date.now() - startTime
        );
      }

      const data = await response.json();
      const alerts = data.alerts || data.data || data || [];
      return this.createSuccessResponse(Array.isArray(alerts) ? alerts : [], Date.now() - startTime);
    } catch (error) {
      return this.createErrorResponse(
        `Custom GPS alerts request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        Date.now() - startTime
      );
    }
  }

  async getFuelConsumption(vehicleId: string, timeRange: any): Promise<APIResponse<any>> {
    const startTime = Date.now();
    
    try {
      const url = `${this.baseUrl}/vehicles/${vehicleId}/fuel?start=${timeRange.from.toISOString()}&end=${timeRange.to.toISOString()}`;
      const response = await this.makeRequest(url, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return this.createErrorResponse(
          `Custom GPS fuel data error: ${response.statusText}`,
          Date.now() - startTime
        );
      }

      const data = await response.json();
      return this.createSuccessResponse(data, Date.now() - startTime);
    } catch (error) {
      return this.createErrorResponse(
        `Custom GPS fuel data request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        Date.now() - startTime
      );
    }
  }

  async getDriverBehavior(driverId: string, timeRange: any): Promise<APIResponse<any>> {
    const startTime = Date.now();
    
    try {
      const url = `${this.baseUrl}/drivers/${driverId}/behavior?start=${timeRange.from.toISOString()}&end=${timeRange.to.toISOString()}`;
      const response = await this.makeRequest(url, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        return this.createErrorResponse(
          `Custom GPS driver behavior error: ${response.statusText}`,
          Date.now() - startTime
        );
      }

      const data = await response.json();
      return this.createSuccessResponse(data, Date.now() - startTime);
    } catch (error) {
      return this.createErrorResponse(
        `Custom GPS driver behavior request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        Date.now() - startTime
      );
    }
  }
}