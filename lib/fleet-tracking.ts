import prisma from './prisma';
import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import { BasicRouteOptimizer, BasicOptimizationResult } from './basic-route-optimizer';
import { Vehicle, GpsLog, VehicleStatus } from '@prisma/client';

const FLEET_TRACKING_CACHE_TTL = 60 * 1000; // 1 minut

export interface VehicleLocation {
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: Date;
  accuracy: number;
  status: 'moving' | 'stopped' | 'idle';
}

export interface FleetMetrics {
  totalVehicles: number;
  activeVehicles: number;
  totalDistance: number;
  averageSpeed: number;
  fuelConsumption: number;
  efficiency: number;
  alerts: number;
}

export interface RouteOptimization {
  routeId: string;
  originalDistance: number;
  optimizedDistance: number;
  timeSaved: number;
  fuelSaved: number;
  costSaved: number;
  efficiency: number;
}

export class FleetTrackingService {
  private io: SocketIOServer | null = null;
  private activeVehicles: Map<string, VehicleLocation> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private basicOptimizer: BasicRouteOptimizer;

  constructor() {
    this.startMetricsUpdate();
    this.basicOptimizer = new BasicRouteOptimizer();
    this.initializeOptimizer();
  }

  async initializeOptimizer() {
    try {
      await this.basicOptimizer.initialize();
      console.log('✅ Basic Route Optimizer initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Basic Route Optimizer:', error);
    }
  }

  // Initialize WebSocket server
  initializeSocket(server: Server) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected to fleet tracking:', socket.id);

      // Join fleet room
      socket.on('join-fleet', (fleetId: string) => {
        socket.join(`fleet-${fleetId}`);
        this.sendFleetData(fleetId, socket.id);
      });

      // Receive vehicle location update
      socket.on('vehicle-location', (data: VehicleLocation) => {
        this.updateVehicleLocation(data);
      });

