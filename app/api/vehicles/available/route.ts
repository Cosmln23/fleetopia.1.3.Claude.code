import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';



export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    // Get all available vehicles from the global cache
    const availableVehicles = (global as any).availableVehicles || [];
    
    // Only return vehicles if we have any (> 0)
    if (!Array.isArray(availableVehicles) || availableVehicles.length === 0) {
      return NextResponse.json([]);
    }
    
    // Return all available vehicles for now
    // Later we can add filtering by location, type, etc.
    return NextResponse.json(availableVehicles);
  } catch (error) {
    console.warn('Failed to fetch available vehicles:', error);
    // Return empty array instead of error
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { vehicleId, currentLocation, availableRoute, pricePerKm } = body;

    // Verify that the vehicle belongs to the user
    const vehicle = await prisma.vehicle.findFirst({
      where: { 
        id: vehicleId,
        fleet: {
          userId: userId
        }
      },
      include: {
        fleet: {
          include: {
            owner: true
          }
        }
      }
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found or access denied' }, { status: 404 });
    }

    // For now, we'll store the availability in a simple way
    // Later we can add a proper table for this
    const availabilityData = {
      vehicleId: vehicle.id,
      name: vehicle.name,
      type: vehicle.type,
      licensePlate: vehicle.licensePlate,
      driverName: vehicle.driverName,
      currentLocation: currentLocation || 'Current Location',
      availableRoute: availableRoute || 'Available for any destination',
      pricePerKm: pricePerKm || 1.5,
      ownerName: vehicle.fleet.owner.name,
      postedAt: new Date().toISOString(),
      userId: userId
    };

    // For demonstration, we'll store this in a global variable or simple cache
    // In production, this should be in a database table
    (global as any).availableVehicles = (global as any).availableVehicles || [];
    
    // Remove existing entry if any
    (global as any).availableVehicles = (global as any).availableVehicles.filter(
      (av: any) => av.vehicleId !== vehicleId
    );
    
    // Add new entry
    (global as any).availableVehicles.push(availabilityData);

    return NextResponse.json({ 
      success: true, 
      message: 'Vehicle posted as available successfully',
      data: availabilityData 
    });

  } catch (error) {
    console.error('Failed to post vehicle as available:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { vehicleId } = body;

    if (!vehicleId) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    // Remove vehicle from available vehicles list
    (global as any).availableVehicles = (global as any).availableVehicles || [];
    
    const originalLength = (global as any).availableVehicles.length;
    (global as any).availableVehicles = (global as any).availableVehicles.filter(
      (av: any) => av.vehicleId !== vehicleId
    );
    
    const removed = originalLength > (global as any).availableVehicles.length;

    return NextResponse.json({ 
      success: true, 
      message: removed ? 'Vehicle removed from marketplace' : 'Vehicle was not in marketplace',
      removed 
    });

  } catch (error) {
    console.error('Failed to remove vehicle from marketplace:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
