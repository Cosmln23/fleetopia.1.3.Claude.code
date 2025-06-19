import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const status = searchParams.get('status');
    const includeTelematics = searchParams.get('include')?.includes('telematics') || false;

    // Return mock vehicles data
    const mockData = {
      success: true,
      data: {
        vehicles: [],
        vehicleDetails: null,
        summary: {
          totalVehicles: 0,
          activeVehicles: 0,
          availableVehicles: 0,
          inMaintenanceVehicles: 0
        },
        filters: {
          status,
          includeTelematics
        }
      },
      metadata: {
        vehicleId,
        status,
        includeTelematics,
        timestamp: new Date()
      }
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Vehicles API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch vehicles data'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Return mock response for vehicle creation
    const mockResponse = {
      success: true,
      message: 'Vehicle created successfully',
      data: {
        vehicleId: 'mock-vehicle-id',
        make: body.make || 'Mock Make',
        model: body.model || 'Mock Model',
        licensePlate: body.licensePlate || 'MOCK-123',
        status: 'active',
        timestamp: new Date()
      }
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Vehicles POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create vehicle'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Return mock response for vehicle update
    const mockResponse = {
      success: true,
      message: 'Vehicle updated successfully',
      data: {
        vehicleId: body.vehicleId || 'mock-vehicle-id',
        status: body.status || 'updated',
        timestamp: new Date()
      }
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Vehicles PUT error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update vehicle'
      },
      { status: 500 }
    );
  }
}
