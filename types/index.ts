export interface CargoOffer {
  id: string;
  title: string;
  fromLocation: string;
  toLocation: string;
  distance: number | null;
  weight: number;
  volume: number | null;
  cargoType: string;
  loadingDate: string;
  deliveryDate: string;
  price: number;
  priceType: string;
  companyName: string;
  companyRating: number | null;
  requirements: string[];
  truckType: string | null;
  status: string;
  urgency: string;
  createdAt: string;
}

// Define enums based on your Prisma schema
export enum VehicleStatus {
  idle = 'idle',
  in_transit = 'in_transit',
  en_route = 'en_route',
  loading = 'loading',
  unloading = 'unloading',
  maintenance = 'maintenance',
  assigned = 'assigned',
  out_of_service = 'out_of_service',
}

export enum VehicleLocationType {
  MANUAL_COORDS = 'MANUAL_COORDS',
  MANUAL_ADDRESS = 'MANUAL_ADDRESS',
  GPS_API = 'GPS_API',
}

// Define the base Vehicle type based on your Prisma schema
export interface Vehicle {
  id: string;
  licensePlate: string;
  fleetId: string;
  driverName: string;
  lat?: number | null;
  lng?: number | null;
  name: string;
  type: string;
  status: VehicleStatus;
  fuelConsumption?: number | null;
  createdAt: Date;
  currentRouteId?: string | null;
  currentRoute?: string | null;
  gpsDeviceImei?: string | null;
  locationType: VehicleLocationType;
  manualLocationAddress?: string | null;
  updatedAt: Date;
} 
