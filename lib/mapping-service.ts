// Mapping service for converting between your structure and Prisma models
// This ensures compatibility between the proposed database structure and current implementation

import { CargoOffer, Vehicle, Trip, CargoStatus, VehicleStatus, TripStatus, VehicleType } from '@prisma/client';

// ==================== VEHICLE MAPPINGS ====================

/**
 * Map VehicleStatus to your structure's status values
 * Prisma: idle, in_transit, en_route, loading, unloading, maintenance, assigned, out_of_service
 * Your structure: available, busy, maintenance
 */
export const mapVehicleStatusToYourStructure = (status: VehicleStatus): 'available' | 'busy' | 'maintenance' => {
  switch (status) {
    case 'idle':
      return 'available';
    case 'in_transit':
    case 'en_route':
    case 'loading':
    case 'unloading':
    case 'assigned':
      return 'busy';
    case 'maintenance':
    case 'out_of_service':
      return 'maintenance';
    default:
      return 'available';
  }
};

/**
 * Map your structure's status to VehicleStatus
 * Your structure: available, busy, maintenance
 * Prisma: idle, in_transit, en_route, loading, unloading, maintenance, assigned, out_of_service
 */
export const mapYourStructureToVehicleStatus = (status: 'available' | 'busy' | 'maintenance'): VehicleStatus => {
  switch (status) {
    case 'available':
      return 'idle';
    case 'busy':
      return 'assigned';
    case 'maintenance':
      return 'maintenance';
    default:
      return 'idle';
  }
};

/**
 * Map VehicleType to your structure's vehicle types
 * Prisma: VAN, TRUCK, SEMI
 * Your structure: van, truck, semi
 */
export const mapVehicleTypeToYourStructure = (type: VehicleType | null): 'van' | 'truck' | 'semi' | null => {
  if (!type) return null;
  
  switch (type) {
    case 'VAN':
      return 'van';
    case 'TRUCK':
      return 'truck';
    case 'SEMI':
      return 'semi';
    default:
      return null;
  }
};

/**
 * Map your structure's vehicle type to VehicleType
 * Your structure: van, truck, semi
 * Prisma: VAN, TRUCK, SEMI
 */
export const mapYourStructureToVehicleType = (type: 'van' | 'truck' | 'semi'): VehicleType => {
  switch (type) {
    case 'van':
      return 'VAN';
    case 'truck':
      return 'TRUCK';
    case 'semi':
      return 'SEMI';
    default:
      return 'TRUCK';
  }
};

// ==================== CARGO MAPPINGS ====================

/**
 * Map CargoStatus to your structure's status values
 * Prisma: NEW, TAKEN, IN_PROGRESS, COMPLETED, CANCELED, OPEN
 * Your structure: available, assigned, completed
 */
export const mapCargoStatusToYourStructure = (status: CargoStatus): 'available' | 'assigned' | 'completed' => {
  switch (status) {
    case 'NEW':
    case 'OPEN':
      return 'available';
    case 'TAKEN':
    case 'IN_PROGRESS':
      return 'assigned';
    case 'COMPLETED':
      return 'completed';
    case 'CANCELED':
      return 'available'; // Canceled becomes available again
    default:
      return 'available';
  }
};

/**
 * Map your structure's status to CargoStatus
 * Your structure: available, assigned, completed
 * Prisma: NEW, TAKEN, IN_PROGRESS, COMPLETED, CANCELED, OPEN
 */
export const mapYourStructureToCargoStatus = (status: 'available' | 'assigned' | 'completed'): CargoStatus => {
  switch (status) {
    case 'available':
      return 'NEW';
    case 'assigned':
      return 'TAKEN';
    case 'completed':
      return 'COMPLETED';
    default:
      return 'NEW';
  }
};

/**
 * Map urgency to your structure (already compatible)
 * Both use: low, medium, high, urgent
 */
