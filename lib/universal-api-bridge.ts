// Universal API Bridge System - Fleetopia Core
// Allows clients to bring their own APIs while maintaining standard interface

export interface APICredentials {
  apiKey?: string;
  token?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  additionalConfig?: Record<string, any>;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  rateLimitRemaining?: number;
  responseTime: number;
  provider: string;
}

// ===== UNIVERSAL GPS/TRACKING INTERFACE =====
export interface UniversalGPSAPI {
  // Vehicle tracking
  getVehicleLocation(vehicleId: string): Promise<APIResponse<VehicleLocation>>;
  getFleetStatus(): Promise<APIResponse<VehicleLocation[]>>;
  trackRoute(params: RouteTrackingParams): Promise<APIResponse<RouteProgress>>;
  
  // Geofencing & alerts
  createGeofence(params: GeofenceParams): Promise<APIResponse<Geofence>>;
  getVehicleAlerts(vehicleId: string): Promise<APIResponse<GPSAlert[]>>;
  
  // Performance metrics
  getFuelConsumption(vehicleId: string, timeRange: TimeRange): Promise<APIResponse<FuelData>>;
  getDriverBehavior(driverId: string, timeRange: TimeRange): Promise<APIResponse<DriverMetrics>>;
}

export interface VehicleLocation {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: Date;
  status: 'moving' | 'stopped' | 'idle' | 'offline';
  address?: string;
  odometer?: number;
}

export interface RouteTrackingParams {
  vehicleId: string;
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  waypoints?: { lat: number; lng: number }[];
}

export interface RouteProgress {
  vehicleId: string;
  currentLocation: VehicleLocation;
  distanceRemaining: number;
  estimatedArrival: Date;
  routeDeviation: boolean;
  trafficDelay: number;
}

// ===== UNIVERSAL FREIGHT EXCHANGE INTERFACE =====
export interface UniversalFreightAPI {
  // Cargo search & management
  searchCargo(filters: CargoSearchFilters): Promise<APIResponse<CargoOffer[]>>;
  postCargoOffer(cargo: CargoOfferPost): Promise<APIResponse<CargoOfferResponse>>;
  getCargoBids(cargoId: string): Promise<APIResponse<CargoBid[]>>;
  
  // Transport offers
  searchTransport(filters: TransportSearchFilters): Promise<APIResponse<TransportOffer[]>>;
  postTransportOffer(transport: TransportOfferPost): Promise<APIResponse<TransportOfferResponse>>;
  
  // Communication & negotiation
  sendMessage(params: FreightMessageParams): Promise<APIResponse<void>>;
  acceptBid(bidId: string): Promise<APIResponse<ContractDetails>>;
  updateCargoStatus(cargoId: string, status: CargoStatus): Promise<APIResponse<void>>;
}

export interface CargoSearchFilters {
  origin?: string;
  destination?: string;
  weight?: { min?: number; max?: number };
  loadingDate?: { from?: Date; to?: Date };
  cargoType?: string[];
  maxDistance?: number;
}

export interface CargoOffer {
  id: string;
  title: string;
  origin: LocationDetails;
  destination: LocationDetails;
  weight: number;
  volume?: number;
  cargoType: string;
  loadingDate: Date;
  deliveryDate: Date;
  price: number;
  currency: string;
  company: CompanyDetails;
  requirements: string[];
  status: CargoStatus;
}

// ===== UNIVERSAL COMMUNICATION INTERFACE =====
export interface UniversalCommunicationAPI {
  // Email management
  sendEmail(params: EmailParams): Promise<APIResponse<void>>;
  getEmails(filters: EmailFilters): Promise<APIResponse<EmailMessage[]>>;
  createEmailTemplate(template: EmailTemplate): Promise<APIResponse<string>>;
  
  // SMS/WhatsApp
  sendSMS(params: SMSParams): Promise<APIResponse<void>>;
  sendWhatsApp(params: WhatsAppParams): Promise<APIResponse<void>>;
  
  // Notifications
  sendPushNotification(params: NotificationParams): Promise<APIResponse<void>>;
  createNotificationTemplate(template: NotificationTemplate): Promise<APIResponse<string>>;
}

