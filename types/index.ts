export interface Vehicle {
  id: string;
  name: string;
  type: string;
  licensePlate: string;
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  driverName: string;
  currentRoute: string;
  lat: number;
  lng: number;
} 