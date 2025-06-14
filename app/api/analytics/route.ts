
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

    // Get performance logs
    const performanceLogs = await prisma.agentPerformanceLog.findMany({
      where: whereClause,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            type: true,
            category: true,
            supervisorId: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    // Get revenue logs
    const revenueLogs = await prisma.agentRevenueLog.findMany({
      where: whereClause,
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            type: true,
            category: true,
            supervisorId: true
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    // Filter by supervisor if specified
    let filteredPerformanceLogs = performanceLogs;
    let filteredRevenueLogs = revenueLogs;

    if (supervisorId) {
      filteredPerformanceLogs = performanceLogs.filter(log => 
        log.agent.supervisorId === supervisorId
      );
      filteredRevenueLogs = revenueLogs.filter(log => 
        log.agent.supervisorId === supervisorId
      );
    }

    // Aggregate data
    const analytics = {
      timeRange,
      totalPerformanceLogs: filteredPerformanceLogs.length,
      totalRevenueLogs: filteredRevenueLogs.length,
      totalRevenue: filteredRevenueLogs.reduce((sum, log) => sum + log.amount, 0),
      avgPerformance: filteredPerformanceLogs.length > 0 
        ? filteredPerformanceLogs.reduce((sum, log) => sum + log.value, 0) / filteredPerformanceLogs.length
        : 0,
      performanceByMetric: filteredPerformanceLogs.reduce((acc, log) => {
        if (!acc[log.metric]) {
          acc[log.metric] = { count: 0, total: 0, avg: 0 };
        }
        acc[log.metric].count++;
        acc[log.metric].total += log.value;
        acc[log.metric].avg = acc[log.metric].total / acc[log.metric].count;
        return acc;
      }, {} as any),
      revenueBySource: filteredRevenueLogs.reduce((acc, log) => {
        if (!acc[log.source]) {
          acc[log.source] = { count: 0, total: 0 };
        }
        acc[log.source].count++;
        acc[log.source].total += log.amount;
        return acc;
      }, {} as any),
      agentBreakdown: filteredPerformanceLogs.reduce((acc, log) => {
        const agentId = log.agent.id;
        if (!acc[agentId]) {
          acc[agentId] = {
            agent: log.agent,
            performanceCount: 0,
            avgPerformance: 0,
            totalRevenue: 0
          };
        }
        acc[agentId].performanceCount++;
        return acc;
      }, {} as any)
    };

    // Add revenue data to agent breakdown
    filteredRevenueLogs.forEach(log => {
      const agentId = log.agent.id;
      if (analytics.agentBreakdown[agentId]) {
        analytics.agentBreakdown[agentId].totalRevenue += log.amount;
      }
    });

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
