import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    // Return mock responses for all actions
    const mockResponse = {
      success: true,
      action,
      timestamp: new Date(),
      result: {
        prediction: "Mock delivery prediction",
        estimatedTime: 30,
        confidence: 90
      },
      metadata: {
        processingTime: 100,
        features_used: ['mock-feature']
      }
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Delivery Predictor API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Processing failed',
        timestamp: new Date()
      }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';

    const mockResponse = {
      success: true,
      action,
      timestamp: new Date(),
      result: {
        status: 'active',
        agent: 'DeliveryPredictor',
        version: '3.0.1'
      }
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Delivery Predictor GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Request failed',
        timestamp: new Date()
      }, 
      { status: 500 }
    );
  }
} 