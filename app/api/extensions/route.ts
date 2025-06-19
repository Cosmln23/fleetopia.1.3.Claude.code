import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');
    const type = searchParams.get('type');
    const category = searchParams.get('category') || 'all';

    // Return mock extensions data
    const mockData = {
      success: true,
      data: {
        extensions: [],
        integrations: [],
        activeExtensions: [],
        summary: {
          totalExtensions: 0,
          activeCount: 0,
          availableCount: 0,
          categoriesCount: 0
        },
        categories: [
          'communication',
          'compliance', 
          'financial',
          'freight-matching',
          'fuel',
          'gps-telematics',
          'maintenance',
          'mapping',
          'traffic',
          'weather'
        ]
      },
      metadata: {
        provider,
        type,
        category,
        timestamp: new Date()
      }
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Extensions API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch extensions data'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Return mock response for extension actions
    const mockResponse = {
      success: true,
      message: 'Extension configured successfully',
      data: {
        extensionId: 'mock-extension-id',
        name: body.name || 'Mock Extension',
        provider: body.provider || 'mock-provider',
        status: 'active',
        timestamp: new Date()
      }
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Extensions POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to configure extension'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Return mock response for extension updates
    const mockResponse = {
      success: true,
      message: 'Extension updated successfully',
      data: {
        integrationId: body.integrationId || 'mock-integration-id',
        status: body.status || 'updated',
        timestamp: new Date()
      }
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Extensions PUT error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update extension'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integrationId');

    // Return mock response for extension deletion
    const mockResponse = {
      success: true,
      message: 'Extension deleted successfully',
      data: {
        integrationId: integrationId || 'mock-integration-id',
        status: 'deleted',
        timestamp: new Date()
      }
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Extensions DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete extension'
      },
      { status: 500 }
    );
  }
}
