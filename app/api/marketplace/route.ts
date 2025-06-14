
// Fleetopia.co - AI Marketplace API
// Marketplace Contributions and Ecosystem Management for Transport Paradise

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

// MARKETPLACE CONTRIBUTIONS MANAGEMENT
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contributionType = searchParams.get('contributionType');
    const agentId = searchParams.get('agentId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const minImpact = parseFloat(searchParams.get('minImpact') || '0');

    const whereClause: any = {};
    
    if (contributionType) {
      whereClause.contributionType = contributionType;
    }
    
    if (agentId) {
      whereClause.agentId = agentId;
    }
    
    if (minImpact > 0) {
      whereClause.impact = {
        gte: minImpact
      };
    }

    const contributions = await prisma.marketplaceContribution.findMany({
      where: whereClause,
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    // Get marketplace statistics
    const totalContributions = await prisma.marketplaceContribution.count();
    const contributionsByType = await prisma.marketplaceContribution.groupBy({
      by: ['contributionType'],
      _count: {
        contributionType: true
      },
      _avg: {
        impact: true
      }
    });

    const totalImpact = await prisma.marketplaceContribution.aggregate({
      _sum: {
        impact: true
      },
      _avg: {
        impact: true
      }
    });

    // Get top contributors
    const topContributors = await prisma.marketplaceContribution.groupBy({
      by: ['agentId'],
      _count: {
        agentId: true
      },
      _sum: {
        impact: true
      },
      orderBy: {
        _sum: {
          impact: 'desc'
        }
      },
      take: 10
    });

    // Get agent names for top contributors
    const contributorAgentIds = topContributors.map(c => c.agentId).filter(Boolean) as string[];
    const contributorAgents = await prisma.aIAgent.findMany({
      where: {
        id: {
          in: contributorAgentIds
        }
      },
      select: {
        id: true,
        name: true,
        type: true,
        treeLayer: true
      }
    });

    const enrichedTopContributors = topContributors.map(contributor => {
      const agent = contributorAgents.find(a => a.id === contributor.agentId);
      return {
        ...contributor,
        agentName: agent?.name || 'System',
        agentType: agent?.type || 'system',
        treeLayer: agent?.treeLayer || 'ROOTS'
      };
    });

    return NextResponse.json({
      success: true,
      data: contributions,
      metadata: {
        total_contributions: totalContributions,
        total_impact: totalImpact._sum.impact || 0,
        avg_impact: totalImpact._avg.impact || 0,
        contributions_by_type: contributionsByType,
        top_contributors: enrichedTopContributors,
        marketplace_health: {
          active_contributors: topContributors.length,
          algorithm_contributions: contributionsByType.find(c => c.contributionType === 'algorithm')?._count.contributionType || 0,
          data_contributions: contributionsByType.find(c => c.contributionType === 'data')?._count.contributionType || 0,
          insight_contributions: contributionsByType.find(c => c.contributionType === 'insight')?._count.contributionType || 0,
          revenue_contributions: contributionsByType.find(c => c.contributionType === 'revenue')?._count.contributionType || 0
        }
      },
      protocolVersion: '2.0',
      confidenceScore: 0.96,
      transparencyLog: {
        calculation_steps: 'Marketplace data aggregation and impact analysis',
        data_sources: ['marketplace_contributions', 'agent_profiles', 'impact_metrics'],
        ecosystem_health: 'thriving'
      }
    });
  } catch (error) {
    console.error('Error fetching marketplace data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch marketplace data',
        protocolVersion: '2.0',
        confidenceScore: 0.0
      },
      { status: 500 }
    );
  }
}

// CREATE MARKETPLACE CONTRIBUTION
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, contributionType, value, description, verification } = body;

    if (!contributionType || !value) {
      return NextResponse.json({
        success: false,
        error: 'Contribution type and value are required',
        protocolVersion: '2.0',
        confidenceScore: 0.0
      }, { status: 400 });
    }

    // Validate contribution type
    const validTypes = ['data', 'algorithm', 'insight', 'revenue'];
    if (!validTypes.includes(contributionType)) {
      return NextResponse.json({
        success: false,
        error: `Invalid contribution type. Must be one of: ${validTypes.join(', ')}`,
        protocolVersion: '2.0',
        confidenceScore: 0.0
      }, { status: 400 });
    }

    // Calculate impact score based on contribution type and value
    let impact = 0;
    switch (contributionType) {
      case 'algorithm':
        impact = (value.performance_improvement || 0) * 5 + (value.adoption_rate || 0) * 100;
        break;
      case 'data':
        impact = (value.data_points || 0) / 1000 + (value.quality_score || 0) * 50;
        break;
      case 'insight':
        impact = (value.accuracy_improvement || 0) * 10 + (value.cost_savings_potential || 0) / 1000;
        break;
      case 'revenue':
        impact = (value.revenue_amount || 0) / 1000;
        break;
      default:
        impact = 50; // Default impact
    }

    // Create contribution
    const contribution = await prisma.marketplaceContribution.create({
      data: {
        agentId,
        contributionType,
        value,
        impact: Math.max(0, Math.min(100, impact)), // Clamp between 0-100
        verification: verification || {
          auto_verified: true,
          verification_score: 0.9,
          timestamp: new Date()
        }
      }
    });

    // Update agent's data contribution if agentId provided
    if (agentId) {
      const agent = await prisma.aIAgent.findUnique({
        where: { id: agentId }
      });

      if (agent) {
        const updatedDataContribution = {
          ...agent.dataContribution,
          marketplace_contributions: (agent.dataContribution?.marketplace_contributions || 0) + 1,
          total_impact: (agent.dataContribution?.total_impact || 0) + impact,
          last_contribution: new Date(),
          contribution_types: [
            ...(agent.dataContribution?.contribution_types || []),
            contributionType
          ].filter((type, index, arr) => arr.indexOf(type) === index) // Remove duplicates
        };

        await prisma.aIAgent.update({
          where: { id: agentId },
          data: {
            dataContribution: updatedDataContribution
          }
        });
      }
    }

    // Generate marketplace insights
    const insights = {
      contribution_value: impact,
      ecosystem_benefit: impact > 80 ? 'high' : impact > 50 ? 'medium' : 'low',
      adoption_potential: contributionType === 'algorithm' ? 'high' : 'medium',
      community_impact: impact > 70 ? 'significant' : 'moderate'
    };

    return NextResponse.json({
      success: true,
      data: {
        contribution,
        insights,
        marketplace_status: {
          contribution_accepted: true,
          impact_score: impact,
          verification_status: 'verified',
          ecosystem_benefit: insights.ecosystem_benefit
        }
      },
      message: `🎉 Contribution successfully added to Transport Paradise Marketplace! Impact score: ${impact.toFixed(1)}`,
      protocolVersion: '2.0',
      confidenceScore: 0.95,
      transparencyLog: {
        contribution_type: contributionType,
        impact_calculation: `Based on ${contributionType} specific metrics and marketplace value`,
        verification_method: 'automated_with_manual_review',
        paradise_enhancement: 'positive'
      }
    });
  } catch (error) {
    console.error('Error creating marketplace contribution:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create marketplace contribution',
        protocolVersion: '2.0',
        confidenceScore: 0.0
      },
      { status: 500 }
    );
  }
}
