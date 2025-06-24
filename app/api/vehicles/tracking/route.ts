import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { vehicleTrackingService } from '@/lib/services/vehicle-tracking-service';

export const dynamic = 'force-dynamic';

// GET /api/vehicles/tracking - Get real-time fleet status
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize tracking service if needed
    await vehicleTrackingService.initialize();

    // Get fleet status
    const fleetStatus = await vehicleTrackingService.getFleetStatus(userId);
    const stats = vehicleTrackingService.getTrackingStats();

    return NextResponse.json({
      success: true,
      data: {
        vehicles: fleetStatus,
        stats: {
          totalVehicles: fleetStatus.length,
          activeTracking: stats.activeVehicles,
          providersAvailable: stats.totalProviders
        }
      }
    });
  } catch (error) {
    console.error('Failed to get vehicle tracking data:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// POST /api/vehicles/tracking - Enable/disable tracking for a vehicle
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { vehicleId, action, gpsProvider } = body;

    if (!vehicleId || !action) {
      return NextResponse.json(
        { error: 'Vehicle ID and action are required' },
        { status: 400 }
      );
    }

    // Initialize tracking service if needed
    await vehicleTrackingService.initialize();

    let success = false;

    if (action === 'enable') {
      if (!gpsProvider) {
        return NextResponse.json(
          { error: 'GPS provider is required to enable tracking' },
          { status: 400 }
        );
      }
      success = await vehicleTrackingService.enableVehicleTracking(vehicleId, gpsProvider, userId);
    } else if (action === 'disable') {
      success = await vehicleTrackingService.disableVehicleTracking(vehicleId);
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "enable" or "disable"' },
        { status: 400 }
      );
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Vehicle tracking ${action}d successfully`
      });
    } else {
      return NextResponse.json(
        { error: `Failed to ${action} vehicle tracking` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Failed to update vehicle tracking:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}