export interface EmailParams {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  isHTML?: boolean;
  attachments?: EmailAttachment[];
  templateId?: string;
  variables?: Record<string, string>;
}

// ===== UNIVERSAL WEATHER INTERFACE =====
export interface UniversalWeatherAPI {
  getCurrentWeather(location: LocationQuery): Promise<APIResponse<WeatherData>>;
  getWeatherForecast(location: LocationQuery, days: number): Promise<APIResponse<WeatherForecast>>;
  getRouteWeather(route: RouteWeatherQuery): Promise<APIResponse<RouteWeatherData>>;
  getWeatherAlerts(location: LocationQuery): Promise<APIResponse<WeatherAlert[]>>;
}

export interface WeatherData {
  location: LocationDetails;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  precipitation: number;
  conditions: string;
  icon: string;
  timestamp: Date;
}

// ===== UNIVERSAL FUEL INTERFACE =====
export interface UniversalFuelAPI {
  getFuelPrices(location: LocationQuery, radius?: number): Promise<APIResponse<FuelStation[]>>;
  getFuelPriceHistory(stationId: string, days: number): Promise<APIResponse<FuelPriceHistory[]>>;
  findCheapestFuel(route: RouteQuery, fuelType: FuelType): Promise<APIResponse<FuelRecommendation>>;
  getFuelConsumptionOptimization(params: FuelOptimizationParams): Promise<APIResponse<FuelOptimization>>;
}

export interface FuelStation {
  id: string;
  name: string;
  brand: string;
  location: LocationDetails;
  prices: FuelPrices;
  amenities: string[];
  isOpen: boolean;
  distance: number;
  lastUpdated: Date;
}

// ===== SUPPORT TYPES =====
export type CargoStatus = 'NEW' | 'TAKEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
export type FuelType = 'diesel' | 'gasoline' | 'lpg' | 'cng' | 'electric';

export interface LocationDetails {
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
}

export interface CompanyDetails {
  id: string;
  name: string;
  rating: number;
  verified: boolean;
  contactEmail?: string;
  contactPhone?: string;
}

export interface TimeRange {
  from: Date;
  to: Date;
}

export interface LocationQuery {
  address?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
}

// ===== API PROVIDER REGISTRY =====
export interface APIProviderConfig {
  category: 'gps' | 'freight' | 'communication' | 'weather' | 'fuel';
  provider: string;
  name: string;
  description: string;
  tier: 'free' | 'freemium' | 'paid' | 'enterprise';
  credentialsRequired: string[];
  rateLimit?: {
    requests: number;
    period: 'minute' | 'hour' | 'day' | 'month';
  };
  costEstimate?: {
    free?: string;
    paid?: string;
  };
  setupComplexity: 'easy' | 'medium' | 'hard';
  documentation?: string;
}

