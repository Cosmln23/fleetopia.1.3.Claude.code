import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service');
    const status = searchParams.get('status');
    const includeMetrics = searchParams.get('includeMetrics') === 'true';

    // Return mock microservices data
    const mockData = {
      success: true,
      data: {
        services: [],
        serviceDetails: null,
        summary: {
          totalServices: 0,
          runningServices: 0,
          healthyServices: 0,
          errorServices: 0
        },
        metrics: includeMetrics ? {
          uptime: '99.9%',
          responseTime: '150ms',
          throughput: '1000 req/sec',
          errorRate: '0.1%'
        } : null,
        filters: {
          service,
          status,
          includeMetrics
        }
      },
      metadata: {
        service,
        status,
        includeMetrics,
        timestamp: new Date()
      }
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Microservices API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch microservices data'
      },
      { status: 500 }
    );
  }
}

// CREATE OR UPDATE MICROSERVICE
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Return mock response for microservice action
    const mockResponse = {
      success: true,
      message: 'Microservice action completed successfully',
      data: {
        serviceId: 'mock-service-id',
        name: body.name || 'Mock Service',
        action: body.action || 'deploy',
        status: 'running',
        timestamp: new Date()
      }
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Microservices POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to execute microservice action'
      },
      { status: 500 }
    );
  }
}
