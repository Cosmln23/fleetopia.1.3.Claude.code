// HERE Fleet Telematics GPS Adapter
import { BaseGPSAdapter } from './base-gps-adapter';
import { VehicleLocation, APIResponse, APICredentials } from '../universal-api-bridge';

export class HereGPSAdapter extends BaseGPSAdapter {
  private apiKey: string;
  private appId?: string;
  private appCode?: string;
  private baseUrl = 'https://fleet.ls.hereapi.com/2';

  constructor(credentials: APICredentials) {
    super(credentials, 'here');
    this.apiKey = credentials.apiKey || '';
    this.appId = credentials.clientId || '';
    this.appCode = credentials.clientSecret || '';
  }

  async getVehicleLocation(vehicleId: string): Promise<APIResponse<VehicleLocation>> {
    const startTime = Date.now();
    
    try {
      const url = `${this.baseUrl}/positions/${vehicleId}?apikey=${this.apiKey}`;
      const response = await this.makeRequest(url);
      
      if (!response.ok) {
        return this.createErrorResponse(
          `HERE API error: ${response.statusText}`,
          Date.now() - startTime
        );
      }

      const data = await response.json();
      const location = this.sanitizeVehicleLocation(data.position, vehicleId);
      
      if (!location) {
        return this.createErrorResponse(
          'Invalid location data from HERE API',
          Date.now() - startTime
        );
      }

      return this.createSuccessResponse(location, Date.now() - startTime);
    } catch (error) {
      return this.createErrorResponse(
        `HERE API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        Date.now() - startTime
      );
    }
  }

  async getFleetStatus(): Promise<APIResponse<VehicleLocation[]>> {
    const startTime = Date.now();
    
    try {
      const url = `${this.baseUrl}/positions?apikey=${this.apiKey}`;
      const response = await this.makeRequest(url);
      
      if (!response.ok) {
        return this.createErrorResponse(
          `HERE API error: ${response.statusText}`,
          Date.now() - startTime
        );
      }

      const data = await response.json();
      const vehicles: VehicleLocation[] = [];
      
      if (data.positions && Array.isArray(data.positions)) {
        for (const position of data.positions) {
          const location = this.sanitizeVehicleLocation(position, position.deviceId || position.id);
          if (location) vehicles.push(location);
        }
      }

      return this.createSuccessResponse(vehicles, Date.now() - startTime);
    } catch (error) {
      return this.createErrorResponse(
        `HERE API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        Date.now() - startTime
      );
    }
  }

  async trackRoute(params: any): Promise<APIResponse<any>> {
    const startTime = Date.now();
    
    try {
      const { vehicleId, origin, destination, waypoints } = params;
      const url = `${this.baseUrl}/routes?apikey=${this.apiKey}`;
      
      const requestBody = {
        vehicleId,
        start: `${origin.lat},${origin.lng}`,
        end: `${destination.lat},${destination.lng}`,
        waypoints: waypoints?.map((wp: any) => `${wp.lat},${wp.lng}`).join(';')
      };

      const response = await this.makeRequest(url, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        return this.createErrorResponse(
          `HERE routing error: ${response.statusText}`,
          Date.now() - startTime
        );
      }

      const data = await response.json();
      return this.createSuccessResponse(data, Date.now() - startTime);
    } catch (error) {
      return this.createErrorResponse(
        `HERE routing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        Date.now() - startTime
      );
    }
  }

  async createGeofence(params: any): Promise<APIResponse<any>> {
    const startTime = Date.now();
    return this.createErrorResponse('Geofencing not implemented for HERE adapter', Date.now() - startTime);
  }

  async getVehicleAlerts(vehicleId: string): Promise<APIResponse<any[]>> {
    const startTime = Date.now();
    return this.createErrorResponse('Vehicle alerts not implemented for HERE adapter', Date.now() - startTime);
  }

  async getFuelConsumption(vehicleId: string, timeRange: any): Promise<APIResponse<any>> {
    const startTime = Date.now();
    return this.createErrorResponse('Fuel consumption not implemented for HERE adapter', Date.now() - startTime);
  }

  async getDriverBehavior(driverId: string, timeRange: any): Promise<APIResponse<any>> {
    const startTime = Date.now();
    return this.createErrorResponse('Driver behavior not implemented for HERE adapter', Date.now() - startTime);
  }
}