export const API_PROVIDERS: APIProviderConfig[] = [
  // GPS Providers
  {
    category: 'gps',
    provider: 'tomtom',
    name: 'TomTom Fleet Management',
    description: 'Professional fleet tracking and management',
    tier: 'paid',
    credentialsRequired: ['apiKey'],
    rateLimit: { requests: 50000, period: 'day' },
    costEstimate: { paid: '€24-240/month' },
    setupComplexity: 'medium',
    documentation: 'https://developer.tomtom.com/fleet-management-api'
  },
  {
    category: 'gps',
    provider: 'here',
    name: 'HERE Fleet Telematics',
    description: 'Advanced routing and fleet tracking',
    tier: 'freemium',
    credentialsRequired: ['apiKey'],
    rateLimit: { requests: 250000, period: 'month' },
    costEstimate: { free: '250K requests/month', paid: 'Pay-as-you-grow' },
    setupComplexity: 'medium',
    documentation: 'https://developer.here.com/documentation/fleet-telematics'
  },
  
  // Freight Providers
  {
    category: 'freight',
    provider: 'trans_eu',
    name: 'Trans.eu API',
    description: 'European freight exchange platform',
    tier: 'enterprise',
    credentialsRequired: ['apiKey', 'token'],
    setupComplexity: 'medium',
    costEstimate: { paid: 'Contact for pricing' },
    documentation: 'https://trans.eu/API'
  },
  {
    category: 'freight',
    provider: 'timocom',
    name: 'TimoCom API',
    description: 'Largest European freight network',
    tier: 'enterprise',
    credentialsRequired: ['clientId', 'clientSecret'],
    setupComplexity: 'hard',
    costEstimate: { paid: 'Contact for pricing' },
    documentation: 'https://www.timocom.com/en/api'
  },
  
  // Communication Providers (FREE)
  {
    category: 'communication',
    provider: 'gmail',
    name: 'Gmail API',
    description: 'Google email integration',
    tier: 'free',
    credentialsRequired: ['clientId', 'clientSecret', 'refreshToken'],
    rateLimit: { requests: 1000, period: 'day' },
    costEstimate: { free: 'Unlimited with Google Workspace' },
    setupComplexity: 'medium',
    documentation: 'https://developers.google.com/gmail/api'
  },
  {
    category: 'communication',
    provider: 'outlook',
    name: 'Microsoft Graph API',
    description: 'Outlook email integration',
    tier: 'free',
    credentialsRequired: ['clientId', 'clientSecret', 'refreshToken'],
    rateLimit: { requests: 10000, period: 'hour' },
    costEstimate: { free: 'Included with Microsoft 365' },
    setupComplexity: 'easy',
    documentation: 'https://docs.microsoft.com/en-us/graph/api/resources/mail-api-overview'
  },
  
  // Weather Providers (FREE)
  {
    category: 'weather',
    provider: 'google_weather',
    name: 'Google Weather API',
    description: 'Basic weather data for routes',
    tier: 'freemium',
    credentialsRequired: ['apiKey'],
    rateLimit: { requests: 10000, period: 'month' },
    costEstimate: { free: '10K requests/month', paid: '$0.15/1K calls' },
    setupComplexity: 'easy',
    documentation: 'https://developers.google.com/maps/documentation/weather'
  },
  {
    category: 'weather',
    provider: 'openweathermap',
    name: 'OpenWeatherMap',
    description: 'Comprehensive weather data',
    tier: 'freemium',
    credentialsRequired: ['apiKey'],
    rateLimit: { requests: 60, period: 'minute' },
    costEstimate: { free: '1K requests/day', paid: '€40-400/month' },
    setupComplexity: 'easy',
    documentation: 'https://openweathermap.org/api'
  },
  
  // Fuel Providers (CHEAP)
  {
    category: 'fuel',
    provider: 'fuel_basic',
    name: 'Basic Fuel Prices',
    description: 'European fuel station pricing',
    tier: 'freemium',
    credentialsRequired: ['apiKey'],
    rateLimit: { requests: 1000, period: 'day' },
    costEstimate: { free: '100 requests/day', paid: '€10-50/month' },
    setupComplexity: 'easy'
  },
  {
    category: 'fuel',
    provider: 'dkv',
    name: 'DKV Fuel Network',
    description: '70,000+ European stations',
    tier: 'enterprise',
    credentialsRequired: ['clientId', 'clientSecret', 'merchantId'],
    setupComplexity: 'hard',
    costEstimate: { paid: 'Transaction fees + API costs' },
    documentation: 'https://www.dkv-euroservice.com/en/api'
  }
];

// Registry for managing API instances
export class APIProviderRegistry {
  private static providers = new Map<string, any>();
  
  static registerProvider(category: string, provider: string, instance: any) {
    const key = `${category}_${provider}`;
    this.providers.set(key, instance);
  }
  
  static getProvider<T>(category: string, provider: string): T | null {
    const key = `${category}_${provider}`;
    return this.providers.get(key) || null;
  }
  
  static getAvailableProviders(category: string): APIProviderConfig[] {
    return API_PROVIDERS.filter(p => p.category === category);
  }
  
  static isProviderConfigured(category: string, provider: string): boolean {
    const key = `${category}_${provider}`;
    return this.providers.has(key);
  }
}