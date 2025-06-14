// Fleetopia.co - Self-Evolving AI Marketplace for Transport Paradise
// Digital Tree Architecture with Standard Protocol Implementation

// ENUMS
export enum TreeLayer {
  ROOTS = 'ROOTS',       // Infrastructure core
  TRUNK = 'TRUNK',       // AI Marketplace & Protocol
  BRANCHES = 'BRANCHES', // AI Agents specialized
  LEAVES = 'LEAVES',     // Simple interfaces
  FRUITS = 'FRUITS'      // Happy users
}

export enum EvolutionStatus {
  LEARNING = 'LEARNING',
  EVOLVING = 'EVOLVING',
  STABLE = 'STABLE',
  OPTIMIZING = 'OPTIMIZING',
  DORMANT = 'DORMANT'
}

export enum ProtocolCompliance {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  PENDING = 'PENDING',
  FAILED = 'FAILED'
}

// CORE AI AGENT INTERFACE - Enhanced with Self-Evolution & Digital Tree
export interface AIAgent {
  id: string;
  name: string;
  type: string;
  category: string;
  supervisorType?: string;
  description: string;
  version: string;
  status: string;
  performance: number;
  revenue: number;
  revenueGenerated: number;
  performanceScore: number;
  requests: number;
  successRate: number;
  avgResponseTime: number;
  capabilities?: any[];
  apiEndpoint?: string;
  apiConfig?: any;
  supervisorId?: string;
  isActive: boolean;
  lastActiveAt: Date;
  
  // SELF-EVOLVING AI ARCHITECTURE
  evolutionCycle: number;
  evolutionStatus: EvolutionStatus;
  lastEvolution?: Date;
  nextEvolution?: Date;
  goalInput?: any;            // Goal-in paradigm
  actionsOutput?: any;        // Actions-out paradigm
  learningData?: any;         // Daily learning accumulation
  codeVersion: string;
  selfModifications?: any;    // AI self-modifications log
  
  // DIGITAL TREE METAPHOR
  treeLayer: TreeLayer;
  parentAgentId?: string;     // Tree hierarchy
  treeDepth: number;
  branchWeight: number;
  
  // STANDARD PROTOCOL IMPLEMENTATION
  protocolCompliance: ProtocolCompliance;
  confidenceScore: number;    // 0.0-1.0
  standardInput?: any;        // Standardized input format
  standardOutput?: any;       // Standardized output format
  dataContribution?: any;     // Data given back to system
  transparencyLog?: any;      // Calculation transparency
  
  // AGENTIC WEB INTEGRATION (MCP)
  mcpEndpoint?: string;       // Model Context Protocol endpoint
  mcpCapabilities?: any;      // MCP capabilities declaration
  agentOrchestration?: any;   // Cross-system orchestration data
  usbcCompatibility: boolean; // "USB-C of AI agents"
  
  // MICROSERVICES SIMULATION
  grpcEndpoint?: string;      // gRPC service endpoint
  messageQueue?: string;      // RabbitMQ queue name
  kafkaTopics?: any;          // Kafka streaming topics
  elasticsearchIndex?: string; // Elasticsearch index
  
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  supervisor?: AIAgent;
  subordinates?: AIAgent[];
  parentAgent?: AIAgent;
  childAgents?: AIAgent[];
  transactions?: Transaction[];
  performanceLogs?: AgentPerformanceLog[];
  revenueLogs?: AgentRevenueLog[];
  supervisorTasks?: SupervisorTask[];
  evolutionLogs?: EvolutionLog[];
  protocolValidations?: ProtocolValidation[];
  digitalTwins?: DigitalTwin[];
}

// SELF-EVOLVING AI LOGS
export interface EvolutionLog {
  id: string;
  agentId: string;
  evolutionCycle: number;
  timestamp: Date;
  
  // Evolution details
  previousVersion: string;
  newVersion: string;
  modifications: any;     // What changed
  performance: any;       // Performance metrics
  learningGains: any;     // What was learned
  goalAchievement: number; // Goal achievement score
  
  agent?: AIAgent;
}

// DIGITAL TWIN IMPLEMENTATION
export interface DigitalTwin {
  id: string;
  agentId: string;
  twinType: string;       // "performance", "behavior", "learning"
  twinData: any;          // Twin state data
  lastSync: Date;
  accuracy: number;
  
  agent?: AIAgent;
}

