// Universal API Manager - Central hub for all API integrations
import { 
  UniversalGPSAPI, 
  UniversalFreightAPI, 
  UniversalCommunicationAPI, 
  UniversalWeatherAPI, 
  UniversalFuelAPI,
  APIProviderRegistry,
  APICredentials,
  APIResponse,
  API_PROVIDERS
} from './universal-api-bridge';

// Import adapters
import { GmailAdapter } from './adapters/gmail-adapter';
import { GoogleWeatherAdapter } from './adapters/google-weather-adapter';
import { BasicFuelAdapter } from './adapters/basic-fuel-adapter';

export interface ClientAPIConfiguration {
  userId: string;
  gps?: {
    provider: string;
    credentials: APICredentials;
    isActive: boolean;
  };
  freight?: {
    provider: string;
    credentials: APICredentials;
    isActive: boolean;
  };
  communication?: {
    provider: string;
    credentials: APICredentials;
    isActive: boolean;
  };
  weather?: {
    provider: string;
    credentials: APICredentials;
    isActive: boolean;
  };
  fuel?: {
    provider: string;
    credentials: APICredentials;
    isActive: boolean;
  };
}

export class UniversalAPIManager {
  private static instance: UniversalAPIManager;
  private configurations = new Map<string, ClientAPIConfiguration>();

  private constructor() {
    // Initialize built-in free adapters
    this.initializeBuiltInAdapters();
  }

  static getInstance(): UniversalAPIManager {
    if (!UniversalAPIManager.instance) {
      UniversalAPIManager.instance = new UniversalAPIManager();
    }
    return UniversalAPIManager.instance;
  }

  // ===== CONFIGURATION MANAGEMENT =====
  
  async configureClientAPIs(userId: string, config: Partial<ClientAPIConfiguration>): Promise<void> {
    const existingConfig = this.configurations.get(userId) || { userId };
    const newConfig = { ...existingConfig, ...config };
    
    // Initialize adapters for each configured API
    if (config.communication) {
      await this.initializeCommunicationAdapter(userId, config.communication);
    }
    
    if (config.weather) {
      await this.initializeWeatherAdapter(userId, config.weather);
    }
    
    if (config.fuel) {
      await this.initializeFuelAdapter(userId, config.fuel);
    }
    
    if (config.gps) {
      await this.initializeGPSAdapter(userId, config.gps);
    }
    
    if (config.freight) {
      await this.initializeFreightAdapter(userId, config.freight);
    }
    
    this.configurations.set(userId, newConfig);
  }

  getClientConfiguration(userId: string): ClientAPIConfiguration | null {
    return this.configurations.get(userId) || null;
  }

  // ===== UNIVERSAL API ACCESS =====
  
  getGPSAPI(userId: string): UniversalGPSAPI | null {
    const config = this.configurations.get(userId);
    if (!config?.gps?.isActive) return null;
    
    return APIProviderRegistry.getProvider<UniversalGPSAPI>('gps', config.gps.provider);
  }

  getFreightAPI(userId: string): UniversalFreightAPI | null {
    const config = this.configurations.get(userId);
    if (!config?.freight?.isActive) return null;
    
    return APIProviderRegistry.getProvider<UniversalFreightAPI>('freight', config.freight.provider);
  }

  getCommunicationAPI(userId: string): UniversalCommunicationAPI | null {
    const config = this.configurations.get(userId);
    if (!config?.communication?.isActive) return null;
    
    return APIProviderRegistry.getProvider<UniversalCommunicationAPI>('communication', config.communication.provider);
  }

  getWeatherAPI(userId: string): UniversalWeatherAPI | null {
    const config = this.configurations.get(userId);
    
    // Always return built-in weather API as fallback
    if (!config?.weather?.isActive) {
      return APIProviderRegistry.getProvider<UniversalWeatherAPI>('weather', 'google_weather');
    }
    
    return APIProviderRegistry.getProvider<UniversalWeatherAPI>('weather', config.weather.provider);
  }

  getFuelAPI(userId: string): UniversalFuelAPI | null {
    const config = this.configurations.get(userId);
    
    // Always return built-in fuel API as fallback
    if (!config?.fuel?.isActive) {
      return APIProviderRegistry.getProvider<UniversalFuelAPI>('fuel', 'fuel_basic');
    }
    
    return APIProviderRegistry.getProvider<UniversalFuelAPI>('fuel', config.fuel.provider);
  }

  // ===== ADAPTER INITIALIZATION =====
  
