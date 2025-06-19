import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const includeAnalytics = searchParams.get('includeAnalytics') === 'true';

    // Try to get agents from database
    let agents = [];
    try {
      agents = await prisma.aIAgent.findMany({
        where: {
          ...(category && category !== 'all' && { category }),
          ...(status && status !== 'all' && { status })
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (dbError) {
      console.warn('Could not fetch agents from database:', dbError);
      // Return empty array instead of mock data
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        metadata: {
          total_agents: 0,
          active_agents: 0,
          evolution_cycles_total: 0,
          avg_confidence_score: 0,
          protocol_compliance_rate: 0
        }
      });
    }

    // Transform agents to include additional metrics if needed
    const enhancedAgents = agents.map(agent => ({
      ...agent,
      treeMetrics: {
        layer: agent.layer || 'LEAVES',
        depth: agent.depth || 1,
        weight: agent.weight || 0.5,
        children_count: 0,
        parent_name: null
      },
      evolutionMetrics: {
        cycle: agent.evolutionCycle || 1,
        status: agent.evolutionStatus || 'LEARNING',
        last_evolution: agent.lastEvolution || agent.updatedAt,
        next_evolution: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        modifications_count: agent.modificationsCount || 0,
        success_rate: agent.successRate || 0.5
      },
      protocolMetrics: {
        compliance: agent.protocolCompliance || 'PARTIAL',
        confidence: agent.confidenceScore || 0.5,
        validation_score: agent.validationScore || 50,
        mcp_compatible: agent.mcpCompatible || false
      },
      ...(includeAnalytics && {
        analytics: {
          avgPerformance: agent.performance || 0,
          totalRevenue: agent.revenue || 0,
          recentPerformanceCount: 0,
          recentRevenueCount: 0,
          trend: 'stable'
        }
      })
    }));

    return NextResponse.json({
      success: true,
      data: enhancedAgents,
      count: enhancedAgents.length,
      metadata: {
        total_agents: enhancedAgents.length,
        active_agents: enhancedAgents.filter(a => a.status === 'active').length,
        evolution_cycles_total: enhancedAgents.reduce((sum, a) => sum + (a.evolutionMetrics.cycle || 0), 0),
        avg_confidence_score: enhancedAgents.length > 0 ? 
          enhancedAgents.reduce((sum, a) => sum + (a.protocolMetrics.confidence || 0), 0) / enhancedAgents.length : 0,
        protocol_compliance_rate: enhancedAgents.length > 0 ? 
          enhancedAgents.filter(a => a.protocolMetrics.compliance === 'FULL').length / enhancedAgents.length : 0
      }
    });
  } catch (error) {
    console.warn('Error fetching agents:', error);
    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
      metadata: {
        total_agents: 0,
        active_agents: 0,
        evolution_cycles_total: 0,
        avg_confidence_score: 0,
        protocol_compliance_rate: 0
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const body = await request.json();
    
    // Create new agent in database
    let newAgent;
    try {
      newAgent = await prisma.aIAgent.create({
        data: {
          name: body.name || 'New Agent',
          description: body.description || 'AI Agent description',
          type: body.type || 'standard',
          category: body.category || 'general',
          version: body.version || '1.0.0',
          status: 'active',
          performance: 0,
          revenue: 0,
          capabilities: body.capabilities || [],
          evolutionCycle: 1,
          evolutionStatus: 'LEARNING',
          protocolCompliance: 'PARTIAL',
          confidenceScore: 0.5,
          layer: 'LEAVES',
          depth: 1,
          weight: 0.5,
          mcpCompatible: false,
          createdBy: {
            connect: { id: session.user.id }
          }
        }
      });
    } catch (dbError) {
      console.warn('Could not create agent in database:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create agent in database'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: newAgent,
      message: 'Agent created successfully'
    });
  } catch (error) {
    console.warn('Error creating agent:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create agent'
    }, { status: 500 });
  }
}