// PROTOCOL VALIDATION SYSTEM
export interface ProtocolValidation {
  id: string;
  agentId: string;
  timestamp: Date;
  
  // Validation results
  inputValid: boolean;
  outputValid: boolean;
  confidenceValid: boolean;
  transparencyValid: boolean;
  dataContributed: boolean;
  
  // Validation details
  validationScore: number; // Overall validation score
  errors?: any;           // Validation errors
  warnings?: any;         // Validation warnings
  
  agent?: AIAgent;
}

// ENHANCED PERFORMANCE LOGGING
export interface AgentPerformanceLog {
  id: string;
  agentId: string;
  metric: string;
  value: number;
  timestamp: Date;
  metadata?: any;
  source?: string;
  
  // Enhanced fields
  treeLayerImpact?: number;    // Impact on tree layer
  evolutionContrib?: number;   // Contribution to evolution
  protocolCompliance?: number; // Protocol compliance score
  
  agent?: AIAgent;
}

// ENHANCED REVENUE LOGGING
export interface AgentRevenueLog {
  id: string;
  agentId: string;
  amount: number;
  source: string;
  timestamp: Date;
  metadata?: any;
  clientId?: string;
  
  // Enhanced fields
  treeLayerSource?: TreeLayer; // Which tree layer generated revenue
  confidenceImpact?: number;   // Revenue impact on confidence
  marketplaceShare?: number;   // Share contributed to marketplace
  
  agent?: AIAgent;
}

// ENHANCED SUPERVISOR TASKS
export interface SupervisorTask {
  id: string;
  supervisorId: string;
  taskType: string;
  priority: string;
  status: string;
  description: string;
  parameters?: any;
  result?: any;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Enhanced fields
  evolutionTask: boolean;      // Is this an evolution task?
  protocolTask: boolean;       // Is this a protocol task?
  treeOptimization: boolean;   // Tree optimization task?
  confidenceTarget?: number;   // Target confidence score
  
  supervisor?: AIAgent;
}

// MARKETPLACE ECOSYSTEM
export interface MarketplaceContribution {
  id: string;
  agentId?: string;           // Can be null for system contributions
  timestamp: Date;
  
  contributionType: string;   // "data", "algorithm", "insight", "revenue"
  value: any;                 // Contribution value/data
  impact: number;             // Impact score on ecosystem
  verification?: any;         // Verification data
}

// TRANSPORT PARADISE METRICS
export interface ParadiseMetric {
  id: string;
  timestamp: Date;
  
  // Paradise building metrics
  happinessScore: number;      // User happiness score
  efficiencyGain: number;      // Transport efficiency gain
  sustainabilityIndex: number; // Environmental impact
  innovationRate: number;      // Rate of innovation
  communityGrowth: number;     // Community growth rate
  
  // Emotional positioning data
  emotionalImpact?: any;       // Emotional impact measurements
  storytellingData?: any;      // Storytelling effectiveness
}

// ENHANCED SYSTEM CONFIGURATION
export interface SystemConfig {
  id: string;
  key: string;
  value: any;
  description?: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Enhanced fields
  treeLayer?: TreeLayer;       // Which tree layer this config affects
  evolutionImpact?: number;    // Impact on evolution system
  protocolCritical: boolean;   // Critical for protocol
}

// ENHANCED API INTEGRATIONS - Microservices
export interface ApiIntegration {
  id: string;
  name: string;
  endpoint: string;
  apiKey?: string;
  status: string;
  lastPing?: Date;
  responseTime?: number;
  successRate: number;
  config?: any;
  rateLimits?: any;
  fallbackConfig?: any;
  createdAt: Date;
  updatedAt: Date;
  
  // Microservices fields
  type: string;                // "grpc", "rabbitmq", "kafka", "elasticsearch", "mcp", "rest"
  grpcServices?: any;          // gRPC service definitions
  messageQueues?: any;         // RabbitMQ queue configurations
  kafkaTopics?: any;           // Kafka topic configurations
  elasticsearchMaps?: any;     // Elasticsearch mapping configurations
  mcpCapabilities?: any;       // Model Context Protocol capabilities
  
  // Performance metrics
  latency?: number;            // Average latency
  throughput?: number;         // Messages/requests per second
  reliability?: number;        // Reliability score
}

// EVENT STREAMING (Kafka simulation)
export interface EventStream {
  id: string;
  timestamp: Date;
  
