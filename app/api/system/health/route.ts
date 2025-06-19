import { NextRequest, NextResponse } from 'next/server';
import { dbHealthCheck, getPerformanceMetrics } from '@/lib/db-utils';
import { cache } from '@/lib/cache';

// GET system health status
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const includeMetrics = url.searchParams.get('metrics') === 'true';

    // Basic health check
    const dbHealth = await dbHealthCheck();
    const cacheStats = cache.stats();

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      cache: {
        ...cacheStats,
        status: 'healthy'
      },
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
        unit: 'MB'
      }
    };

    // Add performance metrics if requested
    if (includeMetrics) {
      const performanceMetrics = await getPerformanceMetrics();
      (health as any).performance = performanceMetrics;
    }

    // Determine overall health status
    const overallStatus = dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy';

    return NextResponse.json({
      success: true,
      data: {
        ...health,
        status: overallStatus
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    );
  }
}

// POST to clear cache (admin operation)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'clear-cache') {
      cache.clear();
      return NextResponse.json({ 
        success: true,
        data: {
          message: 'Cache cleared successfully',
          timestamp: new Date().toISOString()
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Cache management failed:', error);
    return NextResponse.json(
      { error: 'Cache management failed' },
      { status: 500 }
    );
  }
}
