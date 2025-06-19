import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'gasbuddy';
    const location = searchParams.get('location');
    const radius = parseInt(searchParams.get('radius') || '10');

    // Return mock fuel data
    const mockData = {
      success: true,
      data: {
        stations: [],
        prices: {
          avgDiesel: 0,
          avgGasoline: 0,
          lowestDiesel: 0,
          highestDiesel: 0
        },
        trends: {
          weekly: 'stable',
          monthly: 'stable'
        },
        provider: {
          name: provider,
          status: 'active',
          features: ['price_monitoring', 'station_locator', 'fuel_tracking']
        }
      },
      metadata: {
        provider,
        location,
        radius,
        timestamp: new Date()
      }
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Fuel API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch fuel data'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Return mock response for fuel actions
    const mockResponse = {
      success: true,
      message: 'Fuel data updated successfully',
      data: {
        transactionId: 'mock-fuel-transaction-id',
        amount: body.amount || 0,
        pricePerGallon: body.pricePerGallon || 0,
        status: 'completed'
      }
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Fuel POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process fuel transaction'
      },
      { status: 500 }
    );
  }
}
