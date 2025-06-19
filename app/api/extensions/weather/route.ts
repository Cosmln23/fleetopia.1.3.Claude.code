import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'openweathermap';
    const location = searchParams.get('location');
    const includeForecasts = searchParams.get('includeForecasts') === 'true';

    // Return mock weather data
    const mockData = {
      success: true,
      data: {
        currentWeather: {},
        forecasts: [],
        alerts: [],
        summary: {
          temperature: 0,
          condition: 'clear',
          visibility: 10,
          roadRisk: 'low'
        },
        provider: {
          name: provider,
          status: 'active',
          features: ['current_conditions', 'forecasts', 'severe_weather_alerts', 'road_conditions']
        }
      },
      metadata: {
        location,
        provider,
        includeForecasts,
        timestamp: new Date()
      }
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch weather data'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Return mock response for weather actions
    const mockResponse = {
      success: true,
      message: 'Weather alert configured successfully',
      data: {
        alertId: 'mock-alert-id',
        location: body.location || 'mock-location',
        provider: body.provider || 'openweathermap',
        status: 'active',
        timestamp: new Date()
      }
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Weather POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to configure weather alert'
      },
      { status: 500 }
    );
  }
}
