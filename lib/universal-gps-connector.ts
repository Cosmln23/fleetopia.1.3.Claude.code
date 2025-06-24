// Universal GPS Connector - Connect ANY GPS API
export interface UniversalGPSConfig {
  name: string;                    // Custom name for this GPS provider
  baseUrl: string;                 // Base API URL
  authType: 'apikey' | 'bearer' | 'basic' | 'none';
  credentials: {
    apiKey?: string;
    token?: string;
    username?: string;
    password?: string;
  };
  endpoints: {
    getVehicleLocation: string;    // e.g., "/vehicles/{vehicleId}/location"
    getFleetStatus: string;        // e.g., "/vehicles/locations"
    updateLocation?: string;       // Optional: for posting location data
  };
  dataMapping: {
    vehicleId: string;             // Field name for vehicle ID (e.g., "id", "vehicleId", "deviceId")
    latitude: string;              // Field name for latitude (e.g., "lat", "latitude", "y")
    longitude: string;             // Field name for longitude (e.g., "lng", "longitude", "x")
    timestamp: string;             // Field name for timestamp (e.g., "time", "timestamp", "date")
    status?: string;               // Optional: field name for status
    speed?: string;                // Optional: field name for speed
    heading?: string;              // Optional: field name for heading/direction
  };
  requestHeaders?: Record<string, string>; // Additional headers
  responseWrapper?: string;        // If data is wrapped (e.g., "data", "result", "payload")
}

export interface GPSLocation {
  vehicleId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  status?: string;
  speed?: number;
  heading?: number;
}

export class UniversalGPSConnector {
  private config: UniversalGPSConfig;

  constructor(config: UniversalGPSConfig) {
    this.config = config;
  }

  // Get authentication headers based on auth type
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    switch (this.config.authType) {
      case 'apikey':
        headers['X-API-Key'] = this.config.credentials.apiKey || '';
        break;
      case 'bearer':
        headers['Authorization'] = `Bearer ${this.config.credentials.token || this.config.credentials.apiKey || ''}`;
        break;
      case 'basic':
        const credentials = Buffer.from(`${this.config.credentials.username || ''}:${this.config.credentials.password || ''}`).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
        break;
      case 'none':
      default:
        // No authentication
        break;
    }

    return headers;
  }

  // Make HTTP request to GPS API
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...this.config.requestHeaders,
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`GPS API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle response wrapper (if data is nested)
      if (this.config.responseWrapper && data[this.config.responseWrapper]) {
        return data[this.config.responseWrapper];
      }

      return data;
    } catch (error) {
      console.error(`GPS API request failed for ${this.config.name}:`, error);
      throw error;
    }
  }

  // Map raw API response to standardized format
  private mapLocationData(rawData: any, defaultVehicleId?: string): GPSLocation | null {
    try {
      const vehicleId = rawData[this.config.dataMapping.vehicleId] || defaultVehicleId;
      const latitude = parseFloat(rawData[this.config.dataMapping.latitude]);
      const longitude = parseFloat(rawData[this.config.dataMapping.longitude]);
      const timestamp = new Date(rawData[this.config.dataMapping.timestamp] || Date.now());

      if (!vehicleId || isNaN(latitude) || isNaN(longitude)) {
        console.warn('Invalid GPS data:', rawData);
        return null;
      }

      return {
        vehicleId,
        latitude,
        longitude,
        timestamp,
        status: this.config.dataMapping.status ? rawData[this.config.dataMapping.status] : undefined,
        speed: this.config.dataMapping.speed ? parseFloat(rawData[this.config.dataMapping.speed]) || 0 : undefined,
        heading: this.config.dataMapping.heading ? parseFloat(rawData[this.config.dataMapping.heading]) || 0 : undefined
      };
    } catch (error) {
      console.error('Error mapping GPS data:', error);
      return null;
    }
  }

  // Get location for a specific vehicle
  async getVehicleLocation(vehicleId: string): Promise<GPSLocation | null> {
    try {
      const endpoint = this.config.endpoints.getVehicleLocation.replace('{vehicleId}', vehicleId);
      const rawData = await this.makeRequest(endpoint);
      
      // Handle single location response
      const locationData = Array.isArray(rawData) ? rawData[0] : rawData;
      return this.mapLocationData(locationData, vehicleId);
    } catch (error) {
      console.error(`Failed to get location for vehicle ${vehicleId}:`, error);
      return null;
    }
  }

  // Get locations for all vehicles in the fleet
  async getFleetLocations(): Promise<GPSLocation[]> {
    try {
      const rawData = await this.makeRequest(this.config.endpoints.getFleetStatus);
      const locations: GPSLocation[] = [];

      // Handle both array and single object responses
      const dataArray = Array.isArray(rawData) ? rawData : [rawData];

      for (const item of dataArray) {
        const location = this.mapLocationData(item);
        if (location) {
          locations.push(location);
        }
      }

      return locations;
    } catch (error) {
      console.error('Failed to get fleet locations:', error);
      return [];
    }
  }

  // Update vehicle location (if supported)
  async updateVehicleLocation(vehicleId: string, latitude: number, longitude: number): Promise<boolean> {
    if (!this.config.endpoints.updateLocation) {
      console.warn('Update location endpoint not configured');
      return false;
    }

    try {
      const endpoint = this.config.endpoints.updateLocation.replace('{vehicleId}', vehicleId);
      const payload = {
        [this.config.dataMapping.vehicleId]: vehicleId,
        [this.config.dataMapping.latitude]: latitude,
        [this.config.dataMapping.longitude]: longitude,
        [this.config.dataMapping.timestamp]: new Date().toISOString()
      };

      await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      return true;
    } catch (error) {
      console.error(`Failed to update location for vehicle ${vehicleId}:`, error);
      return false;
    }
  }

  // Test connection to GPS API
  async testConnection(): Promise<{ success: boolean; message: string; responseTime: number }> {
    const startTime = Date.now();
    
    try {
      // Try to get fleet status as a connection test
      await this.makeRequest(this.config.endpoints.getFleetStatus);
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        message: `Successfully connected to ${this.config.name}`,
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        message: `Failed to connect to ${this.config.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        responseTime
      };
    }
  }

  // Get configuration summary
  getConfigSummary(): { name: string; baseUrl: string; authType: string; endpoints: string[] } {
    return {
      name: this.config.name,
      baseUrl: this.config.baseUrl,
      authType: this.config.authType,
      endpoints: Object.keys(this.config.endpoints)
    };
  }
}

