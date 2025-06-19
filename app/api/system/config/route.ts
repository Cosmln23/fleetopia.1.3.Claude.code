import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const key = searchParams.get('key');
    const includeSecure = searchParams.get('includeSecure') === 'true';

    // Return mock system config data
    const mockData = {
      success: true,
      data: {
        configs: [],
        configDetails: null,
        summary: {
          totalConfigs: 0,
          categories: 0,
          secureConfigs: 0,
          lastUpdated: null
        },
        secureSettings: includeSecure ? {
          encryptionEnabled: true,
          backupEnabled: true,
          auditingEnabled: true
        } : null,
        filters: {
          category,
          key,
          includeSecure
        }
      },
      metadata: {
        category,
        key,
        includeSecure,
        timestamp: new Date()
      }
    };

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('System Config API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch system config data'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Return mock response for config creation
    const mockResponse = {
      success: true,
      message: 'System config created successfully',
      data: {
        configId: 'mock-config-id',
        key: body.key || 'mock-config-key',
        category: body.category || 'general',
        value: body.value || 'mock-value',
        timestamp: new Date()
      }
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('System Config POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create system config'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Return mock response for config update
    const mockResponse = {
      success: true,
      message: 'System config updated successfully',
      data: {
        configId: body.configId || 'mock-config-id',
        key: body.key || 'mock-config-key',
        value: body.value || 'updated-value',
        timestamp: new Date()
      }
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('System Config PUT error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update system config'
      },
      { status: 500 }
    );
  }
}
