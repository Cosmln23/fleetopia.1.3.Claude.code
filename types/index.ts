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
  IN_TRANSIT = 'IN_TRANSIT',
  IDLE = 'IDLE',
  MAINTENANCE = 'MAINTENANCE',
}

// Define the base Vehicle type based on your Prisma schema
export interface Vehicle {
  id: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  status: VehicleStatus;
  currentDriverId?: string | null;
  createdAt: Date;
  updatedAt: Date;
} 