  eventType: string;           // "evolution", "protocol", "marketplace", "paradise"
  source: string;              // Source system/agent
  target?: string;             // Target system/agent
  payload: any;                // Event payload
  processed: boolean;
}

// MESSAGE QUEUE (RabbitMQ simulation)
export interface MessageQueue {
  id: string;
  timestamp: Date;
  
  queueName: string;
  messageType: string;
  priority: number;
  payload: any;
  processed: boolean;
  retryCount: number;
}

// LEGACY INTERFACES (maintained for compatibility)
export interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  status: string;
  fuelLevel: number;
  location?: string;
  driverId?: string;
  createdAt: Date;
  updatedAt: Date;
  driver?: Driver;
  trips?: Trip[];
}

export interface Driver {
  id: string;
  name: string;
  license: string;
  status: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
  vehicles?: Vehicle[];
  trips?: Trip[];
}

export interface Trip {
  id: string;
  vehicleId: string;
  driverId: string;
  startPoint: string;
  endPoint: string;
  distance: number;
  duration: number;
  fuelUsed: number;
  status: string;
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
  vehicle?: Vehicle;
  driver?: Driver;
}

export interface Transaction {
  id: string;
  agentId: string;
  amount: number;
  type: string;
  status: string;
  createdAt: Date;
  agent?: AIAgent;
}

export interface FleetMetrics {
  id: string;
  activeVehicles: number;
  totalTrips: number;
  fuelEfficiency: number;
  revenue: number;
  aiProcessingRate: number;
  timestamp: Date;
}

// ENHANCED DASHBOARD METRICS - Transport Paradise
export interface DashboardMetrics {
  totalAgents: number;
  activeAgents: number;
  totalRevenue: number;
  avgPerformance: number;
  totalRequests: number;
  avgResponseTime: number;
  
  // Self-Evolution metrics
  evolutionCycles: number;
  learningAgents: number;
  avgConfidenceScore: number;
  
  // Digital Tree metrics
  treeDepth: number;
  branchEfficiency: number;
  
  // Protocol metrics
  protocolCompliance: number;
  validationScore: number;
  
  // Paradise metrics
  happinessScore: number;
  sustainabilityIndex: number;
  innovationRate: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  
  // Enhanced response metadata
  protocolVersion?: string;
  confidenceScore?: number;
  evolutionCycle?: number;
  treeLayer?: TreeLayer;
}

// ENHANCED MARKETPLACE TYPES - AI Marketplace
export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  downloads: number;
  developer: string;
  version: string;
  lastUpdated: Date;
  features: string[];
  screenshots?: string[];
  documentation?: string;
  apiEndpoint?: string;
  status: 'active' | 'pending' | 'deprecated';
  
  // Enhanced marketplace fields
  treeLayer: TreeLayer;
  protocolCompliance: ProtocolCompliance;
  confidenceScore: number;
  evolutionCapable: boolean;
  mcpCompatible: boolean;
  microserviceReady: boolean;
}

export interface MarketplaceCategory {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  icon: string;
  
  // Enhanced category fields
  treeLayer: TreeLayer;
  avgConfidenceScore: number;
  evolutionRate: number;
}

// ENHANCED FILTER AND SEARCH TYPES
export interface FilterOptions {
  category?: string;
  status?: string;
  priceRange?: [number, number];
  rating?: number;
  sortBy?: 'name' | 'price' | 'rating' | 'downloads' | 'lastUpdated' | 'confidenceScore' | 'evolutionCycle';
  sortOrder?: 'asc' | 'desc';
  
  // Enhanced filters
  treeLayer?: TreeLayer;
  evolutionStatus?: EvolutionStatus;
  protocolCompliance?: ProtocolCompliance;
  confidenceRange?: [number, number];
  mcpCompatible?: boolean;
  microserviceReady?: boolean;
}

export interface SearchParams {
  query?: string;
  filters?: FilterOptions;
  page?: number;
  limit?: number;
  
  // Enhanced search
  semanticSearch?: boolean;
  aiRecommendations?: boolean;
  evolutionBased?: boolean;
}

// STANDARD PROTOCOL INTERFACES
export interface StandardInput {
  version: string;
  timestamp: Date;
  agentId: string;
  requestId: string;
  data: any;
  metadata?: any;
  confidenceRequired?: number;
}

export interface StandardOutput {
  version: string;
  timestamp: Date;
  agentId: string;
  requestId: string;
  result: any;
  confidenceScore: number;
  transparencyLog: any;
  dataContribution?: any;
  metadata?: any;
}

