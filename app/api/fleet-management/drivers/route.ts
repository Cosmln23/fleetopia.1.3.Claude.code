
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Fleet Drivers API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fleetId = searchParams.get('fleetId');
    const driverId = searchParams.get('driverId');
    const include = searchParams.get('include')?.split(',') || [];

    if (driverId) {
      // Get specific driver
      const driver = await prisma.modernDriver.findUnique({
        where: { id: driverId },
        include: {
          modernTrips: include.includes('trips'),
          alerts: include.includes('alerts') ? { where: { resolved: false } } : false
        }
      });

      if (!driver) {
        return NextResponse.json({
          success: false,
          error: 'Driver not found',
          timestamp: new Date()
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: driver,
        message: 'Driver retrieved successfully',
        timestamp: new Date()
      });
    } else {
      // Get drivers for fleet
      const where = fleetId ? { fleetId } : {};
      const drivers = await prisma.modernDriver.findMany({
        where,
        include: {
          modernTrips: include.includes('trips') ? { take: 5, orderBy: { startTime: 'desc' } } : false,
          alerts: include.includes('alerts') ? { where: { resolved: false } } : false
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({
        success: true,
        data: drivers,
        total: drivers.length,
        fleetId,
        message: 'Drivers retrieved successfully',
        timestamp: new Date()
      });
    }

  } catch (error) {
    console.error('Fleet drivers API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch driver data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Add driver to fleet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      fleetId, 
      firstName, 
      lastName, 
      email, 
      phone, 
      licenseNumber, 
      licenseExpiry 
    } = body;

    if (!fleetId || !firstName || !lastName || !email || !licenseNumber || !licenseExpiry) {
      return NextResponse.json({
        success: false,
        error: 'All driver details are required',
        timestamp: new Date()
      }, { status: 400 });
    }

    const driver = await prisma.modernDriver.create({
      data: {
        fleetId,
        firstName,
        lastName,
        email,
        phone,
        licenseNumber,
        licenseExpiry: new Date(licenseExpiry),
        status: 'active',
        hoursWorked: 0
      }
    });

    return NextResponse.json({
      success: true,
      data: driver,
      message: 'Driver added to fleet successfully',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Driver creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add driver',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Update driver
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      driverId, 
      status, 
      currentLocation, 
      hoursWorked,
      phone,
      licenseExpiry
    } = body;

    if (!driverId) {
      return NextResponse.json({
        success: false,
        error: 'Driver ID is required',
        timestamp: new Date()
      }, { status: 400 });
    }

    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (currentLocation) updateData.currentLocation = currentLocation;
    if (hoursWorked !== undefined) updateData.hoursWorked = hoursWorked;
    if (phone) updateData.phone = phone;
    if (licenseExpiry) updateData.licenseExpiry = new Date(licenseExpiry);

    const driver = await prisma.modernDriver.update({
      where: { id: driverId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: driver,
      message: 'Driver updated successfully',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Driver update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update driver',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Remove driver from fleet
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');

    if (!driverId) {
      return NextResponse.json({
        success: false,
        error: 'Driver ID is required',
        timestamp: new Date()
      }, { status: 400 });
    }

    await prisma.modernDriver.delete({
      where: { id: driverId }
    });

    return NextResponse.json({
      success: true,
      message: 'Driver removed from fleet successfully',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Driver deletion error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to remove driver',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}
