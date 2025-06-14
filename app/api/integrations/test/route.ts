import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// POST - Test API Integration Connection
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { integrationId, testEndpoint } = body;

    if (!integrationId) {
      return NextResponse.json(
        { error: 'Integration ID is required' },
        { status: 400 }
      );
    }

    // Get integration
    const integration = await prisma.aPIIntegration.findFirst({
      where: {
        id: integrationId,
        userId: user.id
      }
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Test the API connection
    const credentials = integration.credentials as any;
    const configuration = integration.configuration as any;
    const baseUrl = configuration.baseUrl || credentials.baseUrl;
    
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'Base URL not configured' },
        { status: 400 }
      );
    }

    const testUrl = testEndpoint ? `${baseUrl}${testEndpoint}` : `${baseUrl}/status`;

    // Prepare headers based on configuration
    const headers: any = {
      'Content-Type': 'application/json',
      'User-Agent': 'FleetMind/1.0'
    };

    // Add custom headers if configured
    if (integration.headers) {
      Object.assign(headers, integration.headers);
    }

    // Add authentication headers
    if (credentials.apiKey) {
      headers['X-API-Key'] = credentials.apiKey;
    }
    
    if (credentials.token) {
      headers['Authorization'] = `Bearer ${credentials.token}`;
    }
    
    if (credentials.username && credentials.password) {
      const basicAuth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
      headers['Authorization'] = `Basic ${basicAuth}`;
    }

    const startTime = Date.now();
    let testResult;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 
        (integration.settings as any)?.timeout * 1000 || 30000);

      const response = await fetch(testUrl, {
        method: 'GET',
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      let responseData;
      try {
        responseData = await response.text();
        // Try to parse as JSON
        responseData = JSON.parse(responseData);
      } catch {
        // Keep as text if not JSON
      }

      if (response.ok) {
        // Update last sync time
        await prisma.aPIIntegration.update({
          where: { id: integrationId },
          data: { 
            lastSync: new Date(),
            lastError: null
          }
        });

        testResult = {
          success: true,
          responseTime,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers),
          data: responseData,
          message: 'Connection successful'
        };
      } else {
        // Update last error
        await prisma.aPIIntegration.update({
          where: { id: integrationId },
          data: { 
            lastError: `HTTP ${response.status}: ${response.statusText}` 
          }
        });

        testResult = {
          success: false,
          responseTime,
          status: response.status,
          statusText: response.statusText,
          data: responseData,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (fetchError: any) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Update last error
      await prisma.aPIIntegration.update({
        where: { id: integrationId },
        data: { 
          lastError: fetchError.message 
        }
      });

      testResult = {
        success: false,
        responseTime,
        error: fetchError.name,
        message: fetchError.message,
        details: fetchError.cause || 'Network or timeout error'
      };
    }

    // Generate test recommendations
    const recommendations = generateTestRecommendations(testResult, integration);

    return NextResponse.json({
      ...testResult,
      integration: {
        id: integration.id,
        name: integration.name,
        type: integration.type,
        provider: integration.provider
      },
      recommendations
    });

  } catch (error) {
    console.error('Error testing integration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get test history for an integration
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integrationId');

    if (!integrationId) {
      return NextResponse.json(
        { error: 'Integration ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get integration with test history (simulated)
    const integration = await prisma.aPIIntegration.findFirst({
      where: {
        id: integrationId,
        userId: user.id
      }
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Generate simulated test history
    const testHistory = generateTestHistory(integration);

    return NextResponse.json({
      integration: {
        id: integration.id,
        name: integration.name,
        type: integration.type,
        provider: integration.provider,
        status: integration.status,
        lastSync: integration.lastSync,
        lastError: integration.lastError
      },
      testHistory
    });

  } catch (error) {
    console.error('Error getting test history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateTestRecommendations(testResult: any, integration: any) {
  const recommendations = [];

  if (!testResult.success) {
    if (testResult.status === 401) {
      recommendations.push({
        type: 'error',
        title: 'Authentication Failed',
        message: 'Check your API credentials and ensure they are valid.',
        action: 'Update credentials'
      });
    } else if (testResult.status === 404) {
      recommendations.push({
        type: 'error',
        title: 'Endpoint Not Found',
        message: 'The API endpoint may be incorrect or the service may be down.',
        action: 'Verify endpoint URL'
      });
    } else if (testResult.status === 429) {
      recommendations.push({
        type: 'warning',
        title: 'Rate Limited',
        message: 'You have exceeded the API rate limit. Consider implementing rate limiting.',
        action: 'Add rate limiting'
      });
    } else if (testResult.error === 'AbortError') {
      recommendations.push({
        type: 'warning',
        title: 'Connection Timeout',
        message: 'The request timed out. Consider increasing the timeout setting.',
        action: 'Increase timeout'
      });
    }
  } else {
    // Success recommendations
    if (testResult.responseTime > 5000) {
      recommendations.push({
        type: 'optimization',
        title: 'Slow Response',
        message: 'API response time is high. Consider caching or using a CDN.',
        action: 'Optimize performance'
      });
    }

    if (!integration.headers || Object.keys(integration.headers).length === 0) {
      recommendations.push({
        type: 'suggestion',
        title: 'Custom Headers',
        message: 'Consider adding custom headers for better API integration.',
        action: 'Add headers'
      });
    }

    recommendations.push({
      type: 'success',
      title: 'Connection Successful',
      message: 'Your API integration is working correctly.',
      action: 'Connect to AI agents'
    });
  }

  return recommendations;
}

function generateTestHistory(integration: any) {
  // Generate simulated test history for the last 30 days
  const history = [];
  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Simulate test results
    const success = Math.random() > 0.1; // 90% success rate
    const responseTime = Math.floor(Math.random() * 3000) + 200;

    history.push({
      date: date.toISOString(),
      success,
      responseTime,
      status: success ? 200 : [400, 401, 404, 500][Math.floor(Math.random() * 4)],
      message: success ? 'Connection successful' : 'Connection failed'
    });
  }

  return history.reverse(); // Chronological order
} 