import prisma from './prisma';
import { Vehicle, Route, CargoOffer, GpsLog } from '@prisma/client';
import { BasicOptimizationResult } from './basic-route-optimizer';

// Interfață simplificată care corespunde cu ce avem
export interface VehicleProfile {
  id: string;
  name: string;
  licensePlate: string;
  updatedAt: Date;
  createdAt: Date;
  // Adăugăm câmpuri non-DB ca opționale
  currentState?: any;
  restrictions?: any[];
  historicalPerformance?: any;
  associations?: any;
  optimizationData?: any;
}

// Rezultat simplificat
export interface VehicleOptimizationResult {
  vehicleOptimized: boolean;
  vehicleId: string;
  recommendations: string[];
}

export class VehicleSpecificOptimizer {
  private vehicleProfiles: Map<string, VehicleProfile> = new Map();
  private isInitialized = false;

  constructor() {
    console.log('🚛 VehicleSpecificOptimizer initialized');
  }

  async initializeVehicleOptimization(): Promise<void> {
    if (this.isInitialized) return;
    try {
      console.log('🚛 Initializing Vehicle-Specific Optimization Engine...');
      await this.loadVehicleProfiles();
      this.isInitialized = true;
      console.log('✅ Vehicle-Specific Optimization Engine initialized');
      console.log(`🚗 Loaded ${this.vehicleProfiles.size} vehicle profiles`);
    } catch (error) {
      console.error('❌ Failed to initialize Vehicle-Specific Optimization Engine:', error);
      this.isInitialized = false;
    }
  }

  // Funcție simplificată care încarcă doar ce există
  async loadVehicleProfiles(): Promise<void> {
    try {
      const profilesFromDb = await prisma.vehicle.findMany({
        select: {
          id: true,
          name: true,
          licensePlate: true,
          updatedAt: true,
          createdAt: true,
        },
      });
      profilesFromDb.forEach(p => {
        this.vehicleProfiles.set(p.id, p);
      });
      console.log(`✅ Successfully loaded ${profilesFromDb.length} vehicle profiles from database`);
    } catch (error) {
      console.error('❌ Failed to load vehicle profiles from database:', error);
    }
  }

  // Funcție de optimizare placeholder care nu face logică complexă
  async optimizeForVehicle(route: any, vehicleId: string): Promise<VehicleOptimizationResult | null> {
    const profile = this.vehicleProfiles.get(vehicleId);
    if (!profile) return null;

    console.log(`🚛 Applying placeholder optimization for vehicle: ${vehicleId}`);
    return {
      vehicleOptimized: true,
      vehicleId: vehicleId,
      recommendations: ["Placeholder: Check vehicle status before departure."],
    };
  }
  
  // Funcție simplificată de creare/update
  async createOrUpdateVehicleProfile(vehicleId: string, vehicleData: any): Promise<VehicleProfile> {
    const existingProfile = this.vehicleProfiles.get(vehicleId);

    const dataToSave = {
      name: vehicleData.name || existingProfile?.name || `Vehicle ${vehicleId}`,
      licensePlate: vehicleData.licensePlate || existingProfile?.licensePlate || `LP-${vehicleId}`,
    };
    
    const savedProfile = await prisma.vehicle.upsert({
      where: { id: vehicleId },
      update: dataToSave,
      create: {
        id: vehicleId,
        ...dataToSave,
        driverName: "N/A", // Câmp obligatoriu
        type: "N/A", // Câmp obligatoriu
        fleetId: "demo-fleet-001" // Demo fleet ID - will be dynamic based on user data
      },
    });

    this.vehicleProfiles.set(vehicleId, savedProfile);
    return savedProfile;
  }
  
  getVehicleCount(): number {
    return this.vehicleProfiles.size;
  }
} 
