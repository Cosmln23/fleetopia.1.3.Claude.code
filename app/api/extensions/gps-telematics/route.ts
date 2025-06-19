import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const provider = searchParams.get('provider') || 'geotab';
    const dataType = searchParams.get('dataType') || 'all';

    // Return mock GPS telematics data
    const mockData = {
      success: true,
      data: {
        vehicleData: [],
        telematicsPoints: [],
        summary: {
          totalVehicles: 0,
          activeVehicles: 0,
          totalMiles: 0,
          avgSpeed: 0
        },
        provider: {
          name: provider,
          status: 'active',
          features: ['gps_tracking', 'vehicle_diagnostics', 'driver_behavior']
        }
      },
      metadata: {
        vehicleId,
        provider,
        dataType,
        timestamp: new Date()
      }
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('GPS Telematics API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch GPS telematics data'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Return mock response for GPS telematics actions
    const mockResponse = {
      success: true,
      message: 'GPS telematics data updated successfully',
      data: {
        vehicleId: body.vehicleId || 'mock-vehicle-id',
        location: body.location || { lat: 0, lng: 0 },
        timestamp: new Date(),
        status: 'updated'
      }
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('GPS Telematics POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update GPS telematics data'
      },
      { status: 500 }
    );
  }
}
