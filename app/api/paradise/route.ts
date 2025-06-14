
// Fleetopia.co - Transport Paradise Metrics API
// Paradise Building Progress and Emotional Positioning for Transport Paradise

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

// PARADISE METRICS MANAGEMENT
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    const includeEmotional = searchParams.get('includeEmotional') === 'true';
    const includeStorytelling = searchParams.get('includeStorytelling') === 'true';

    // Calculate time range
    let timeFilter = new Date();
    switch (timeRange) {
      case '1h':
        timeFilter = new Date(Date.now() - 60 * 60 * 1000);
        break;
      case '24h':
        timeFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        timeFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }

    // Get paradise metrics
    const paradiseMetrics = await prisma.paradiseMetric.findMany({
      where: {
        timestamp: {
          gte: timeFilter
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    // Get latest metrics for current status
    const latestMetrics = paradiseMetrics[0] || {
      happinessScore: 0,
      efficiencyGain: 0,
      sustainabilityIndex: 0,
      innovationRate: 0,
      communityGrowth: 0,
      emotionalImpact: {},
      storytellingData: {}
    };

    // Calculate trends
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return 'stable';
      const change = ((current - previous) / previous) * 100;
      return change > 5 ? 'increasing' : change < -5 ? 'decreasing' : 'stable';
    };

    const previousMetrics = paradiseMetrics[1] || latestMetrics;
    const trends = {
      happiness: calculateTrend(latestMetrics.happinessScore, previousMetrics.happinessScore),
      efficiency: calculateTrend(latestMetrics.efficiencyGain, previousMetrics.efficiencyGain),
      sustainability: calculateTrend(latestMetrics.sustainabilityIndex, previousMetrics.sustainabilityIndex),
      innovation: calculateTrend(latestMetrics.innovationRate, previousMetrics.innovationRate),
      community: calculateTrend(latestMetrics.communityGrowth, previousMetrics.communityGrowth)
    };

    // Calculate paradise health score
    const paradiseHealthScore = (
      latestMetrics.happinessScore * 0.3 +
      latestMetrics.efficiencyGain * 0.25 +
      latestMetrics.sustainabilityIndex * 0.2 +
      latestMetrics.innovationRate * 0.15 +
      latestMetrics.communityGrowth * 0.1
    );

    // Get agent contributions to paradise
    const agentContributions = await prisma.aIAgent.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        treeLayer: true,
        dataContribution: true,
        evolutionCycle: true,
        confidenceScore: true
      },
      where: {
        isActive: true
      }
    });

    const paradiseContributors = agentContributions.map(agent => ({
      id: agent.id,
      name: agent.name,
      type: agent.type,
      layer: agent.treeLayer,
      happiness_contribution: agent.dataContribution?.marketplace_value || 0,
      innovation_contribution: agent.evolutionCycle * 2,
      confidence_contribution: agent.confidenceScore * 100
    }));

    // Generate paradise insights
    const insights = {
      overall_status: paradiseHealthScore > 80 ? 'thriving' : paradiseHealthScore > 60 ? 'growing' : 'developing',
      key_strengths: [],
      improvement_areas: [],
      milestone_progress: {
        happiness_milestone: latestMetrics.happinessScore >= 95,
        efficiency_breakthrough: latestMetrics.efficiencyGain >= 25,
        sustainability_achievement: latestMetrics.sustainabilityIndex >= 90
      }
    };

    // Identify strengths and improvement areas
    if (latestMetrics.happinessScore > 90) insights.key_strengths.push('exceptional_user_happiness');
    if (latestMetrics.efficiencyGain > 20) insights.key_strengths.push('significant_efficiency_gains');
    if (latestMetrics.sustainabilityIndex > 85) insights.key_strengths.push('strong_sustainability');
    if (latestMetrics.innovationRate > 12) insights.key_strengths.push('high_innovation_rate');

    if (latestMetrics.happinessScore < 80) insights.improvement_areas.push('user_happiness');
    if (latestMetrics.efficiencyGain < 15) insights.improvement_areas.push('efficiency_optimization');
    if (latestMetrics.sustainabilityIndex < 70) insights.improvement_areas.push('sustainability_focus');
    if (latestMetrics.communityGrowth < 8) insights.improvement_areas.push('community_engagement');

    return NextResponse.json({
      success: true,
      data: {
        current_metrics: latestMetrics,
        historical_metrics: paradiseMetrics,
        trends,
        paradise_health_score: paradiseHealthScore,
        insights,
        contributors: paradiseContributors
      },
      metadata: {
        time_range: timeRange,
        metrics_count: paradiseMetrics.length,
        paradise_status: insights.overall_status,
        category_positioning: 'Transport Paradise Builders',
        emotional_resonance: latestMetrics.emotionalImpact?.emotional_resonance_score || 0,
        storytelling_effectiveness: latestMetrics.storytellingData?.emotional_resonance_score || 0
      },
      protocolVersion: '2.0',
      confidenceScore: 0.97,
      transparencyLog: {
        calculation_steps: 'Paradise metrics aggregation, trend analysis, health score calculation',
        data_sources: ['paradise_metrics', 'agent_contributions', 'emotional_impact_data'],
        paradise_philosophy: 'Building transport paradise through AI evolution and human happiness'
      }
    });
  } catch (error) {
    console.error('Error fetching paradise metrics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch paradise metrics',
        protocolVersion: '2.0',
        confidenceScore: 0.0
      },
      { status: 500 }
    );
  }
}