// AGENTIC WEB INTEGRATION (MCP) INTERFACES
export interface MCPCapability {
  name: string;
  version: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
  confidenceRange: [number, number];
}

export interface AgentOrchestration {
  orchestrationId: string;
  participants: string[];
  workflow: any;
  status: string;
  result?: any;
  confidenceScore?: number;
}

// LEGACY COMPATIBILITY TYPES
export type AgentType = 'fuel-optimizer' | 'route-genius' | 'weather-prophet' | 'maintenance-predictor' | 'cost-analyzer';

export interface FleetopiaInputStandard {
  transport: TransportData;
  vehicle: VehicleData;
  driver: DriverData;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface TransportData {
  id: string;
  type: 'delivery' | 'pickup' | 'transfer' | 'maintenance';
  origin: LocationData;
  destination: LocationData;
  cargo?: CargoData;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration: number;
  actualDuration?: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
}

export interface VehicleData {
  id: string;
  plateNumber: string;
  type: 'truck' | 'van' | 'car' | 'motorcycle';
  model: string;
  year: number;
  fuelType: 'diesel' | 'gasoline' | 'electric' | 'hybrid';
  fuelLevel: number;
  mileage: number;
  status: 'active' | 'maintenance' | 'inactive';
  location: LocationData;
  capacity: {
    weight: number;
    volume: number;
  };
}

export interface DriverData {
  id: string;
  name: string;
  license: string;
  rating: number;
  experience: number;
  status: 'available' | 'driving' | 'break' | 'offline';
  location?: LocationData;
  workingHours: {
    start: string;
    end: string;
  };
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  country: string;
}

export interface CargoData {
  type: string;
  weight: number;
  volume: number;
  value: number;
  fragile: boolean;
  temperature?: {
    min: number;
    max: number;
  };
}

export interface DashboardStats {
  activeVehicles: number;
  aiAgentsOnline: number;
  revenueToday: number;
  fuelEfficiency: number;
  totalTrips: number;
  averageDeliveryTime: number;
  costSavings: number;
}

export interface DigitalScreenData {
  currentTime: string;
  systemStatus: 'online' | 'maintenance' | 'offline';
  fleetEfficiency: number;
  aiProcessingRate: number;
  activeAlerts: number;
  networkStatus: 'connected' | 'disconnected' | 'limited';
}

// MODERN FLEET MANAGEMENT INTERFACES

export interface Fleet {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  status: string;
  vehicles?: ModernVehicle[];
  drivers?: ModernDriver[];
  routes?: ModernRoute[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ModernVehicle {
  id: string;
  fleetId: string;
  vin: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  type: string;
  status: string;
  currentLocation?: any;
  odometer?: number;
  fuelLevel?: number;
  batteryLevel?: number;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  telematics?: VehicleTelematics[];
  maintenanceRecords?: MaintenanceRecord[];
  fuelRecords?: FuelRecord[];
  modernTrips?: ModernTrip[];
  alerts?: Alert[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ModernDriver {
  id: string;
  fleetId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  licenseNumber: string;
  licenseExpiry: Date;
  status: string;
  currentLocation?: any;
  hoursWorked?: number;
  modernTrips?: ModernTrip[];
  alerts?: Alert[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleTelematics {
  id: string;
  vehicleId: string;
  location: any;
  speed?: number;
  heading?: number;
  altitude?: number;
  odometer?: number;
  fuelLevel?: number;
  engineRpm?: number;
  engineTemp?: number;
  diagnostics?: any;
  provider?: string;
  timestamp: Date;
  createdAt: Date;
}

export interface ModernRoute {
  id: string;
  fleetId: string;
  name: string;
  origin: any;
  destination: any;
  waypoints?: any;
  distance?: number;
  duration?: number;
  optimized: boolean;
  provider?: string;
  status: string;
  modernTrips?: ModernTrip[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ModernTrip {
  id: string;
  vehicleId: string;
  driverId?: string;
  routeId?: string;
  startTime: Date;
  endTime?: Date;
  startLocation: any;
  endLocation?: any;
  distance?: number;
  duration?: number;
  fuelUsed?: number;
  status: string;
  trackingData?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: string;
  description: string;
  cost?: number;
  mileage?: number;
  serviceDate: Date;
  nextService?: Date;
  provider?: string;
  status: string;
  parts?: any;
  predictive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FuelRecord {
  id: string;
  vehicleId: string;
  stationName?: string;
  stationId?: string;
  location?: any;
  fuelType: string;
  quantity: number;
  pricePerLiter: number;
  totalCost: number;
  odometer?: number;
  provider?: string;
  timestamp: Date;
  createdAt: Date;
}

export interface Alert {
  id: string;
  vehicleId?: string;
  driverId?: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  data?: any;
  provider?: string;
  acknowledged: boolean;
  resolved: boolean;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API INTEGRATION INTERFACES

export interface ModernApiIntegration {
  id: string;
  name: string;
  type: string;
  provider: string;
  status: string;
  config?: any;
  credentials?: any;
  lastSync?: Date;
  syncCount: number;
  errorCount: number;
  rateLimit?: any;
  healthCheck?: any;
  createdAt: Date;
  updatedAt: Date;
}

// FREIGHT MATCHING INTERFACES

export interface FreightLoad {
  id: string;
  loadId: string;
  provider: string;
  origin: any;
  destination: any;
  pickupDate: Date;
  deliveryDate?: Date;
  weight?: number;
  distance?: number;
  rate?: number;
  status: string;
  requirements?: any;
  matched: boolean;
  vehicleId?: string;
  biddingData?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoadBid {
  id: string;
  loadId: string;
  vehicleId: string;
  driverId?: string;
  bidAmount: number;
  status: string;
  provider: string;
  bidData?: any;
  submittedAt: Date;
  respondedAt?: Date;
  createdAt: Date;
}

// WEATHER & TRAFFIC INTERFACES

export interface WeatherData {
  id: string;
  location: any;
  provider: string;
  current?: any;
  forecast?: any;
  alerts?: any;
  roadRisk?: number;
  visibility?: number;
  timestamp: Date;
  createdAt: Date;
}

export interface TrafficData {
  id: string;
  routeId?: string;
  provider: string;
  incidents?: any;
  flow?: any;
  congestion?: number;
  eta?: number;
  alerts?: any;
  timestamp: Date;
  createdAt: Date;
}

export interface TrafficIncident {
  id: string;
  incidentId: string;
  provider: string;
  type: string;
  severity: string;
  location: any;
  description: string;
  startTime: Date;
  endTime?: Date;
  impact?: any;
  createdAt: Date;
  updatedAt: Date;
}

// FUEL STATION INTERFACES

export interface FuelStation {
  id: string;
  stationId: string;
  provider: string;
  name: string;
  brand?: string;
  location: any;
  fuelTypes: any;
  amenities?: any;
  operatingHours?: any;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FuelPrice {
  id: string;
  stationId: string;
  fuelType: string;
  price: number;
  currency: string;
  provider: string;
  timestamp: Date;
  createdAt: Date;
}

// COMPLIANCE INTERFACES

export interface ComplianceCheck {
  id: string;
  vehicleId?: string;
  driverId?: string;
  type: string;
  provider: string;
  status: string;
  details?: any;
  violations?: any;
  expiryDate?: Date;
  checkDate: Date;
  automated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HoursOfService {
  id: string;
  driverId: string;
  date: Date;
  hoursWorked: number;
  hoursRemaining: number;
  violations?: any;
  status: string;
  provider?: string;
  createdAt: Date;
}

// COMMUNICATION INTERFACES

export interface Notification {
  id: string;
  userId?: string;
  type: string;
  provider: string;
  recipient: string;
  subject?: string;
  message: string;
  status: string;
  priority: string;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunicationLog {
  id: string;
  type: string;
  provider: string;
  sender: string;
  recipient: string;
  subject?: string;
  content: string;
  status: string;
  cost?: number;
  timestamp: Date;
  metadata?: any;
  createdAt: Date;
}

// FINANCIAL INTERFACES

export interface FinancialTransaction {
  id: string;
  fleetId?: string;
  vehicleId?: string;
  type: string;
  category: string;
  amount: number;
  currency: string;
  description?: string;
  provider?: string;
  externalId?: string;
  status: string;
  paymentMethod?: string;
  date: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  fleetId?: string;
  clientId?: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: Date;
  paidDate?: Date;
  items: any;
  provider?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExpenseReport {
  id: string;
  fleetId?: string;
  vehicleId?: string;
  period: string;
  startDate: Date;
  endDate: Date;
  totalAmount: number;
  categories: any;
  provider?: string;
  generatedAt: Date;
  createdAt: Date;
}

// ADVANCED FEATURES INTERFACES

export interface RouteOptimization {
  id: string;
  routeId?: string;
  algorithm: string;
  originalRoute: any;
  optimizedRoute: any;
  savings: any;
  provider?: string;
  confidence?: number;
  appliedAt?: Date;
  createdAt: Date;
}

export interface PredictiveMaintenance {
  id: string;
  vehicleId: string;
  component: string;
  prediction: any;
  confidence: number;
  recommendedDate: Date;
  priority: string;
  costEstimate?: number;
  provider?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RealTimeTracking {
  id: string;
  vehicleId: string;
  location: any;
  speed?: number;
  heading?: number;
  status: string;
  geofence?: any;
  provider?: string;
  timestamp: Date;
  createdAt: Date;
}

// ANALYTICS & REPORTING INTERFACES

export interface AnalyticsReport {
  id: string;
  type: string;
  period: string;
  data: any;
  insights?: any;
  recommendations?: any;
  generatedBy?: string;
  createdAt: Date;
}

export interface PerformanceMetric {
  id: string;
  entityType: string;
  entityId: string;
  metricType: string;
  value: number;
  unit?: string;
  benchmark?: number;
  provider?: string;
  timestamp: Date;
  createdAt: Date;
}

// FORM DATA INTERFACES

export interface FleetFormData {
  name: string;
  description?: string;
  ownerId: string;
}

export interface ModernVehicleFormData {
  fleetId: string;
  vin: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  type: string;
}

export interface ModernDriverFormData {
  fleetId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  licenseNumber: string;
  licenseExpiry: Date;
}

export interface RouteFormData {
  fleetId: string;
  name: string;
  origin: any;
  destination: any;
  waypoints?: any;
}

// REAL-TIME DATA INTERFACES

export interface RealTimeData {
  vehicleTracking: RealTimeTracking[];
  weatherAlerts: WeatherData[];
  trafficIncidents: TrafficIncident[];
  fuelPrices: FuelPrice[];
  systemAlerts: Alert[];
}

export interface LiveMetrics {
  activeVehicles: number;
  ongoingTrips: number;
  fuelEfficiency: number;
  averageSpeed: number;
  alertsCount: number;
  complianceStatus: number;
}

// INTEGRATION STATUS INTERFACES

export interface IntegrationStatus {
  freight: boolean;
  gps: boolean;
  mapping: boolean;
  weather: boolean;
  traffic: boolean;
  communication: boolean;
  fuel: boolean;
  compliance: boolean;
  maintenance: boolean;
  financial: boolean;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  latency: number;
  lastCheck: Date;
  errorRate: number;
}

// ENHANCED DASHBOARD METRICS WITH MODERN FLEET
export interface EnhancedDashboardMetrics extends DashboardMetrics {
  // Modern fleet metrics
  totalFleets: number;
  modernVehicles: number;
  modernDrivers: number;
  modernTrips: number;
  apiIntegrations: number;
  realTimeAlerts: number;
  fuelStations: number;
  complianceScore: number;
  
  // API integration metrics
  freightLoads: number;
  weatherAlerts: number;
  trafficIncidents: number;
  maintenanceAlerts: number;
  financialTransactions: number;
}

// API PROVIDER TYPES
export type FreightProvider = 'uber_freight' | 'convoy' | 'loadsmart' | 'ch_robinson';
export type GPSProvider = 'samsara' | 'geotab' | 'verizon_connect';
export type MappingProvider = 'here' | 'google' | 'mapbox' | 'tomtom';
export type WeatherProvider = 'openweathermap' | 'accuweather';
export type TrafficProvider = 'tomtom' | 'inrix' | 'waze';
export type CommunicationProvider = 'sendgrid' | 'mailgun' | 'twilio';
export type FuelProvider = 'gasbuddy' | 'tomtom' | 'inrix';
export type ComplianceProvider = 'fmcsa' | 'european_transport';
export type MaintenanceProvider = 'fleetio' | 'auto_parts_api' | 'obd_ii';
export type FinancialProvider = 'stripe' | 'billing_platform' | 'quickbooks' | 'xero';

// EXTENSION API RESPONSE TYPES
export interface ExtensionApiResponse<T> extends ApiResponse<T> {
  provider?: string;
  integrationId?: string;
  rateLimitRemaining?: number;
  cacheHit?: boolean;
  processingTime?: number;
}
