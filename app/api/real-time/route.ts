export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';

// Real-time Data API - Mock data for development
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const fleetId = searchParams.get('fleetId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const realTimeData: any = {};

    // Vehicle tracking data (mock data)
    if (type === 'all' || type === 'tracking') {
      realTimeData.vehicleTracking = Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
        id: `vehicle-${i + 1}`,
        vehicleId: `VH-${1000 + i}`,
        fleetId: fleetId || `fleet-${Math.floor(i / 3) + 1}`,
        name: `Vehicle ${String.fromCharCode(65 + i)}`,
        licensePlate: `B-${100 + i}-ABC`,
        location: { 
          lat: 45.7489 + (Math.random() - 0.5) * 0.1, 
          lng: 21.2087 + (Math.random() - 0.5) * 0.1 
        },
        speed: Math.floor(Math.random() * 80) + 20, // 20-100 km/h
        status: ['active', 'parked', 'maintenance'][Math.floor(Math.random() * 3)],
        fuel: Math.floor(Math.random() * 100),
        driver: `Driver ${i + 1}`,
        route: `Route ${Math.floor(Math.random() * 5) + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 3600000) // Last hour
      }));
    }

    // Weather alerts (mock data)
    if (type === 'all' || type === 'weather') {
      realTimeData.weatherAlerts = [
        {
          id: '1',
          location: 'Timișoara',
          alert: 'Light rain expected in the next hour',
          severity: 'low',
          impact: 'Minor delays possible',
          temperature: 18,
          humidity: 65,
          windSpeed: 12,
          timestamp: new Date()
        },
        {
          id: '2', 
          location: 'București',
          alert: 'Heavy traffic due to weather conditions',
          severity: 'medium',
          impact: 'Route optimization recommended',
          temperature: 15,
          humidity: 78,
          windSpeed: 18,
          timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
        }
      ];
    }

    // Traffic incidents (mock data)
    if (type === 'all' || type === 'traffic') {
      realTimeData.trafficIncidents = [
        {
          id: '1',
          location: 'A1 Highway km 45',
          description: 'Minor accident, one lane blocked',
          severity: 'medium',
          impact: '15-minute delay expected',
          affectedRoutes: ['Route 1', 'Route 3'],
          startTime: new Date(Date.now() - 900000), // 15 minutes ago
          estimatedEndTime: new Date(Date.now() + 1800000), // Expected to end in 30 minutes
          timestamp: new Date()
        },
        {
          id: '2',
          location: 'DN1 - Ploiești entrance',
          description: 'Road construction, reduced speed limit',
          severity: 'low',
          impact: '5-minute delay',
          affectedRoutes: ['Route 2'],
          startTime: new Date(Date.now() - 7200000), // 2 hours ago
          estimatedEndTime: new Date(Date.now() + 14400000), // 4 hours from now
          timestamp: new Date()
        }
      ];
    }

    // Fuel prices (mock data)
    if (type === 'all' || type === 'fuel') {
      realTimeData.fuelPrices = [
        {
          id: '1',
          station: 'OMV Timișoara Centro',
          fuelType: 'Diesel',
          price: (6.85 + Math.random() * 0.5).toFixed(2),
          priceChange: Math.random() > 0.5 ? '+0.05' : '-0.03',
          location: { lat: 45.7489, lng: 21.2087 },
          distance: '2.3 km',
          amenities: ['Restaurant', 'ATM', 'Shop'],
          timestamp: new Date()
        },
        {
          id: '2',
          station: 'Petrom București Nord',
          fuelType: 'Diesel', 
          price: (6.95 + Math.random() * 0.5).toFixed(2),
          priceChange: '+0.02',
          location: { lat: 44.4268, lng: 26.1025 },
          distance: '1.8 km',
          amenities: ['Car Wash', 'Shop'],
          timestamp: new Date()
        },
        {
          id: '3',
          station: 'Rompetrol Constanța',
          fuelType: 'Diesel',
          price: (6.78 + Math.random() * 0.5).toFixed(2),
          priceChange: '-0.07',
          location: { lat: 44.1598, lng: 28.6348 },
          distance: '0.9 km',
          amenities: ['Restaurant', 'Parking'],
          timestamp: new Date()
        }
      ];
    }

    // System alerts (mock data)
    if (type === 'all' || type === 'alerts') {
      realTimeData.systemAlerts = [
        {
          id: '1',
          type: 'maintenance',
          category: 'scheduled',
          message: 'Vehicle BV-123-ABC requires scheduled maintenance in 3 days',
          vehicleId: 'VH-1001',
          severity: 'medium',
          priority: 'normal',
          resolved: false,
          estimatedCost: '€450',
          serviceDue: 'Oil change, brake inspection',
          timestamp: new Date(Date.now() - 600000) // 10 minutes ago
        },
        {
          id: '2',
          type: 'fuel',
          category: 'critical',
          message: 'Low fuel alert for vehicle CT-456-DEF (12% remaining)',
          vehicleId: 'VH-1003',
          severity: 'high',
          priority: 'urgent',
          resolved: false,
          fuelLevel: '12%',
          estimatedRange: '45 km',
          nearestStation: 'OMV - 2.3 km',
          timestamp: new Date(Date.now() - 300000) // 5 minutes ago
        },
        {
          id: '3',
          type: 'route',
          category: 'optimization',
          message: 'Route optimization available - save 25 minutes and €12 fuel',
          vehicleId: 'VH-1005',
          severity: 'low',
          priority: 'info',
          resolved: false,
          savings: { time: '25 min', fuel: '€12', distance: '15 km' },
          timestamp: new Date(Date.now() - 120000) // 2 minutes ago
        }
      ];
    }

    // Live metrics calculation
    const liveMetrics = {
      activeVehicles: Math.floor(Math.random() * 50) + 25, // 25-75 vehicles  
      ongoingTrips: Math.floor(Math.random() * 30) + 10, // 10-40 trips
      fuelEfficiency: parseFloat((7.2 + Math.random() * 2).toFixed(1)), // 7.2-9.2 L/100km
      averageSpeed: Math.floor(Math.random() * 30) + 50, // 50-80 km/h
      alertsCount: Math.floor(Math.random() * 15) + 3, // 3-18 alerts
      complianceStatus: Math.floor(Math.random() * 10) + 90, // 90-100%
      totalDistance: Math.floor(Math.random() * 5000) + 2000, // km today
      fuelConsumed: Math.floor(Math.random() * 500) + 200, // liters today
      co2Emissions: Math.floor(Math.random() * 1200) + 500, // kg today
      onTimeDeliveries: Math.floor(Math.random() * 10) + 85 // 85-95%
    };

    // Integration status (mock realistic connectivity)
    const integrationStatus = {
      freight: Math.random() > 0.1, // 90% uptime
      gps: Math.random() > 0.05, // 95% uptime  
      mapping: Math.random() > 0.05, // 95% uptime
      weather: Math.random() > 0.1, // 90% uptime
      traffic: Math.random() > 0.1, // 90% uptime
      communication: Math.random() > 0.05, // 95% uptime
      fuel: Math.random() > 0.15, // 85% uptime
      compliance: Math.random() > 0.1, // 90% uptime
      maintenance: Math.random() > 0.12, // 88% uptime
      financial: Math.random() > 0.08, // 92% uptime
      telematics: Math.random() > 0.05, // 95% uptime
      cargo: Math.random() > 0.15 // 85% uptime
    };

    // Performance stats
    const performanceStats = {
      apiResponseTime: Math.floor(Math.random() * 100) + 50, // 50-150ms
      dataFreshness: Math.floor(Math.random() * 30) + 10, // 10-40 seconds
      systemHealth: Math.floor(Math.random() * 15) + 85, // 85-100%
      lastUpdate: new Date(),
      totalRequests: Math.floor(Math.random() * 10000) + 5000,
      successRate: parseFloat((95 + Math.random() * 5).toFixed(1)) // 95-100%
    };

    return NextResponse.json({
      success: true,
      data: {
        ...realTimeData,
        liveMetrics,
        integrationStatus,
        performanceStats
      },
      metadata: {
        type,
        fleetId,
        limit,
        recordsReturned: Object.keys(realTimeData).reduce((sum, key) => {
          const data = realTimeData[key];
          return sum + (Array.isArray(data) ? data.length : 1);
        }, 0),
        timestamp: new Date(),
        responseTime: Math.floor(Math.random() * 100) + 50
      },
      message: 'Real-time data retrieved successfully'
    });

  } catch (error) {
    console.error('Real-time API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch real-time data',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: {
        type: 'api_error',
        timestamp: new Date(),
        suggestion: 'Check API configuration and try again',
        errorCode: 'RT_001'
      },
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Update real-time data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data, vehicleId, fleetId } = body;

    if (!type || !data) {
      return NextResponse.json({
        success: false,
        error: 'Type and data are required',
        details: {
          received: { type, hasData: !!data, vehicleId, fleetId },
          expected: 'type (string) and data (object) are required fields'
        },
        timestamp: new Date()
      }, { status: 400 });
    }

    // Mock update operations with realistic responses
    let result;
    switch (type) {
      case 'tracking':
        result = {
          id: `track-${Date.now()}`,
          vehicleId,
          fleetId,
          location: data.location,
          speed: data.speed,
          heading: data.heading || Math.floor(Math.random() * 360),
          status: data.status || 'moving',
          fuel: data.fuel || Math.floor(Math.random() * 100),
          odometer: data.odometer || Math.floor(Math.random() * 100000),
          timestamp: new Date()
        };
        break;

      case 'alert':
        result = {
          id: `alert-${Date.now()}`,
          type: data.type,
          message: data.message,
          vehicleId,
          fleetId,
          severity: data.severity || 'medium',
          resolved: false,
          acknowledgedBy: null,
          timestamp: new Date()
        };
        break;

      case 'fuel':
        result = {
          id: `fuel-${Date.now()}`,
          vehicleId,
          station: data.station,
          fuelType: data.fuelType || 'Diesel',
          amount: data.amount,
          cost: data.cost,
          pricePerLiter: data.pricePerLiter,
          odometer: data.odometer,
          timestamp: new Date()
        };
        break;

      default:
        result = { 
          id: `${type}-${Date.now()}`,
          ...data, 
          vehicleId,
          fleetId,
          timestamp: new Date() 
        };
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `${type} data updated successfully`,
      metadata: {
        operation: 'create',
        type,
        vehicleId,
        fleetId,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Real-time update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update real-time data',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: {
        type: 'update_error',
        timestamp: new Date(),
        errorCode: 'RT_002'
      },
      timestamp: new Date()
    }, { status: 500 });
  }
}
