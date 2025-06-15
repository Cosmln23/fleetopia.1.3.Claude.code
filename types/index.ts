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

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  licensePlate: string;
  status: 'idle' | 'in_transit' | 'loading' | 'unloading' | 'maintenance' | 'assigned' | 'out_of_service';
  driverName: string;
  currentRoute: string;
  lat: number;
  lng: number;
  fleetId: string;
} 