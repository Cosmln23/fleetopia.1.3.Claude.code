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

// GPS-related missing types
export interface GeofenceParams {
  name: string;
  coordinates: { lat: number; lng: number }[];
  radius?: number;
  type: 'circle' | 'polygon';
}

export interface Geofence {
  id: string;
  name: string;
  coordinates: { lat: number; lng: number }[];
  radius?: number;
  type: 'circle' | 'polygon';
  isActive: boolean;
}

export interface GPSAlert {
  id: string;
  vehicleId: string;
  type: 'speed' | 'geofence' | 'maintenance' | 'fuel';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  acknowledged: boolean;
}

export interface FuelData {
  vehicleId: string;
  totalConsumption: number;
  averageConsumption: number;
  consumptionHistory: {
    date: Date;
    consumption: number;
    distance: number;
  }[];
}

export interface DriverMetrics {
  driverId: string;
  totalDistance: number;
  avgSpeed: number;
  fuelEfficiency: number;
  safetyScore: number;
  incidents: number;
  period: TimeRange;
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

// Freight-related missing types
export interface CargoOfferPost {
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
  requirements: string[];
}

export interface CargoOfferResponse {
  id: string;
  status: 'posted' | 'failed';
  message?: string;
}

export interface CargoBid {
  id: string;
  cargoId: string;
  bidderId: string;
  price: number;
  proposedDeliveryDate: Date;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface TransportSearchFilters {
  origin?: string;
  destination?: string;
  vehicleType?: string[];
  capacity?: { min?: number; max?: number };
  availableFrom?: Date;
  availableTo?: Date;
  maxPrice?: number;
}

export interface TransportOffer {
  id: string;
  vehicleType: string;
  capacity: number;
  origin: LocationDetails;
  destination: LocationDetails;
  availableFrom: Date;
  availableTo: Date;
  pricePerKm: number;
  company: CompanyDetails;
  equipment: string[];
}

export interface TransportOfferPost {
  vehicleType: string;
  capacity: number;
  origin: LocationDetails;
  destination: LocationDetails;
  availableFrom: Date;
  availableTo: Date;
  pricePerKm: number;
  equipment: string[];
}

export interface TransportOfferResponse {
  id: string;
  status: 'posted' | 'failed';
  message?: string;
}

export interface FreightMessageParams {
  cargoId: string;
  recipientId: string;
  message: string;
  type: 'inquiry' | 'bid' | 'negotiation' | 'confirmation';
}

export interface ContractDetails {
  id: string;
  cargoId: string;
  transporterId: string;
  shipperId: string;
  agreedPrice: number;
  pickupDate: Date;
  deliveryDate: Date;
  terms: string;
  status: 'signed' | 'in_progress' | 'completed' | 'cancelled';
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

export interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  body: string;
  isHTML: boolean;
  attachments?: EmailAttachment[];
  date: Date;
  isRead: boolean;
  threadId?: string;
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number;
  content?: Buffer | string;
  cid?: string;
}

export interface EmailFilters {
  from?: string;
  to?: string;
  subject?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isRead?: boolean;
  hasAttachments?: boolean;
  limit?: number;
  offset?: number;
}

export interface EmailTemplate {
  name: string;
  subject: string;
  body: string;
  isHTML: boolean;
  variables?: string[];
}

export interface SMSParams {
  to: string;
  message: string;
  from?: string;
}

export interface WhatsAppParams {
  to: string;
  message: string;
  type?: 'text' | 'media' | 'document';
  mediaUrl?: string;
}

export interface NotificationParams {
  to: string[];
  title: string;
  body: string;
  icon?: string;
  url?: string;
  data?: Record<string, any>;
}

export interface NotificationTemplate {
  name: string;
  title: string;
  body: string;
  icon?: string;
  variables?: string[];
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

// Weather-related missing types
export interface WeatherForecast {
  location: LocationDetails;
  forecast: {
    date: Date;
    temperature: { min: number; max: number };
    humidity: number;
    windSpeed: number;
    windDirection: number;
    precipitation: number;
    conditions: string;
    icon: string;
  }[];
}

export interface RouteWeatherQuery {
  route: {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    waypoints?: { lat: number; lng: number }[];
  };
  departureTime: Date;
}

export interface RouteWeatherData {
  route: RouteWeatherQuery['route'];
  weatherPoints: {
    location: { lat: number; lng: number };
    weather: WeatherData;
    estimatedTime: Date;
  }[];
  alerts: WeatherAlert[];
}

export interface WeatherAlert {
  id: string;
  type: 'storm' | 'fog' | 'ice' | 'snow' | 'wind' | 'rain';
  severity: 'low' | 'medium' | 'high' | 'extreme';
  title: string;
  description: string;
  affectedArea: {
    coordinates: { lat: number; lng: number }[];
  };
  validFrom: Date;
  validTo: Date;
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

export interface FuelPrices {
  diesel: number;
  gasoline: number;
  lpg?: number;
  cng?: number;
  electric?: number;
}

export interface FuelPriceHistory {
  date: Date;
  dieselPrice: number;
  gasolinePrice: number;
  lpgPrice?: number;
  cngPrice?: number;
}

export interface RouteQuery {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  distance?: number;
}

export interface FuelRecommendation {
  fuelType: FuelType;
  route: RouteQuery;
  recommendedStations: {
    station: FuelStation;
    savingsPerLiter: number;
    totalSavings: number;
    detourDistance: number;
    detourTime: number;
  }[];
  totalPotentialSavings: number;
  averagePriceAlongRoute: number;
  cheapestPrice: number;
  analysis: {
    bestStrategy: string;
    confidenceLevel: number;
    lastUpdated: Date;
  };
}

export interface FuelOptimizationParams {
  vehicleType?: string;
  currentConsumption?: number;
  routeType?: 'highway' | 'city' | 'mixed';
  drivingStyle?: 'eco' | 'normal' | 'aggressive';
  loadWeight?: number;
}

export interface FuelOptimization {
  currentConsumption: number;
  optimizedConsumption: number;
  fuelSavings: {
    litersSaved: number;
    costSaved: number;
    co2Reduced: number;
  };
  recommendations: {
    category: string;
    title: string;
    description: string;
    potentialSaving: number;
  }[];
  implementationPlan: string[];
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
  compatibleModels?: string[];
  setupInstructions?: string[];
  integrationFlow?: string;
  requiredFields?: string[];
  supportedFeatures?: string[];
}

export const API_PROVIDERS: APIProviderConfig[] = [
  // GPS Providers
  {
    category: 'gps',
    provider: 'here',
    name: 'HERE Fleet Telematics',
    description: 'Advanced routing and fleet tracking with real-time GPS positioning',
    tier: 'freemium',
    credentialsRequired: ['apiKey'],
    rateLimit: { requests: 250000, period: 'month' },
    costEstimate: { free: '250K requests/month', paid: 'Pay-as-you-grow' },
    setupComplexity: 'medium',
    documentation: 'https://developer.here.com/documentation/fleet-telematics',
    compatibleModels: [
      'HERE Tracking API v8',
      'HERE Fleet Telematics API',
      'HERE Location Services REST API',
      'Custom HERE SDK implementations'
    ],
    setupInstructions: [
      'Configure your HERE API credentials in the integration form',
      'Connect vehicles in Fleet Management and assign HERE API',
      'Enable GPS tracking toggle for each vehicle',
      'Real-time positions will appear on Maps automatically',
      'Access historical tracking data and analytics in dashboard'
    ],
    integrationFlow: 'API Setup → Vehicle Assignment → Live Tracking → Maps Display',
    requiredFields: ['HERE API Key', 'Application ID', 'Application Code', 'Vehicle device IDs'],
    supportedFeatures: ['Real-time tracking', 'Geofencing', 'Route optimization', 'Historical data', 'Driver analytics']
  },
  {
    category: 'gps',
    provider: 'samsara',
    name: 'Samsara Fleet Management',
    description: 'Complete IoT fleet management with advanced telematics',
    tier: 'enterprise',
    credentialsRequired: ['apiKey', 'token'],
    rateLimit: { requests: 100000, period: 'day' },
    costEstimate: { paid: '$30-60/vehicle/month' },
    setupComplexity: 'easy',
    documentation: 'https://developers.samsara.com/',
    compatibleModels: [
      'Samsara API v1',
      'Samsara Vehicle Gateway (VG)',
      'Samsara Asset Gateway (AG)',
      'Third-party OBD devices with Samsara integration'
    ],
    setupInstructions: [
      'Obtain Samsara API token from your organization dashboard',
      'Configure API credentials in Fleetopia integration settings',
      'Import vehicle list or manually assign vehicles to Samsara devices',
      'Enable GPS tracking for vehicles with installed Samsara hardware',
      'Monitor real-time positions and receive alerts on the Maps page'
    ],
    integrationFlow: 'Hardware Installation → API Configuration → Vehicle Mapping → Live Fleet Tracking',
    requiredFields: ['Samsara API Token', 'Organization ID', 'Vehicle Gateway IDs'],
    supportedFeatures: ['Real-time GPS', 'Driver behavior', 'Fuel monitoring', 'Maintenance alerts', 'Temperature tracking']
  },
  {
    category: 'gps',
    provider: 'geotab',
    name: 'Geotab MyGeotab API',
    description: 'Professional fleet telematics with comprehensive vehicle data',
    tier: 'enterprise',
    credentialsRequired: ['username', 'password', 'database'],
    rateLimit: { requests: 50000, period: 'day' },
    costEstimate: { paid: '$35-45/vehicle/month' },
    setupComplexity: 'medium',
    documentation: 'https://my.geotab.com/api/documentation/',
    compatibleModels: [
      'MyGeotab API v1',
      'Geotab GO devices (GO6, GO7, GO8, GO9)',
      'Third-party devices with Geotab certification',
      'Custom integrations via Geotab SDK'
    ],
    setupInstructions: [
      'Access your MyGeotab database credentials from Geotab portal',
      'Configure database name, username, and password in API settings',
      'Import vehicle and device mappings from your Geotab system',
      'Set up real-time data polling intervals (recommended: 30 seconds)',
      'Enable specific data types: GPS, engine data, driver identification'
    ],
    integrationFlow: 'Geotab Setup → Database Connection → Device Import → Data Polling → Maps Visualization',
    requiredFields: ['MyGeotab Username', 'Password', 'Database Name', 'Device Serial Numbers'],
    supportedFeatures: ['Precise GPS tracking', 'Engine diagnostics', 'Driver identification', 'Fuel consumption', 'Exception reporting']
  },
  {
    category: 'gps',
    provider: 'verizon_connect',
    name: 'Verizon Connect API',
    description: 'Enterprise fleet management with integrated communications',
    tier: 'enterprise',
    credentialsRequired: ['apiKey', 'clientId', 'clientSecret'],
    rateLimit: { requests: 75000, period: 'day' },
    costEstimate: { paid: '$40-65/vehicle/month' },
    setupComplexity: 'medium',
    documentation: 'https://developer.verizonconnect.com/',
    compatibleModels: [
      'Verizon Connect API v3',
      'Networkfleet API',
      'Verizon Connect Mobile devices',
      'Integrated OBD-II solutions'
    ],
    setupInstructions: [
      'Generate API credentials from Verizon Connect developer portal',
      'Configure OAuth 2.0 authentication with client credentials',
      'Map your fleet vehicles to Verizon Connect device IDs',
      'Set up webhook endpoints for real-time event notifications',
      'Configure data refresh intervals and alert thresholds'
    ],
    integrationFlow: 'OAuth Setup → Fleet Import → Device Mapping → Webhook Configuration → Real-time Monitoring',
    requiredFields: ['Client ID', 'Client Secret', 'API Key', 'Device Asset IDs'],
    supportedFeatures: ['Real-time location', 'Route replay', 'Geofence alerts', 'Driver scoring', 'Maintenance scheduling']
  },
  {
    category: 'gps',
    provider: 'fleet_complete',
    name: 'Fleet Complete API',
    description: 'Comprehensive fleet tracking with asset management',
    tier: 'enterprise',
    credentialsRequired: ['apiKey', 'username', 'password'],
    rateLimit: { requests: 60000, period: 'day' },
    costEstimate: { paid: '$25-50/vehicle/month' },
    setupComplexity: 'easy',
    documentation: 'https://developer.fleetcomplete.com/',
    compatibleModels: [
      'Fleet Complete REST API v2',
      'Fleet Complete tracking devices',
      'Mobile app integrations',
      'Third-party GPS hardware with Fleet Complete support'
    ],
    setupInstructions: [
      'Request API access from Fleet Complete customer support',
      'Configure API key and login credentials in integration settings',
      'Import existing vehicle and driver data from Fleet Complete',
      'Enable real-time tracking for selected vehicles',
      'Set up automated data synchronization every 30 seconds'
    ],
    integrationFlow: 'API Access Request → Credentials Setup → Data Import → Real-time Sync → Fleet Visualization',
    requiredFields: ['API Key', 'Username', 'Password', 'Vehicle Asset IDs'],
    supportedFeatures: ['Live GPS tracking', 'Asset management', 'Driver behavior', 'Fuel management', 'Maintenance alerts']
  },
  {
    category: 'gps',
    provider: 'tomtom',
    name: 'TomTom Fleet Management',
    description: 'Professional fleet tracking with advanced mapping technology',
    tier: 'paid',
    credentialsRequired: ['apiKey'],
    rateLimit: { requests: 50000, period: 'day' },
    costEstimate: { paid: '€24-240/month' },
    setupComplexity: 'medium',
    documentation: 'https://developer.tomtom.com/fleet-management-api',
    compatibleModels: [
      'TomTom Maps API',
      'TomTom Tracking API',
      'TomTom Fleet Management Platform',
      'TomTom PRO navigation devices'
    ],
    setupInstructions: [
      'Obtain TomTom API key from developer portal',
      'Configure API key in Fleetopia GPS integration settings',
      'Set up vehicle profiles with TomTom device identifiers',
      'Enable location tracking and configure update frequency',
      'Implement geofence and route optimization features'
    ],
    integrationFlow: 'Developer Account → API Key → Vehicle Setup → Location Tracking → Route Optimization',
    requiredFields: ['TomTom API Key', 'Application Name', 'Vehicle Device IDs'],
    supportedFeatures: ['Real-time tracking', 'Traffic integration', 'Route planning', 'Geofencing', 'Map visualization']
  },
  {
    category: 'gps',
    provider: 'custom',
    name: 'Custom GPS API',
    description: 'Universal adapter for any GPS tracking system with REST API',
    tier: 'free',
    credentialsRequired: ['baseUrl', 'apiKey'],
    rateLimit: { requests: 10000, period: 'day' },
    costEstimate: { free: 'Depends on your GPS provider' },
    setupComplexity: 'hard',
    documentation: '/docs/custom-gps-integration',
    compatibleModels: [
      'Any REST API returning GPS coordinates',
      'Custom tracking hardware with API',
      'Fleet management systems with webhook support',
      'OBD-II devices with cloud connectivity'
    ],
    setupInstructions: [
      'Prepare your GPS API endpoint that returns vehicle locations',
      'Ensure API returns data in format: {vehicleId, lat, lng, timestamp, status}',
      'Configure base URL and authentication in custom integration form',
      'Map your vehicle IDs to Fleetopia vehicle records',
      'Test API connection and verify data format compatibility'
    ],
    integrationFlow: 'API Preparation → Endpoint Configuration → Data Format Mapping → Connection Testing → Live Integration',
    requiredFields: ['API Base URL', 'Authentication Method', 'Vehicle ID Mapping', 'Data Format Schema'],
    supportedFeatures: ['Flexible integration', 'Custom data mapping', 'Webhook support', 'Real-time polling', 'Error handling']
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