export const mapUrgencyToYourStructure = (urgency: string): 'low' | 'medium' | 'high' | 'urgent' => {
  switch (urgency.toLowerCase()) {
    case 'low':
      return 'low';
    case 'medium':
      return 'medium';
    case 'high':
      return 'high';
    case 'urgent':
      return 'urgent';
    default:
      return 'medium';
  }
};

// ==================== TRIP MAPPINGS ====================

/**
 * Map TripStatus to your structure's status values
 * Both use: suggested, accepted, in_progress, completed
 */
export const mapTripStatusToYourStructure = (status: TripStatus): 'suggested' | 'accepted' | 'in_progress' | 'completed' => {
  switch (status) {
    case 'SUGGESTED':
      return 'suggested';
    case 'ACCEPTED':
      return 'accepted';
    case 'IN_PROGRESS':
      return 'in_progress';
    case 'COMPLETED':
      return 'completed';
    default:
      return 'suggested';
  }
};

/**
 * Map your structure's trip status to TripStatus
 * Your structure: suggested, accepted, in_progress, completed
 * Prisma: SUGGESTED, ACCEPTED, IN_PROGRESS, COMPLETED
 */
export const mapYourStructureToTripStatus = (status: 'suggested' | 'accepted' | 'in_progress' | 'completed'): TripStatus => {
  switch (status) {
    case 'suggested':
      return 'SUGGESTED';
    case 'accepted':
      return 'ACCEPTED';
    case 'in_progress':
      return 'IN_PROGRESS';
    case 'completed':
      return 'COMPLETED';
    default:
      return 'SUGGESTED';
  }
};

// ==================== COMPLETE OBJECT MAPPINGS ====================

/**
 * Convert Prisma Vehicle to your structure format
 */
export const mapVehicleToYourStructure = (vehicle: Vehicle & { 
  currentLat?: number | null;
  currentLng?: number | null;
  capacityKg?: number | null;
  vehicleType?: VehicleType | null;
  lastUpdate?: Date | null;
}) => {
  return {
    id: vehicle.id,
    license_plate: vehicle.licensePlate,
    current_lat: vehicle.currentLat || vehicle.lat || 0,
    current_lng: vehicle.currentLng || vehicle.lng || 0,
    capacity_kg: vehicle.capacityKg || 0,
    vehicle_type: mapVehicleTypeToYourStructure(vehicle.vehicleType) || 'truck',
    fuel_consumption: vehicle.fuelConsumption || 30.0,
    status: mapVehicleStatusToYourStructure(vehicle.status),
    driver_id: vehicle.driverId || null,
    last_update: vehicle.lastUpdate || vehicle.updatedAt
  };
};

/**
 * Convert Prisma CargoOffer to your structure format
 */
export const mapCargoToYourStructure = (cargo: CargoOffer & {
  pickupLat?: number | null;
  pickupLng?: number | null;
  deliveryLat?: number | null;
  deliveryLng?: number | null;
  deadline?: Date | null;
}) => {
  return {
    id: cargo.id,
    pickup_lat: cargo.pickupLat || 0,
    pickup_lng: cargo.pickupLng || 0,
    pickup_city: cargo.fromCity,
    delivery_lat: cargo.deliveryLat || 0,
    delivery_lng: cargo.deliveryLng || 0,
    delivery_city: cargo.toCity,
    weight_kg: Math.round(cargo.weight),
    cargo_type: cargo.cargoType,
    price_ron: cargo.priceRon || cargo.price,
    deadline: cargo.deadline || cargo.deliveryDate,
    urgency: mapUrgencyToYourStructure(cargo.urgency),
    status: mapCargoStatusToYourStructure(cargo.status),
    created_at: cargo.createdAt
  };
};

/**
 * Convert Prisma Trip to your structure format
 */