  private async initializeBuiltInAdapters(): Promise<void> {
    // Register built-in free adapters with dummy credentials
    // These will be replaced when clients configure their own APIs
    
    try {
      // Gmail adapter (requires user OAuth)
      const gmailAdapter = new GmailAdapter({ 
        clientId: 'built-in',
        clientSecret: 'built-in',
        refreshToken: 'built-in'
      });
      APIProviderRegistry.registerProvider('communication', 'gmail', gmailAdapter);

      // Google Weather adapter (requires API key)
      const weatherAdapter = new GoogleWeatherAdapter({ 
        apiKey: process.env.GOOGLE_MAPS_API_KEY || 'demo-key'
      });
      APIProviderRegistry.registerProvider('weather', 'google_weather', weatherAdapter);

      // Basic Fuel adapter
      const fuelAdapter = new BasicFuelAdapter({ 
        apiKey: 'built-in-fuel-api'
      });
      APIProviderRegistry.registerProvider('fuel', 'fuel_basic', fuelAdapter);

    } catch (error) {
      console.error('Error initializing built-in adapters:', error);
    }
  }

  private async initializeCommunicationAdapter(userId: string, config: { provider: string; credentials: APICredentials }): Promise<void> {
    try {
      switch (config.provider) {
        case 'gmail':
          const gmailAdapter = new GmailAdapter(config.credentials);
          APIProviderRegistry.registerProvider('communication', `${config.provider}_${userId}`, gmailAdapter);
          break;
          
        case 'outlook':
          // TODO: Implement OutlookAdapter
          break;
          
        default:
          throw new Error(`Unknown communication provider: ${config.provider}`);
      }
    } catch (error) {
      console.error(`Error initializing ${config.provider} adapter for user ${userId}:`, error);
      throw error;
    }
  }

  private async initializeWeatherAdapter(userId: string, config: { provider: string; credentials: APICredentials }): Promise<void> {
    try {
      switch (config.provider) {
        case 'google_weather':
          const weatherAdapter = new GoogleWeatherAdapter(config.credentials);
          APIProviderRegistry.registerProvider('weather', `${config.provider}_${userId}`, weatherAdapter);
          break;
          
        case 'openweathermap':
          // TODO: Implement OpenWeatherMapAdapter
          break;
          
        default:
          throw new Error(`Unknown weather provider: ${config.provider}`);
      }
    } catch (error) {
      console.error(`Error initializing ${config.provider} adapter for user ${userId}:`, error);
      throw error;
    }
  }

  private async initializeFuelAdapter(userId: string, config: { provider: string; credentials: APICredentials }): Promise<void> {
    try {
      switch (config.provider) {
        case 'fuel_basic':
          const fuelAdapter = new BasicFuelAdapter(config.credentials);
          APIProviderRegistry.registerProvider('fuel', `${config.provider}_${userId}`, fuelAdapter);
          break;
          
        case 'dkv':
          // TODO: Implement DKVAdapter
          break;
          
        default:
          throw new Error(`Unknown fuel provider: ${config.provider}`);
      }
    } catch (error) {
      console.error(`Error initializing ${config.provider} adapter for user ${userId}:`, error);
      throw error;
    }
  }

  private async initializeGPSAdapter(userId: string, config: { provider: string; credentials: APICredentials }): Promise<void> {
    try {
      switch (config.provider) {
        case 'tomtom':
          // TODO: Implement TomTomAdapter
          break;
          
        case 'here':
          // TODO: Implement HereAdapter
          break;
          
        default:
          throw new Error(`Unknown GPS provider: ${config.provider}`);
      }
    } catch (error) {
      console.error(`Error initializing ${config.provider} adapter for user ${userId}:`, error);
      throw error;
    }
  }

  private async initializeFreightAdapter(userId: string, config: { provider: string; credentials: APICredentials }): Promise<void> {
    try {
      switch (config.provider) {
        case 'trans_eu':
          // TODO: Implement TransEuAdapter
          break;
          
        case 'timocom':
          // TODO: Implement TimocomAdapter
          break;
          
        default:
          throw new Error(`Unknown freight provider: ${config.provider}`);
      }
    } catch (error) {
      console.error(`Error initializing ${config.provider} adapter for user ${userId}:`, error);
      throw error;
    }
  }

  // ===== HEALTH & MONITORING =====
  
  async testClientAPIs(userId: string): Promise<{ [category: string]: APIResponse<any> }> {
    const results: { [category: string]: APIResponse<any> } = {};
    const config = this.configurations.get(userId);
    
    if (!config) {
      return { error: { success: false, error: 'No configuration found', responseTime: 0, provider: 'none' } };
    }

    // Test each configured API
    if (config.communication?.isActive) {
      const comm = this.getCommunicationAPI(userId);
      if (comm) {
        try {
          // Simple test - try to get emails (this might fail if not properly configured)
          results.communication = await comm.getEmails({ limit: 1 });
        } catch (error) {
          results.communication = { 
            success: false, 
            error: 'Communication API test failed', 
            responseTime: 0, 
            provider: config.communication.provider 
          };
        }
      }
    }

    if (config.weather?.isActive) {
      const weather = this.getWeatherAPI(userId);
      if (weather) {
        try {
          results.weather = await weather.getCurrentWeather({ city: 'London', country: 'UK' });
        } catch (error) {
          results.weather = { 
            success: false, 
            error: 'Weather API test failed', 
            responseTime: 0, 
            provider: config.weather.provider 
          };
        }
      }
    }

    if (config.fuel?.isActive) {
      const fuel = this.getFuelAPI(userId);
      if (fuel) {
        try {
          results.fuel = await fuel.getFuelPrices({ city: 'Berlin', country: 'Germany' }, 10);
        } catch (error) {
          results.fuel = { 
            success: false, 
            error: 'Fuel API test failed', 
            responseTime: 0, 
            provider: config.fuel.provider 
          };
        }
      }
    }

    return results;
  }

