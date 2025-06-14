
// Fleetopia.co - Self-Evolving AI Evolution API
// Daily Evolution Cycle Management for Transport Paradise

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { EvolutionStatus } from '@/lib/types';

export const dynamic = "force-dynamic";

// EVOLUTION CYCLE MANAGEMENT
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status') as EvolutionStatus;
    const limit = parseInt(searchParams.get('limit') || '10');

    const whereClause: any = {};
    
    if (agentId) {
      whereClause.agentId = agentId;
    }

    const evolutionLogs = await prisma.evolutionLog.findMany({
      where: whereClause,
      include: {
        agent: {
          select: {
            name: true,
            type: true,
            evolutionStatus: true,
            evolutionCycle: true,
            confidenceScore: true,
            treeLayer: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    // Get current evolution status summary
    const evolutionSummary = await prisma.aIAgent.groupBy({
      by: ['evolutionStatus'],
      _count: {
        evolutionStatus: true
      }
    });

    // Calculate evolution metrics
    const totalEvolutionCycles = await prisma.evolutionLog.count();
    const avgGoalAchievement = await prisma.evolutionLog.aggregate({
      _avg: {
        goalAchievement: true
      }
    });

    return NextResponse.json({
      success: true,
      data: evolutionLogs,
      metadata: {
        total_evolution_logs: evolutionLogs.length,
        total_cycles_completed: totalEvolutionCycles,
        avg_goal_achievement: avgGoalAchievement._avg.goalAchievement || 0,
        evolution_status_distribution: evolutionSummary,
        paradise_evolution_health: {
          active_learners: evolutionSummary.find(s => s.evolutionStatus === 'LEARNING')?._count.evolutionStatus || 0,
          active_evolvers: evolutionSummary.find(s => s.evolutionStatus === 'EVOLVING')?._count.evolutionStatus || 0,
          stable_agents: evolutionSummary.find(s => s.evolutionStatus === 'STABLE')?._count.evolutionStatus || 0,
          optimizing_agents: evolutionSummary.find(s => s.evolutionStatus === 'OPTIMIZING')?._count.evolutionStatus || 0
        }
      },
      protocolVersion: '2.0',
      confidenceScore: 0.97,
      transparencyLog: {
        calculation_steps: 'Evolution data aggregation and analysis',
        data_sources: ['evolution_logs', 'agent_status', 'performance_metrics'],
        confidence_factors: ['data_completeness', 'temporal_consistency', 'goal_achievement_trends']
      }
    });
  } catch (error) {
    console.error('Error fetching evolution data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch evolution data',
        protocolVersion: '2.0',
        confidenceScore: 0.0
      },
      { status: 500 }
    );
  }
}

// TRIGGER EVOLUTION CYCLE
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, evolutionType = 'scheduled', targetGoals } = body;

    if (!agentId) {
      return NextResponse.json({
        success: false,
        error: 'Agent ID is required for evolution trigger',
        protocolVersion: '2.0',
        confidenceScore: 0.0
      }, { status: 400 });
    }

    // Get current agent state
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
      include: {
        evolutionLogs: {
          take: 1,
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!agent) {
      return NextResponse.json({
        success: false,
        error: 'Agent not found',
        protocolVersion: '2.0',
        confidenceScore: 0.0
      }, { status: 404 });
    }

    // Calculate new evolution cycle
    const newCycle = agent.evolutionCycle + 1;
    const newVersion = `${agent.version.split('.')[0]}.${agent.version.split('.')[1]}.${newCycle}`;

    // Simulate evolution improvements
    const performanceImprovement = Math.random() * 5 + 1; // 1-6% improvement
    const confidenceGain = Math.random() * 0.1 + 0.05; // 0.05-0.15 confidence gain
    const newPerformance = Math.min(100, agent.performance + performanceImprovement);
    const newConfidence = Math.min(1.0, agent.confidenceScore + confidenceGain);

    // Update agent with evolution results
    const updatedAgent = await prisma.aIAgent.update({
      where: { id: agentId },
      data: {
        evolutionCycle: newCycle,
        evolutionStatus: 'EVOLVING',
        lastEvolution: new Date(),
        nextEvolution: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        version: newVersion,
        performance: newPerformance,
        confidenceScore: newConfidence,
        selfModifications: {
          ...agent.selfModifications,
          last_modification: `Evolution cycle ${newCycle} - Performance optimization`,
          modification_count: (agent.selfModifications?.modification_count || 0) + 1,
          success_rate: 95 + Math.random() * 5 // 95-100% success rate
        },
        actionsOutput: {
          last_actions: [
            'Algorithm optimization',
            'Performance tuning',
            'Confidence calibration',
            'Learning pattern enhancement'
          ],
          performance_impact: performanceImprovement,
          confidence_gained: confidenceGain
        },
        learningData: {
          ...agent.learningData,
          evolution_insights: `Cycle ${newCycle} completed successfully`,
          optimization_opportunities: (agent.learningData?.optimization_opportunities || 0) + Math.floor(Math.random() * 10) + 5
        }
      }
    });

    // Create evolution log
    const evolutionLog = await prisma.evolutionLog.create({
      data: {
        agentId,
        evolutionCycle: newCycle,
        previousVersion: agent.version,
        newVersion,
        modifications: {
          algorithm_changes: [
            'Enhanced pattern recognition',
            'Improved decision making',
            'Optimized resource utilization'
          ],
          performance_optimizations: [
            `Performance increased by ${performanceImprovement.toFixed(1)}%`,
            `Confidence improved by ${(confidenceGain * 100).toFixed(1)}%`,
            'Memory usage optimized'
          ],
          new_capabilities: [
            'Advanced learning algorithms',
            'Improved prediction accuracy',
            'Enhanced user interaction'
          ]
        },
        performance: {
          before: {
            efficiency: agent.performance,
            confidence: agent.confidenceScore,
            success_rate: agent.successRate
          },
          after: {
            efficiency: newPerformance,
            confidence: newConfidence,
            success_rate: Math.min(100, agent.successRate + 1)
          },
          improvement: {
            efficiency: performanceImprovement,
            confidence: confidenceGain,
            success_rate: 1
          }
        },
        learningGains: {
          patterns_discovered: Math.floor(Math.random() * 20) + 10,
          optimization_opportunities: Math.floor(Math.random() * 15) + 5,
          user_satisfaction_insights: Math.floor(Math.random() * 10) + 3,
          efficiency_improvements: Math.floor(Math.random() * 8) + 2
        },
        goalAchievement: 0.85 + Math.random() * 0.15 // 85-100% goal achievement
      }
    });

    // Update digital twin
    await prisma.digitalTwin.upsert({
      where: {
        agentId_twinType: {
          agentId,
          twinType: 'performance'
        }
      },
      update: {
        twinData: {
          evolution_state: {
            cycle: newCycle,
            performance: newPerformance,
            confidence: newConfidence,
            last_evolution: new Date()
          },
          predictions: {
            next_performance: Math.min(100, newPerformance + 2),
            confidence_trend: 'increasing',
            evolution_readiness: 'high'
          }
        },
        lastSync: new Date(),
        accuracy: 0.95 + Math.random() * 0.05
      },
      create: {
        agentId,
        twinType: 'performance',
        twinData: {
          evolution_state: {
            cycle: newCycle,
            performance: newPerformance,
            confidence: newConfidence,
            last_evolution: new Date()
          }
        },
        accuracy: 0.95
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        agent: updatedAgent,
        evolutionLog,
        improvements: {
          performance_gain: performanceImprovement,
          confidence_gain: confidenceGain,
          new_cycle: newCycle,
          new_version: newVersion
        }
      },
      message: `🚀 Evolution cycle ${newCycle} completed successfully! Agent ${agent.name} has evolved to version ${newVersion}`,
      protocolVersion: '2.0',
      confidenceScore: 0.98,
      transparencyLog: {
        evolution_type: evolutionType,
        calculation_steps: 'Performance improvement calculation, confidence calibration, version update',
        success_factors: ['algorithm_optimization', 'learning_integration', 'performance_validation'],
        paradise_impact: 'positive'
      }
    });
  } catch (error) {
    console.error('Error triggering evolution:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to trigger evolution cycle',
        protocolVersion: '2.0',
        confidenceScore: 0.0
      },
      { status: 500 }
    );
  }
}