// Predefined configurations for popular GPS providers
export const GPS_PROVIDER_TEMPLATES: Record<string, Partial<UniversalGPSConfig>> = {
  here: {
    name: 'HERE Fleet Telematics',
    baseUrl: 'https://fleet.ls.hereapi.com/2',
    authType: 'apikey',
    endpoints: {
      getVehicleLocation: '/positions/{vehicleId}',
      getFleetStatus: '/positions'
    },
    dataMapping: {
      vehicleId: 'deviceId',
      latitude: 'lat',
      longitude: 'lng',
      timestamp: 'timestamp',
      status: 'status',
      speed: 'speed',
      heading: 'heading'
    },
    responseWrapper: 'position'
  },
  
  samsara: {
    name: 'Samsara Fleet Management',
    baseUrl: 'https://api.samsara.com/v1',
    authType: 'bearer',
    endpoints: {
      getVehicleLocation: '/fleet/vehicles/{vehicleId}/locations',
      getFleetStatus: '/fleet/vehicles/locations'
    },
    dataMapping: {
      vehicleId: 'id',
      latitude: 'latitude',
      longitude: 'longitude',
      timestamp: 'time',
      status: 'vehicleState',
      speed: 'speedMilesPerHour'
    },
    responseWrapper: 'data'
  },

  geotab: {
    name: 'Geotab MyGeotab',
    baseUrl: 'https://my.geotab.com/apiv1',
    authType: 'basic',
    endpoints: {
      getVehicleLocation: '/Get/DeviceStatusInfo?search={{"deviceSearch":{{"id":"{vehicleId}"}}}}',
      getFleetStatus: '/Get/DeviceStatusInfo'
    },
    dataMapping: {
      vehicleId: 'device.id',
      latitude: 'latitude',
      longitude: 'longitude',
      timestamp: 'dateTime',
      speed: 'speed'
    },
    responseWrapper: 'result'
  },

  custom: {
    name: 'Custom GPS API',
    authType: 'apikey',
    endpoints: {
      getVehicleLocation: '/vehicles/{vehicleId}/location',
      getFleetStatus: '/vehicles/locations'
    },
    dataMapping: {
      vehicleId: 'vehicleId',
      latitude: 'lat',
      longitude: 'lng',
      timestamp: 'timestamp',
      status: 'status',
      speed: 'speed',
      heading: 'heading'
    }
  }
};

// Factory function to create GPS connector from template
export function createGPSConnector(template: string, customConfig: Partial<UniversalGPSConfig>): UniversalGPSConnector {
  const templateConfig = GPS_PROVIDER_TEMPLATES[template];
  
  if (!templateConfig) {
    throw new Error(`Unknown GPS provider template: ${template}`);
  }

  const config: UniversalGPSConfig = {
    ...templateConfig,
    ...customConfig,
    endpoints: {
      ...templateConfig.endpoints,
      ...customConfig.endpoints
    },
    dataMapping: {
      ...templateConfig.dataMapping,
      ...customConfig.dataMapping
    }
  } as UniversalGPSConfig;

  return new UniversalGPSConnector(config);
}