import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';
import { Server } from 'http';
import { MLRouteOptimizer, MLOptimizationResult } from './ml-route-optimizer';

const prisma = new PrismaClient();

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
  private mlOptimizer: MLRouteOptimizer;

  constructor() {
    this.startMetricsUpdate();
    this.mlOptimizer = new MLRouteOptimizer();
    this.initializeMLOptimizer();
  }

  async initializeMLOptimizer() {
    try {
      await this.mlOptimizer.initializeML();
      console.log('✅ ML Route Optimizer initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize ML Route Optimizer:', error);
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
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            speed: location.speed,
            heading: location.heading,
            timestamp: location.timestamp,
            accuracy: location.accuracy,
            status: location.status
          },
          updatedAt: new Date()
        }
      });

      // Get vehicle's fleet
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: location.vehicleId },
        include: { fleet: true }
      });

      if (vehicle) {
        // Broadcast to fleet room
        this.io?.to(`fleet-${vehicle.fleetId}`).emit('vehicle-updated', {
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

      const totalDistance = vehicles.reduce((sum, v) => sum + (v.mileage || 0), 0);
      const averageSpeed = this.calculateAverageSpeed(activeVehicles.map(v => v.id));
      const fuelConsumption = vehicles.reduce((sum, v) => sum + (100 - (v.fuelLevel || 100)), 0);
      
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

  // ML-Enhanced Route Optimization
  async optimizeRoute(routeId: string): Promise<RouteOptimization> {
    try {
      // Try ML optimization first
      const mlResult = await this.optimizeRouteWithML(routeId);
      
      if (mlResult) {
        console.log('🧠 Using ML optimization result');
        return {
          routeId,
          originalDistance: mlResult.distance / (1 - mlResult.optimizationFactor),
          optimizedDistance: mlResult.distance,
          timeSaved: mlResult.savings.timeHours,
          fuelSaved: mlResult.savings.fuelLiters,
          costSaved: mlResult.savings.costEuros,
          efficiency: mlResult.optimizationFactor * 100
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

  // New ML-enhanced route optimization
  async optimizeRouteWithML(routeId: string): Promise<MLOptimizationResult | null> {
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

      return await this.mlOptimizer.optimizeRouteML(routeData);
      
    } catch (error) {
      console.error('❌ ML optimization failed:', error);
      return null;
    }
  }

  // Original fallback algorithm
  async optimizeRouteFallback(routeId: string): Promise<RouteOptimization> {
    const originalDistance = 150; // Mock data
    const optimized = await this.runOptimizationAlgorithms({
      start: { lat: 50.8503, lng: 4.3517 }, // Brussels
      end: { lat: 51.2194, lng: 4.4025 },   // Antwerp
      waypoints: [],
      vehicleType: 'diesel',
      trafficData: await this.getTrafficData(),
      weatherData: await this.getWeatherData(),
      fuelPrices: await this.getFuelPrices()
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
      efficiency: ((originalDistance - optimized.distance) / originalDistance) * 100
    };

    } catch (error) {
      console.error('❌ Fallback optimization failed:', error);
      throw error;
    }
  }

  // Get ML Optimizer stats
  getMLStats() {
    return this.mlOptimizer.getStats();
  }

  // Learn from route result for ML improvement
  async learnFromRouteResult(routeId: string, prediction: MLOptimizationResult, actualResult: any) {
    return await this.mlOptimizer.learnFromResult(routeId, prediction, actualResult);
  }
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
    const totalFuel = vehicles.reduce((sum, v) => sum + (100 - (v.fuelLevel || 100)), 0);
    const totalDistance = vehicles.reduce((sum, v) => sum + (v.mileage || 0), 0);
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
      this.io?.to(socketId).emit('fleet-metrics', metrics);
    });
  }

  private startMetricsUpdate() {
    // Update metrics every 30 seconds
    this.updateInterval = setInterval(async () => {
      // Broadcast updated metrics to all connected clients
      if (this.io) {
        const rooms = Array.from(this.io.sockets.adapter.rooms.keys())
          .filter(room => room.startsWith('fleet-'));
        
        for (const room of rooms) {
          const fleetId = room.replace('fleet-', '');
          const metrics = await this.getFleetMetrics(fleetId);
          this.io.to(room).emit('fleet-metrics', metrics);
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