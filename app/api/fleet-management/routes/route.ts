
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Fleet Routes API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fleetId = searchParams.get('fleetId');
    const routeId = searchParams.get('routeId');
    const include = searchParams.get('include')?.split(',') || [];

    if (routeId) {
      // Get specific route
      const route = await prisma.modernRoute.findUnique({
        where: { id: routeId },
        include: {
          modernTrips: include.includes('trips')
        }
      });

      if (!route) {
        return NextResponse.json({
          success: false,
          error: 'Route not found',
          timestamp: new Date()
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: route,
        message: 'Route retrieved successfully',
        timestamp: new Date()
      });
    } else {
      // Get routes for fleet
      const where = fleetId ? { fleetId } : {};
      const routes = await prisma.modernRoute.findMany({
        where,
        include: {
          modernTrips: include.includes('trips') ? { take: 5, orderBy: { startTime: 'desc' } } : false
        },
        orderBy: { createdAt: 'desc' }
      });

      return NextResponse.json({
        success: true,
        data: routes,
        total: routes.length,
        fleetId,
        message: 'Routes retrieved successfully',
        timestamp: new Date()
      });
    }

  } catch (error) {
    console.error('Fleet routes API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch route data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Create new route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      fleetId, 
      name, 
      origin, 
      destination, 
      waypoints,
      provider = 'here'
    } = body;

    if (!fleetId || !name || !origin || !destination) {
      return NextResponse.json({
        success: false,
        error: 'Fleet ID, name, origin, and destination are required',
        timestamp: new Date()
      }, { status: 400 });
    }

    // Mock route calculation
    const mockDistance = Math.floor(Math.random() * 1000) + 100; // 100-1100 km
    const mockDuration = Math.floor(mockDistance / 60 * 60); // Assuming 60 km/h average

    const route = await prisma.modernRoute.create({
      data: {
        fleetId,
        name,
        origin,
        destination,
        waypoints,
        distance: mockDistance,
        duration: mockDuration,
        optimized: false,
        provider,
        status: 'planned'
      }
    });

    return NextResponse.json({
      success: true,
      data: route,
      message: 'Route created successfully',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Route creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create route',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Update route
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      routeId, 
      name,
      origin,
      destination,
      waypoints,
      status,
      optimized
    } = body;

    if (!routeId) {
      return NextResponse.json({
        success: false,
        error: 'Route ID is required',
        timestamp: new Date()
      }, { status: 400 });
    }

    const updateData: any = { updatedAt: new Date() };
    if (name) updateData.name = name;
    if (origin) updateData.origin = origin;
    if (destination) updateData.destination = destination;
    if (waypoints) updateData.waypoints = waypoints;
    if (status) updateData.status = status;
    if (optimized !== undefined) updateData.optimized = optimized;

    // Recalculate distance and duration if route changed
    if (origin || destination || waypoints) {
      updateData.distance = Math.floor(Math.random() * 1000) + 100;
      updateData.duration = Math.floor(updateData.distance / 60 * 60);
    }

    const route = await prisma.modernRoute.update({
      where: { id: routeId },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: route,
      message: 'Route updated successfully',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Route update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update route',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Delete route
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const routeId = searchParams.get('routeId');

    if (!routeId) {
      return NextResponse.json({
        success: false,
        error: 'Route ID is required',
        timestamp: new Date()
      }, { status: 400 });
    }

    await prisma.modernRoute.delete({
      where: { id: routeId }
    });

    return NextResponse.json({
      success: true,
      message: 'Route deleted successfully',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Route deletion error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete route',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}