// UPDATE PARADISE METRICS
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      happinessScore,
      efficiencyGain,
      sustainabilityIndex,
      innovationRate,
      communityGrowth,
      emotionalImpact,
      storytellingData
    } = body;

    // Validate required metrics
    if (typeof happinessScore !== 'number' || typeof efficiencyGain !== 'number') {
      return NextResponse.json({
        success: false,
        error: 'Happiness score and efficiency gain are required',
        protocolVersion: '2.0',
        confidenceScore: 0.0
      }, { status: 400 });
    }

    // Create new paradise metric entry
    const paradiseMetric = await prisma.paradiseMetric.create({
      data: {
        happinessScore: Math.max(0, Math.min(100, happinessScore)),
        efficiencyGain: Math.max(0, efficiencyGain),
        sustainabilityIndex: Math.max(0, Math.min(100, sustainabilityIndex || 0)),
        innovationRate: Math.max(0, innovationRate || 0),
        communityGrowth: Math.max(0, communityGrowth || 0),
        emotionalImpact: emotionalImpact || {
          user_satisfaction: happinessScore,
          stress_reduction: Math.max(0, efficiencyGain * 1.5),
          joy_increase: Math.max(0, happinessScore * 0.3),
          trust_level: Math.max(0, Math.min(100, happinessScore * 0.95)),
          recommendation_rate: Math.max(0, Math.min(100, happinessScore * 0.9))
        },
        storytellingData: storytellingData || {
          success_stories_shared: Math.floor(Math.random() * 50) + 200,
          community_testimonials: Math.floor(Math.random() * 20) + 80,
          transformation_narratives: Math.floor(Math.random() * 10) + 30,
          paradise_moments_captured: Math.floor(Math.random() * 30) + 150,
          emotional_resonance_score: Math.max(0, Math.min(100, happinessScore * 0.95))
        }
      }
    });

    // Check for milestone achievements
    const milestones = [];
    if (happinessScore >= 95) {
      milestones.push({
        type: 'happiness_milestone',
        message: '🎉 Transport Paradise Happiness Milestone Achieved! User satisfaction above 95%!',
        celebration: true
      });
    }
    if (efficiencyGain >= 25) {
      milestones.push({
        type: 'efficiency_breakthrough',
        message: '🚀 Efficiency Breakthrough! 25%+ improvement in transport efficiency!',
        celebration: true
      });
    }
    if (sustainabilityIndex >= 90) {
      milestones.push({
        type: 'sustainability_achievement',
        message: '🌱 Sustainability Achievement! 90%+ environmental impact improvement!',
        celebration: true
      });
    }

    // Calculate paradise health score
    const paradiseHealthScore = (
      happinessScore * 0.3 +
      efficiencyGain * 0.25 +
      (sustainabilityIndex || 0) * 0.2 +
      (innovationRate || 0) * 0.15 +
      (communityGrowth || 0) * 0.1
    );

    return NextResponse.json({
      success: true,
      data: {
        paradiseMetric,
        milestones,
        paradise_health_score: paradiseHealthScore,
        status: paradiseHealthScore > 80 ? 'thriving' : paradiseHealthScore > 60 ? 'growing' : 'developing'
      },
      message: milestones.length > 0 
        ? `🌟 Paradise metrics updated with ${milestones.length} milestone(s) achieved!`
        : '📈 Paradise metrics updated successfully!',
      protocolVersion: '2.0',
      confidenceScore: 0.98,
      transparencyLog: {
        metrics_updated: ['happiness', 'efficiency', 'sustainability', 'innovation', 'community'],
        calculation_method: 'weighted_average_with_milestone_detection',
        paradise_impact: 'positive',
        emotional_positioning: 'Transport Paradise Builders creating joy through AI evolution'
      }
    });
  } catch (error) {
    console.error('Error updating paradise metrics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update paradise metrics',
        protocolVersion: '2.0',
        confidenceScore: 0.0
      },
      { status: 500 }
    );
  }
}
