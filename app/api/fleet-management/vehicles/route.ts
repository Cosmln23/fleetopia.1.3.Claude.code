
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Fleet Vehicles API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fleetId = searchParams.get('fleetId');
    const vehicleId = searchParams.get('vehicleId');
    const include = searchParams.get('include')?.split(',') || [];

    if (vehicleId) {
      // Get specific vehicle
      const vehicle = await prisma.modernVehicle.findUnique({
        where: { id: vehicleId },
        include: {
          telematics: include.includes('telematics'),
          maintenanceRecords: include.includes('maintenance'),
          fuelRecords: include.includes('fuel'),
          modernTrips: include.includes('trips'),
          alerts: include.includes('alerts')
        }
      });

      if (!vehicle) {
        return NextResponse.json({
          success: false,
          error: 'Vehicle not found',
          timestamp: new Date()
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: vehicle,
        message: 'Vehicle retrieved successfully',
        timestamp: new Date()
      });
    } else {
      // Get vehicles for fleet
      const where = fleetId ? { fleetId } : {};
      const vehicles = await prisma.modernVehicle.findMany({
        where,
        include: {
          telematics: include.includes('telematics') ? { take: 1, orderBy: { timestamp: 'desc' } } : false,
          maintenanceRecords: include.includes('maintenance') ? { take: 5, orderBy: { serviceDate: 'desc' } } : false,
          fuelRecords: include.includes('fuel') ? { take: 5, orderBy: { timestamp: 'desc' } } : false,
          alerts: include.includes('alerts') ? { where: { resolved: false } } : false
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({
        success: true,
        data: vehicles,
        total: vehicles.length,
        fleetId,
        message: 'Vehicles retrieved successfully',
        timestamp: new Date()
      });
    }

  } catch (error) {
    console.error('Fleet vehicles API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch vehicle data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Add vehicle to fleet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      fleetId, 
      vin, 
      licensePlate, 
      make, 
      model, 
      year, 
      type 
    } = body;

    if (!fleetId || !vin || !licensePlate || !make || !model || !year || !type) {
      return NextResponse.json({
        success: false,
        error: 'All vehicle details are required',
        timestamp: new Date()
      }, { status: 400 });
    }

    const vehicle = await prisma.modernVehicle.create({
      data: {
        fleetId,
        vin,
        licensePlate,
        make,
        model,
        year,
        type,
        status: 'active',
        fuelLevel: 100,
        odometer: 0
      }
    });

    return NextResponse.json({
      success: true,
      data: vehicle,
      message: 'Vehicle added to fleet successfully',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Vehicle creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add vehicle',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Update vehicle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      vehicleId, 
      status, 
      currentLocation, 
      fuelLevel, 
      odometer,
      lastMaintenance,
      nextMaintenance
    } = body;

    if (!vehicleId) {
      return NextResponse.json({
        success: false,
        error: 'Vehicle ID is required',
        timestamp: new Date()
      }, { status: 400 });
    }

    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (currentLocation) updateData.currentLocation = currentLocation;
    if (fuelLevel !== undefined) updateData.fuelLevel = fuelLevel;
    if (odometer !== undefined) updateData.odometer = odometer;
    if (lastMaintenance) updateData.lastMaintenance = new Date(lastMaintenance);
    if (nextMaintenance) updateData.nextMaintenance = new Date(nextMaintenance);

    const vehicle = await prisma.modernVehicle.update({
      where: { id: vehicleId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: vehicle,
      message: 'Vehicle updated successfully',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Vehicle update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update vehicle',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Remove vehicle from fleet
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');

    if (!vehicleId) {
      return NextResponse.json({
        success: false,
        error: 'Vehicle ID is required',
        timestamp: new Date()
      }, { status: 400 });
    }

    await prisma.modernVehicle.delete({
      where: { id: vehicleId }
    });

    return NextResponse.json({
      success: true,
      message: 'Vehicle removed from fleet successfully',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Vehicle deletion error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to remove vehicle',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}
