export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';

// Fleet Management API - Main fleet operations with mock data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fleetId = searchParams.get('fleetId');
    const include = searchParams.get('include')?.split(',') || [];

    // Mock fleet data
    const mockFleets = [
      {
        id: 'fleet-001',
        name: 'FleetOpia Main Fleet',
        description: 'Primary logistics fleet for urban deliveries',
        ownerId: 'owner-001',
        status: 'active',
        createdAt: '2024-01-15T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        vehicles: [
          {
            id: 'vehicle-001',
            licensePlate: 'B-100-FOA',
            model: 'Mercedes Sprinter',
            type: 'van',
            status: 'active',
            capacity: 3500,
            year: 2022
          },
          {
            id: 'vehicle-002',
            licensePlate: 'B-101-FOA',
            model: 'Volvo FH16',
            type: 'truck',
            status: 'active',
            capacity: 40000,
            year: 2023
          },
          {
            id: 'vehicle-003',
            licensePlate: 'B-102-FOA',
            model: 'Iveco Daily',
            type: 'van',
            status: 'maintenance',
            capacity: 2800,
            year: 2021
          }
        ],
        drivers: [
          {
            id: 'driver-001',
            name: 'Alexandru Popescu',
            licenseNumber: 'RO123456789',
            experience: '8 years',
            status: 'active',
            rating: 4.8
          },
          {
            id: 'driver-002',
            name: 'Maria Ionescu',
            licenseNumber: 'RO987654321',
            experience: '5 years',
            status: 'active',
            rating: 4.9
          },
          {
            id: 'driver-003',
            name: 'Gheorghe Diaconu',
            licenseNumber: 'RO555666777',
            experience: '12 years',
            status: 'on_leave',
            rating: 4.7
          }
        ],
        routes: [
          {
            id: 'route-001',
            name: 'București - Ploiești',
            distance: 60,
            estimatedTime: 90,
            difficulty: 'medium',
            status: 'active'
          },
          {
            id: 'route-002',
            name: 'Timișoara - Arad',
            distance: 45,
            estimatedTime: 60,
            difficulty: 'easy',
            status: 'active'
          }
        ]
      },
      {
        id: 'fleet-002',
        name: 'FleetOpia Express',
        description: 'Fast delivery fleet for same-day shipping',
        ownerId: 'owner-002',
        status: 'active',
        createdAt: '2024-02-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        vehicles: [
          {
            id: 'vehicle-004',
            licensePlate: 'CJ-200-FOE',
            model: 'Ford Transit',
            type: 'van',
            status: 'active',
            capacity: 2500,
            year: 2023
          },
          {
            id: 'vehicle-005',
            licensePlate: 'TM-300-FOE',
            model: 'Renault Master',
            type: 'van',
            status: 'active',
            capacity: 3000,
            year: 2022
          }
        ],
        drivers: [
          {
            id: 'driver-004',
            name: 'Daniel Marin',
            licenseNumber: 'RO111222333',
            experience: '3 years',
            status: 'active',
            rating: 4.6
          },
          {
            id: 'driver-005',
            name: 'Andreea Stan',
            licenseNumber: 'RO444555666',
            experience: '6 years',
            status: 'active',
            rating: 4.8
          }
        ],
        routes: [
          {
            id: 'route-003',
            name: 'Cluj-Napoca city routes',
            distance: 25,
            estimatedTime: 45,
            difficulty: 'easy',
            status: 'active'
          }
        ]
      },
      {
        id: 'fleet-003',
        name: 'FleetOpia Heavy Cargo',
        description: 'Specialized fleet for heavy and oversized cargo',
        ownerId: 'owner-003',
        status: 'active',
        createdAt: '2024-03-01T00:00:00.000Z',
        updatedAt: new Date().toISOString(),
        vehicles: [
          {
            id: 'vehicle-006',
            licensePlate: 'CT-400-FOH',
            model: 'MAN TGX',
            type: 'heavy_truck',
            status: 'active',
            capacity: 60000,
            year: 2023
          }
        ],
        drivers: [
          {
            id: 'driver-006',
            name: 'Ion Vasile',
            licenseNumber: 'RO777888999',
            experience: '15 years',
            status: 'active',
            rating: 4.9
          }
        ],
        routes: [
          {
            id: 'route-004',
            name: 'Constanța - București Heavy Route',
            distance: 225,
            estimatedTime: 300,
            difficulty: 'hard',
            status: 'active'
          }
        ]
      }
    ];

    if (fleetId) {
      // Get specific fleet
      const fleet = mockFleets.find(f => f.id === fleetId);

      if (!fleet) {
        return NextResponse.json({
          success: false,
          error: 'Fleet not found',
          timestamp: new Date()
        }, { status: 404 });
      }

      // Filter included data based on include parameter
      const responseFleet: any = { ...fleet };
      if (!include.includes('vehicles')) delete responseFleet.vehicles;
      if (!include.includes('drivers')) delete responseFleet.drivers;
      if (!include.includes('routes')) delete responseFleet.routes;

      return NextResponse.json({
        success: true,
        data: responseFleet,
        message: 'Fleet retrieved successfully',
        timestamp: new Date()
      });
    } else {
      // Get all fleets
      const responseFleets = mockFleets.map(fleet => {
        const responseFleet: any = { ...fleet };
        if (!include.includes('vehicles')) delete responseFleet.vehicles;
        if (!include.includes('drivers')) delete responseFleet.drivers;
        if (!include.includes('routes')) delete responseFleet.routes;
        return responseFleet;
      });

      return NextResponse.json({
        success: true,
        data: responseFleets,
        total: responseFleets.length,
        message: 'Fleets retrieved successfully',
        metadata: {
          totalVehicles: mockFleets.reduce((sum, fleet) => sum + fleet.vehicles.length, 0),
          totalDrivers: mockFleets.reduce((sum, fleet) => sum + fleet.drivers.length, 0),
          totalRoutes: mockFleets.reduce((sum, fleet) => sum + fleet.routes.length, 0),
          activeFleets: mockFleets.filter(f => f.status === 'active').length
        },
        timestamp: new Date()
      });
    }

  } catch (error) {
    console.error('Fleet management API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch fleet data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Create new fleet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, ownerId } = body;

    if (!name || !ownerId) {
      return NextResponse.json({
        success: false,
        error: 'Name and owner ID are required',
        timestamp: new Date()
      }, { status: 400 });
    }

    // Mock fleet creation
    const newFleet = {
      id: `fleet-${Date.now()}`,
      name,
      description,
      ownerId,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      vehicles: [],
      drivers: [],
      routes: []
    };

    return NextResponse.json({
      success: true,
      data: newFleet,
      message: 'Fleet created successfully (mock)',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Fleet creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create fleet',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Update fleet
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { fleetId, name, description, status } = body;

    if (!fleetId) {
      return NextResponse.json({
        success: false,
        error: 'Fleet ID is required',
        timestamp: new Date()
      }, { status: 400 });
    }

    // Mock fleet update
    const updatedFleet = {
      id: fleetId,
      name: name || 'Updated Fleet Name',
      description: description || 'Updated description',
      status: status || 'active',
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: updatedFleet,
      message: 'Fleet updated successfully (mock)',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Fleet update error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update fleet',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Delete fleet
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fleetId = searchParams.get('fleetId');

    if (!fleetId) {
      return NextResponse.json({
        success: false,
        error: 'Fleet ID is required',
        timestamp: new Date()
      }, { status: 400 });
    }

    // Mock fleet deletion
    return NextResponse.json({
      success: true,
      message: `Fleet ${fleetId} deleted successfully (mock)`,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Fleet deletion error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete fleet',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}
