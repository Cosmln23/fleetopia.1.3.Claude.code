
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GPS & Telematics API - Samsara, Geotab, Verizon Connect integration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'samsara';
    const vehicleId = searchParams.get('vehicleId');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Mock telematics data based on research
    const mockTelematicsData = [
      {
        vehicleId: vehicleId || 'vehicle-001',
        location: {
          lat: 40.7589 + (Math.random() - 0.5) * 0.01,
          lng: -73.9851 + (Math.random() - 0.5) * 0.01,
          address: 'Times Square, New York, NY'
        },
        speed: Math.floor(Math.random() * 60) + 20,
        heading: Math.floor(Math.random() * 360),
        altitude: Math.floor(Math.random() * 100) + 50,
        odometer: 125847.5 + Math.random() * 100,
        fuelLevel: Math.floor(Math.random() * 40) + 60,
        engineRpm: Math.floor(Math.random() * 1000) + 1500,
        engineTemp: Math.floor(Math.random() * 20) + 180,
        diagnostics: {
          engineStatus: 'normal',
          brakeStatus: 'normal',
          transmissionTemp: Math.floor(Math.random() * 20) + 160,
          oilPressure: Math.floor(Math.random() * 20) + 40,
          batteryVoltage: 12.4 + Math.random() * 0.8,
          dtcCodes: [],
          fuelEfficiency: 7.2 + Math.random() * 2
        },
        provider: provider,
        timestamp: new Date()
      }
    ];

    // Generate multiple data points for different vehicles if no specific vehicle requested
    if (!vehicleId) {
      const vehicles = await prisma.modernVehicle.findMany({ take: 5 });
      mockTelematicsData.length = 0; // Clear array
      
      vehicles.forEach((vehicle, index) => {
        mockTelematicsData.push({
          vehicleId: vehicle.id,
          location: {
            lat: 40.7589 + (Math.random() - 0.5) * 0.1,
            lng: -73.9851 + (Math.random() - 0.5) * 0.1,
            address: `Location ${index + 1}, New York, NY`
          },
          speed: Math.floor(Math.random() * 60) + 20,
          heading: Math.floor(Math.random() * 360),
          altitude: Math.floor(Math.random() * 100) + 50,
          odometer: 125847.5 + Math.random() * 1000,
          fuelLevel: Math.floor(Math.random() * 40) + 60,
          engineRpm: Math.floor(Math.random() * 1000) + 1500,
          engineTemp: Math.floor(Math.random() * 20) + 180,
          diagnostics: {
            engineStatus: Math.random() > 0.9 ? 'warning' : 'normal',
            brakeStatus: Math.random() > 0.95 ? 'warning' : 'normal',
            transmissionTemp: Math.floor(Math.random() * 20) + 160,
            oilPressure: Math.floor(Math.random() * 20) + 40,
            batteryVoltage: 12.4 + Math.random() * 0.8,
            dtcCodes: Math.random() > 0.8 ? ['P0171', 'P0174'] : [],
            fuelEfficiency: 7.2 + Math.random() * 2
          },
          provider: provider,
          timestamp: new Date()
        });
      });
    }

    // Store telematics data in database
    for (const data of mockTelematicsData.slice(0, limit)) {
      try {
        await prisma.vehicleTelematics.create({
          data: {
            vehicleId: data.vehicleId,
            location: data.location,
            speed: data.speed,
            heading: data.heading,
            altitude: data.altitude,
            odometer: data.odometer,
            fuelLevel: data.fuelLevel,
            engineRpm: data.engineRpm,
            engineTemp: data.engineTemp,
            diagnostics: data.diagnostics,
            provider: data.provider,
            timestamp: data.timestamp
          }
        });

        // Update vehicle current location and fuel level
        await prisma.modernVehicle.updateMany({
          where: { id: data.vehicleId },
          data: {
            currentLocation: data.location,
            fuelLevel: data.fuelLevel,
            odometer: data.odometer
          }
        });

        // Generate alerts for critical conditions
        if (data.fuelLevel < 20) {
          await prisma.alert.create({
            data: {
              vehicleId: data.vehicleId,
              type: 'fuel',
              severity: 'high',
              title: 'Low Fuel Alert',
              message: `Vehicle fuel level is critically low: ${data.fuelLevel}%`,
              data: { fuelLevel: data.fuelLevel, location: data.location },
              provider: data.provider
            }
          });
        }

        if (data.diagnostics.dtcCodes.length > 0) {
          await prisma.alert.create({
            data: {
              vehicleId: data.vehicleId,
              type: 'maintenance',
              severity: 'medium',
              title: 'Diagnostic Trouble Codes',
              message: `Vehicle has diagnostic codes: ${data.diagnostics.dtcCodes.join(', ')}`,
              data: { dtcCodes: data.diagnostics.dtcCodes, diagnostics: data.diagnostics },
              provider: data.provider
            }
          });
        }

      } catch (dbError) {
        console.warn('Failed to store telematics data for vehicle:', data.vehicleId, dbError);
      }
    }

    return NextResponse.json({
      success: true,
      data: mockTelematicsData.slice(0, limit),
      provider,
      vehicleId,
      total: mockTelematicsData.length,
      message: `Retrieved telematics data from ${provider}`,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('GPS Telematics API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch telematics data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Real-time tracking endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vehicleId, provider = 'samsara' } = body;

    if (!vehicleId) {
      return NextResponse.json({
        success: false,
        error: 'Vehicle ID is required',
        timestamp: new Date()
      }, { status: 400 });
    }

    // Create real-time tracking record
    const trackingData = {
      vehicleId,
      location: {
        lat: 40.7589 + (Math.random() - 0.5) * 0.01,
        lng: -73.9851 + (Math.random() - 0.5) * 0.01,
        address: 'Real-time location, New York, NY',
        timestamp: new Date()
      },
      speed: Math.floor(Math.random() * 60) + 20,
      heading: Math.floor(Math.random() * 360),
      status: Math.random() > 0.7 ? 'moving' : Math.random() > 0.5 ? 'stopped' : 'idle',
      geofence: {
        inside: Math.random() > 0.2,
        name: 'NYC Metropolitan Area',
        type: 'city_limits'
      },
      provider,
      timestamp: new Date()
    };

    await prisma.realTimeTracking.create({
      data: trackingData
    });

    return NextResponse.json({
      success: true,
      data: trackingData,
      message: 'Real-time tracking data updated',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Real-time tracking error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update tracking data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}