  // ===== AVAILABLE PROVIDERS =====
  
  getAvailableProviders(category: string): any[] {
    return API_PROVIDERS.filter(p => p.category === category);
  }

  getProviderInfo(category: string, provider: string): any | null {
    return API_PROVIDERS.find(p => p.category === category && p.provider === provider) || null;
  }

  // ===== AI AGENT INTEGRATION =====
  
  async executeAIQuery(userId: string, query: AIAPIQuery): Promise<APIResponse<any>> {
    try {
      switch (query.category) {
        case 'gps':
          const gps = this.getGPSAPI(userId);
          return gps ? await this.executeGPSQuery(gps, query) : this.createNoProviderResponse('GPS');
          
        case 'freight':
          const freight = this.getFreightAPI(userId);
          return freight ? await this.executeFreightQuery(freight, query) : this.createNoProviderResponse('Freight');
          
        case 'communication':
          const comm = this.getCommunicationAPI(userId);
          return comm ? await this.executeCommunicationQuery(comm, query) : this.createNoProviderResponse('Communication');
          
        case 'weather':
          const weather = this.getWeatherAPI(userId);
          return weather ? await this.executeWeatherQuery(weather, query) : this.createNoProviderResponse('Weather');
          
        case 'fuel':
          const fuel = this.getFuelAPI(userId);
          return fuel ? await this.executeFuelQuery(fuel, query) : this.createNoProviderResponse('Fuel');
          
        default:
          return { success: false, error: 'Unknown query category', responseTime: 0, provider: 'none' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Query execution failed', 
        responseTime: 0, 
        provider: 'error' 
      };
    }
  }

  private async executeGPSQuery(api: UniversalGPSAPI, query: AIAPIQuery): Promise<APIResponse<any>> {
    switch (query.action) {
      case 'getVehicleLocation':
        return await api.getVehicleLocation(query.params.vehicleId);
      case 'getFleetStatus':
        return await api.getFleetStatus();
      case 'trackRoute':
        return await api.trackRoute(query.params);
      default:
        return { success: false, error: 'Unknown GPS action', responseTime: 0, provider: 'gps' };
    }
  }

  private async executeWeatherQuery(api: UniversalWeatherAPI, query: AIAPIQuery): Promise<APIResponse<any>> {
    switch (query.action) {
      case 'getCurrentWeather':
        return await api.getCurrentWeather(query.params);
      case 'getWeatherForecast':
        return await api.getWeatherForecast(query.params.location, query.params.days);
      case 'getRouteWeather':
        return await api.getRouteWeather(query.params);
      default:
        return { success: false, error: 'Unknown weather action', responseTime: 0, provider: 'weather' };
    }
  }

  private async executeFuelQuery(api: UniversalFuelAPI, query: AIAPIQuery): Promise<APIResponse<any>> {
    switch (query.action) {
      case 'getFuelPrices':
        return await api.getFuelPrices(query.params.location, query.params.radius);
      case 'findCheapestFuel':
        return await api.findCheapestFuel(query.params.route, query.params.fuelType);
      default:
        return { success: false, error: 'Unknown fuel action', responseTime: 0, provider: 'fuel' };
    }
  }

  private async executeCommunicationQuery(api: UniversalCommunicationAPI, query: AIAPIQuery): Promise<APIResponse<any>> {
    switch (query.action) {
      case 'sendEmail':
        return await api.sendEmail(query.params);
      case 'getEmails':
        return await api.getEmails(query.params);
      default:
        return { success: false, error: 'Unknown communication action', responseTime: 0, provider: 'communication' };
    }
  }

  private async executeFreightQuery(api: UniversalFreightAPI, query: AIAPIQuery): Promise<APIResponse<any>> {
    switch (query.action) {
      case 'searchCargo':
        return await api.searchCargo(query.params);
      case 'postCargoOffer':
        return await api.postCargoOffer(query.params);
      default:
        return { success: false, error: 'Unknown freight action', responseTime: 0, provider: 'freight' };
    }
  }

  private createNoProviderResponse(category: string): APIResponse<any> {
    return {
      success: false,
      error: `No ${category} provider configured. Please configure an API provider first.`,
      responseTime: 0,
      provider: 'none'
    };
  }
}

// AI Agent query interface
interface AIAPIQuery {
  category: 'gps' | 'freight' | 'communication' | 'weather' | 'fuel';
  action: string;
  params: any;
}

// Export singleton instance
export const apiManager = UniversalAPIManager.getInstance();