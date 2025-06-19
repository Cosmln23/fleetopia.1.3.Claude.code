import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'tomtom';
    const routeId = searchParams.get('routeId');
    const includeIncidents = searchParams.get('includeIncidents') === 'true';

    // Return mock traffic data
    const mockData = {
      success: true,
      data: {
        trafficConditions: [],
        incidents: [],
        congestionData: [],
        summary: {
          averageSpeed: 0,
          congestionLevel: 'low',
          totalIncidents: 0,
          estimatedDelay: 0
        },
        provider: {
          name: provider,
          status: 'active',
          features: ['real_time_traffic', 'incidents', 'congestion_monitoring', 'route_optimization']
        }
      },
      metadata: {
        routeId,
        provider,
        includeIncidents,
        timestamp: new Date()
      }
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Traffic API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch traffic data'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Return mock response for traffic actions
    const mockResponse = {
      success: true,
      message: 'Traffic data updated successfully',
      data: {
        trafficId: 'mock-traffic-id',
        routeId: body.routeId || 'mock-route-id',
        provider: body.provider || 'tomtom',
        status: 'updated',
        timestamp: new Date()
      }
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Traffic POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update traffic data'
      },
      { status: 500 }
    );
  }
}