export const mapTripToYourStructure = (trip: Trip) => {
  return {
    id: trip.id,
    cargo_id: trip.cargoId,
    vehicle_id: trip.vehicleId,
    estimated_profit: trip.estimatedProfit,
    estimated_duration: trip.estimatedDuration,
    distance_km: trip.distanceKm,
    status: mapTripStatusToYourStructure(trip.status),
    created_at: trip.createdAt
  };
};

// ==================== REVERSE MAPPINGS ====================

/**
 * Convert your structure's vehicle data to Prisma format
 */
export const mapYourStructureToVehicle = (vehicleData: {
  license_plate: string;
  current_lat?: number;
  current_lng?: number;
  capacity_kg?: number;
  vehicle_type?: 'van' | 'truck' | 'semi';
  fuel_consumption?: number;
  status?: 'available' | 'busy' | 'maintenance';
  driver_id?: string | null;
}) => {
  return {
    licensePlate: vehicleData.license_plate,
    currentLat: vehicleData.current_lat,
    currentLng: vehicleData.current_lng,
    lat: vehicleData.current_lat, // Also set regular lat/lng for compatibility
    lng: vehicleData.current_lng,
    capacityKg: vehicleData.capacity_kg,
    vehicleType: vehicleData.vehicle_type ? mapYourStructureToVehicleType(vehicleData.vehicle_type) : null,
    fuelConsumption: vehicleData.fuel_consumption || 30.0,
    status: vehicleData.status ? mapYourStructureToVehicleStatus(vehicleData.status) : 'idle',
    driverId: vehicleData.driver_id,
    lastUpdate: new Date()
  };
};

/**
 * Convert your structure's cargo data to Prisma format
 */
export const mapYourStructureToCargo = (cargoData: {
  pickup_lat?: number;
  pickup_lng?: number;
  pickup_city: string;
  delivery_lat?: number;
  delivery_lng?: number;
  delivery_city: string;
  weight_kg: number;
  cargo_type?: string;
  price_ron?: number;
  deadline?: Date;
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
}) => {
  return {
    pickupLat: cargoData.pickup_lat,
    pickupLng: cargoData.pickup_lng,
    fromCity: cargoData.pickup_city,
    deliveryLat: cargoData.delivery_lat,
    deliveryLng: cargoData.delivery_lng,
    toCity: cargoData.delivery_city,
    weight: cargoData.weight_kg,
    cargoType: cargoData.cargo_type || 'General',
    priceRon: cargoData.price_ron,
    deadline: cargoData.deadline,
    urgency: cargoData.urgency || 'medium'
  };
};

/**
 * Convert your structure's trip data to Prisma format
 */
export const mapYourStructureToTrip = (tripData: {
  cargo_id: string;
  vehicle_id: string;
  estimated_profit: number;
  estimated_duration: number;
  distance_km: number;
  status?: 'suggested' | 'accepted' | 'in_progress' | 'completed';
}) => {
  return {
    cargoId: tripData.cargo_id,
    vehicleId: tripData.vehicle_id,
    estimatedProfit: tripData.estimated_profit,
    estimatedDuration: tripData.estimated_duration,
    distanceKm: tripData.distance_km,
    status: tripData.status ? mapYourStructureToTripStatus(tripData.status) : 'SUGGESTED'
  };
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get available statuses for vehicles in your structure format
 */
export const getAvailableVehicleStatuses = () => ['available', 'busy', 'maintenance'] as const;

/**
 * Get available statuses for cargo in your structure format
 */
export const getAvailableCargoStatuses = () => ['available', 'assigned', 'completed'] as const;

/**
 * Get available statuses for trips in your structure format
 */
export const getAvailableTripStatuses = () => ['suggested', 'accepted', 'in_progress', 'completed'] as const;

/**
 * Get available vehicle types in your structure format
 */
export const getAvailableVehicleTypes = () => ['van', 'truck', 'semi'] as const;

/**
 * Get available urgency levels in your structure format
 */
export const getAvailableUrgencyLevels = () => ['low', 'medium', 'high', 'urgent'] as const;