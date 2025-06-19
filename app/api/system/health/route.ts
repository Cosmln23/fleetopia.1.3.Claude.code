import { NextRequest } from 'next/server';
import { createApiHandler, apiResponse } from '@/lib/api-helpers';
import { rateLimiters } from '@/lib/rate-limit';
import { dbHealthCheck, getPerformanceMetrics } from '@/lib/db-utils';
import { cache } from '@/lib/cache';

// GET system health status
export const GET = createApiHandler({
  rateLimiter: rateLimiters.general
})(async ({ req }) => {
  try {
    const url = new URL(req.url);
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

    return apiResponse.success({
      ...health,
      status: overallStatus
    });

  } catch (error) {
    console.error('Health check failed:', error);
    return apiResponse.error('Health check failed', 500);
  }
});

// POST to clear cache (admin operation)
export const POST = createApiHandler({
  rateLimiter: rateLimiters.create
})(async ({ req }) => {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'clear-cache') {
      cache.clear();
      return apiResponse.success({ 
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString()
      });
    }

    return apiResponse.error('Invalid action', 400);

  } catch (error) {
    console.error('Cache management failed:', error);
    return apiResponse.error('Cache management failed', 500);
  }
});
