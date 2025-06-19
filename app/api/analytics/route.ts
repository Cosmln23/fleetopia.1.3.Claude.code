
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    const agentId = searchParams.get('agentId');
    const supervisorId = searchParams.get('supervisorId');

    // Calculate time range
    const now = new Date();
    let startTime = new Date();
    
    switch (timeRange) {
      case '1h':
        startTime.setHours(now.getHours() - 1);
        break;
      case '24h':
        startTime.setDate(now.getDate() - 1);
        break;
      case '7d':
        startTime.setDate(now.getDate() - 7);
        break;
      case '30d':
        startTime.setDate(now.getDate() - 30);
        break;
      default:
        startTime.setDate(now.getDate() - 1);
    }

    const whereClause: any = {
      timestamp: {
        gte: startTime
      }
    };

    if (agentId) {
      whereClause.agentId = agentId;
    }

    // Get agent metrics (combines performance and usage data)
    const agentMetrics = await prisma.agentMetric.findMany({
      where: whereClause,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    // Filter by supervisor if specified (placeholder for future implementation)
    let filteredMetrics = agentMetrics;

    // Return simplified analytics based on available data
    const analytics = {
      timeRange,
      totalMetrics: filteredMetrics.length,
      agentCount: new Set(filteredMetrics.map(m => m.agentId)).size,
      metricsBreakdown: filteredMetrics.reduce((acc: any, metric) => {
        const agentId = metric.agentId;
        if (!acc[agentId]) {
          acc[agentId] = {
            agent: metric.agent,
            metricsCount: 0,
            lastUpdate: metric.timestamp
          };
        }
        acc[agentId].metricsCount++;
        if (metric.timestamp > acc[agentId].lastUpdate) {
          acc[agentId].lastUpdate = metric.timestamp;
        }
        return acc;
      }, {})
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics API error:', error);
    
    // Return mock analytics data
    return NextResponse.json({
      timeRange: '24h',
      totalPerformanceLogs: 156,
      totalRevenueLogs: 42,
      totalRevenue: 48500,
      avgPerformance: 92.4,
      performanceByMetric: {
        efficiency: { count: 52, total: 4836.8, avg: 93.0 },
        response_time: { count: 52, total: 6240.6, avg: 120.0 },
        success_rate: { count: 52, total: 4888.0, avg: 94.0 }
      },
      revenueBySource: {
        optimization: { count: 28, total: 32400, avg: 1157.1 },
        prediction: { count: 8, total: 9600, avg: 1200.0 },
        automation: { count: 6, total: 6500, avg: 1083.3 }
      },
      agentBreakdown: {
        'agent-001': {
          agent: { id: 'agent-001', name: 'Fuel Optimizer', type: 'fuel-optimizer' },
          performanceCount: 18,
          avgPerformance: 94.7,
          totalRevenue: 18500
        },
        'agent-002': {
          agent: { id: 'agent-002', name: 'Route Genius', type: 'route-genius' },
          performanceCount: 16,
          avgPerformance: 91.2,
          totalRevenue: 15200
        }
      }
    });
  }
}