      // Handle route optimization request
      socket.on('optimize-route', async (routeId: string) => {
        const optimization = await this.optimizeRoute(routeId);
        socket.emit('route-optimized', optimization);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected from fleet tracking:', socket.id);
      });
    });
  }

  // Update vehicle location
  async updateVehicleLocation(location: VehicleLocation) {
    try {
      // Store in memory for real-time access
      this.activeVehicles.set(location.vehicleId, location);

      // Update database
      await prisma.vehicle.update({
        where: { id: location.vehicleId },
        data: {
          lat: location.latitude,
          lng: location.longitude,
          updatedAt: new Date(),
        },
      });

      // Get vehicle's fleet
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: location.vehicleId },
        include: { fleet: true }
      });

      if (vehicle) {
        // Broadcast to fleet room
        (this.io as SocketIOServer | null)?.to(`fleet-${vehicle.fleetId}`).emit('vehicle-updated', {
          vehicleId: location.vehicleId,
          location: location,
          fleetId: vehicle.fleetId
        });

        // Check for alerts
        await this.checkAlerts(location, vehicle.fleetId);
      }

    } catch (error) {
      console.error('Error updating vehicle location:', error);
    }
  }

  // Get real-time fleet metrics
  async getFleetMetrics(fleetId: string): Promise<FleetMetrics> {
    try {
      const vehicles = await prisma.vehicle.findMany({
        where: { fleetId },
        include: { routes: true }
      });

      const activeVehicles = vehicles.filter(v => {
        const location = this.activeVehicles.get(v.id);
        return location && this.isRecentLocation(location);
      });

      const totalDistance = vehicles.reduce((sum, v) => sum + (((v as any).mileage) || 0), 0);
      const averageSpeed = this.calculateAverageSpeed(activeVehicles.map(v => v.id));
      const fuelConsumption = vehicles.reduce((sum, v) => sum + (100 - (((v as any).fuelLevel) || 100)), 0);
      
      return {
        totalVehicles: vehicles.length,
        activeVehicles: activeVehicles.length,
        totalDistance,
        averageSpeed,
        fuelConsumption,
        efficiency: this.calculateFleetEfficiency(vehicles),
        alerts: await this.getActiveAlerts(fleetId)
      };

    } catch (error) {
      console.error('Error getting fleet metrics:', error);
      throw error;
    }
  }

  // Basic Route Optimization
  async optimizeRoute(routeId: string): Promise<RouteOptimization> {
    try {
      // Try basic optimization first
      const basicResult = await this.optimizeRouteWithBasic(routeId);
      
      if (basicResult) {
        console.log('🔧 Using basic optimization result');
        return {
          routeId,
          originalDistance: basicResult.distance / (1 - basicResult.optimizationFactor),
          optimizedDistance: basicResult.distance,
          timeSaved: basicResult.savings.timeHours,
          fuelSaved: basicResult.savings.fuelLiters,
          costSaved: basicResult.savings.costEuros,
          efficiency: basicResult.optimizationFactor * 100
        };
      }

      // Fallback to original algorithm
      console.log('⚠️ Using fallback optimization');
      return await this.optimizeRouteFallback(routeId);

    } catch (error) {
      console.error('❌ Route optimization failed:', error);
      throw error;
    }
  }

  // Basic route optimization
  async optimizeRouteWithBasic(routeId: string): Promise<BasicOptimizationResult | null> {
    try {
      // Mock route data for testing
      const routeData = {
        id: routeId,
        distance: 150, // 150km route
        vehicle: { type: 'diesel', efficiency: 0.75 },
        driver: { experience: 5 },
        trafficData: await this.getTrafficData(),
        weatherData: await this.getWeatherData(),
        fuelPrices: await this.getFuelPrices(),
        waypoints: []
      };

      return await this.basicOptimizer.optimizeRoute(routeData);
      
    } catch (error) {
      console.error('❌ Basic optimization failed:', error);
      return null;
    }
  }

  // Original fallback algorithm
  async optimizeRouteFallback(routeId: string): Promise<RouteOptimization> {
    try {
      const originalDistance = 150; // Mock data
      const optimized = await this.runOptimizationAlgorithms({
        start: { lat: 50.8503, lng: 4.3517 }, // Brussels
        end: { lat: 51.2194, lng: 4.4025 },   // Antwerp
        waypoints: [],
        vehicleType: 'diesel',
        trafficData: await this.getTrafficData(),
        weatherData: await this.getWeatherData(),
        fuelPrices: await this.getFuelPrices(),
      });

      const timeSaved = (originalDistance - optimized.distance) / 50;
      const fuelSaved = (originalDistance - optimized.distance) * 0.08;
      const costSaved = fuelSaved * 1.5;

      return {
        routeId,
        originalDistance,
        optimizedDistance: optimized.distance,
        timeSaved,
        fuelSaved,
        costSaved,
        efficiency: ((originalDistance - optimized.distance) / originalDistance) * 100,
      };
    } catch (error) {
      console.error('❌ Fallback optimization failed:', error);
      throw error;
    }
  }

  // Get Basic Optimizer stats
  getOptimizerStats() {
    return this.basicOptimizer.getStats();
  }

  // Learn from route result for basic improvement
  async learnFromRouteResult(routeId: string, prediction: BasicOptimizationResult, actualResult: any) {
    // Basic optimizer doesn't have learning capability
    console.log('Basic optimizer does not support learning from results');
    return null;
  }

  // AI-powered route optimization algorithms
  private async runOptimizationAlgorithms(params: any) {
    // Simulated AI optimization (replace with real algorithms)
    const { start, end, waypoints, trafficData, weatherData, fuelPrices } = params;

    // Traffic-based optimization
    let optimizedDistance = this.calculateDistance(start, end);
    let optimizedWaypoints = [...waypoints];

    // Apply traffic optimization
    if (trafficData && trafficData.congestion > 0.5) {
      optimizedDistance *= 1.1; // Reroute adds distance but saves time
      optimizedWaypoints = this.reroute(waypoints, trafficData);
    }

    // Weather optimization
    if (weatherData && weatherData.condition === 'rain') {
      optimizedDistance *= 0.95; // Safer, more efficient routes
    }

    // Fuel price optimization
    if (fuelPrices) {
      const cheapestStations = fuelPrices.filter((station: any) => station.price < 1.4);
      if (cheapestStations.length > 0) {
        optimizedWaypoints.push(...cheapestStations.slice(0, 2));
      }
    }

    return {
      distance: optimizedDistance * 0.92, // AI optimization saves ~8%
      duration: optimizedDistance / 45, // hours
      waypoints: optimizedWaypoints
    };
  }

  // Check for fleet alerts
  private async checkAlerts(location: VehicleLocation, fleetId: string) {
    const alerts = [];

    // Speed alert
    if (location.speed > 90) {
      alerts.push({
        type: 'speed',
        message: 'Vehicle exceeding speed limit',
        vehicleId: location.vehicleId,
        severity: 'high'
      });
    }

    // Location accuracy alert
    if (location.accuracy > 100) {
      alerts.push({
        type: 'gps',
        message: 'Poor GPS signal',
        vehicleId: location.vehicleId,
        severity: 'medium'
      });
    }

    // Broadcast alerts
    if (alerts.length > 0) {
      this.io?.to(`fleet-${fleetId}`).emit('fleet-alerts', alerts);
    }
  }

  // Helper methods
  private isRecentLocation(location: VehicleLocation): boolean {
    const now = new Date();
    const locationTime = new Date(location.timestamp);
    const diffMinutes = (now.getTime() - locationTime.getTime()) / (1000 * 60);
    return diffMinutes < 5; // Consider active if updated within 5 minutes
  }

  private calculateAverageSpeed(vehicleIds: string[]): number {
    const speeds = vehicleIds.map(id => this.activeVehicles.get(id)?.speed || 0);
    return speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length || 0;
  }

  private calculateFleetEfficiency(vehicles: any[]): number {
    // Simplified efficiency calculation
    const totalFuel = vehicles.reduce((sum, v) => sum + (100 - (((v as any).fuelLevel) || 100)), 0);
    const totalDistance = vehicles.reduce((sum, v) => sum + (((v as any).mileage) || 0), 0);
    return totalDistance > 0 ? (totalDistance / totalFuel) * 100 : 0;
  }

  private async getActiveAlerts(fleetId: string): Promise<number> {
    // Simulate alert count
    return Math.floor(Math.random() * 5);
  }

  private calculateDistance(start: any, end: any): number {
    // Haversine formula for distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(end.latitude - start.latitude);
    const dLon = this.deg2rad(end.longitude - start.longitude);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(start.latitude)) * Math.cos(this.deg2rad(end.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private reroute(waypoints: any[], trafficData: any): any[] {
    // Simulate intelligent rerouting
    return waypoints.map(wp => ({
      ...wp,
      optimized: true
    }));
  }

  private async getTrafficData() {
    // Simulate traffic data (replace with real API)
    return {
      congestion: Math.random(),
      incidents: Math.floor(Math.random() * 3)
    };
  }

  private async getWeatherData() {
    // Simulate weather data (replace with real API)
    const conditions = ['sunny', 'rain', 'snow', 'fog'];
    return {
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      temperature: Math.floor(Math.random() * 30) + 5
    };
  }

  private async getFuelPrices() {
    // Simulate fuel price data (replace with real API)
    return [
      { station: 'OMV Station 1', price: 1.42, location: { lat: 44.4268, lng: 26.1025 } },
      { station: 'Petrom Station 2', price: 1.38, location: { lat: 44.4378, lng: 26.1125 } }
    ];
  }

  private sendFleetData(fleetId: string, socketId: string) {
    // Send initial fleet data to connected client
    this.getFleetMetrics(fleetId).then(metrics => {
      (this.io as SocketIOServer | null)?.to(socketId).emit('fleet-metrics', metrics);
    });
  }

  private startMetricsUpdate() {
    // Update metrics every 30 seconds
    this.updateInterval = setInterval(async () => {
      // Broadcast updated metrics to all connected clients
      if (this.io) {
        const rooms = Array.from((this.io as SocketIOServer).sockets.adapter.rooms.keys())
          .filter(room => room.startsWith('fleet-'));
        
        for (const room of rooms) {
          const fleetId = room.replace('fleet-', '');
          const metrics = await this.getFleetMetrics(fleetId);
          (this.io as SocketIOServer).to(room).emit('fleet-metrics', metrics);
        }
      }
    }, 30000);
  }

  // Cleanup
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.io) {
      this.io.close();
    }
  }
}

// Export singleton instance
export const fleetTrackingService = new FleetTrackingService(); 
