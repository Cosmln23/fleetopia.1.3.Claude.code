import { NextRequest, NextResponse } from 'next/server';

// Mock data pentru agenți AI
const mockAgents = [
  {
    id: 'agent-1',
    name: 'RouteOptimizer Pro',
    description: 'AI agent for route optimization and fuel efficiency',
    type: 'optimization',
    category: 'transport',
    version: '2.1.0',
    status: 'active',
    performance: 94.5,
    revenue: 15200,
    performanceScore: 94.5,
    requests: 1247,
    successRate: 98.2,
    avgResponseTime: 150,
    capabilities: ['route-optimization', 'fuel-efficiency', 'real-time-tracking'],
    isActive: true,
    evolutionCycle: 3,
    evolutionStatus: 'EVOLVING',
    protocolCompliance: 'FULL',
    confidenceScore: 0.95,
    treeLayer: 'TRUNK',
    treeDepth: 1,
    branchWeight: 0.8,
    usbcCompatibility: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'agent-2',
    name: 'FuelMaster AI',
    description: 'Advanced fuel consumption optimization',
    type: 'optimization',
    category: 'fuel',
    version: '1.8.3',
    status: 'active',
    performance: 92.1,
    revenue: 12800,
    performanceScore: 92.1,
    requests: 986,
    successRate: 96.7,
    avgResponseTime: 180,
    capabilities: ['fuel-optimization', 'cost-analysis', 'predictive-maintenance'],
    isActive: true,
    evolutionCycle: 2,
    evolutionStatus: 'LEARNING',
    protocolCompliance: 'FULL',
    confidenceScore: 0.92,
    treeLayer: 'BRANCHES',
    treeDepth: 2,
    branchWeight: 0.7,
    usbcCompatibility: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 'agent-3',
    name: 'DeliveryPredictor',
    description: 'AI-powered logistics orchestration cu Dynamic Pricing, Intelligent Capacity Optimization, Multi-Fleet Coordination și Last-Mile Revolution Engine',
    type: 'prediction',
    category: 'logistics',
    version: '4.0.0',
    status: 'active',
    performance: 97.8,
    revenue: 32450,
    performanceScore: 97.8,
    requests: 18950,
    successRate: 98.9,
    avgResponseTime: 95,
    capabilities: [
      'dynamic-pricing-engine',
      'real-time-surge-pricing',
      'customer-price-sensitivity',
      'route-optimization',
      'delivery-time-prediction',
      'risk-assessment',
      'smart-notifications',
      'sustainability-tracking',
      'competitive-intelligence',
      'ab-testing-framework',
      'demand-forecasting',
      'revenue-optimization',
      'intelligent-capacity-optimizer',
      'multi-fleet-coordination',
      'driver-workload-optimization',
      'emergency-scaling',
      'delivery-clustering',
      'fatigue-management',
      'gig-economy-integration',
      'capacity-forecasting',
      'load-balancing',
      'batch-optimization',
      'last-mile-revolution-engine',
      'crowd-sourcing-integration',
      'pickup-point-optimization',
      'customer-preference-learning',
      'success-rate-prediction',
      'alternative-delivery-methods',
      'micro-fulfillment-coordination',
      'delivery-method-intelligence',
      'first-attempt-optimization',
      'last-mile-cost-reduction'
    ],
    isActive: true,
    evolutionCycle: 6,
    evolutionStatus: 'ADVANCED',
    protocolCompliance: 'FULL',
    confidenceScore: 0.98,
    treeLayer: 'BRANCHES',
    treeDepth: 3,
    branchWeight: 0.92,
    usbcCompatibility: true,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date(),
    enhancedFeatures: {
      dynamicPricing: {
        enabled: true,
        surgeMultiplierRange: { min: 1.0, max: 3.5 },
        customerSegmentation: ['vip', 'regular', 'new', 'budget'],
        priceAcceptanceRate: 0.89,
        revenueOptimization: true
      },
      capacityOptimization: {
        enabled: true,
        fleetUtilizationTarget: 0.88,
        emergencyScalingThreshold: 0.95,
        driverWorkloadLimit: 8,
        multiFleetCoordination: true,
        gigEconomyIntegration: true,
        efficiencyGainRange: { min: 20, max: 40 }
      },
      lastMileRevolution: {
        enabled: true,
        costReductionTarget: 0.45,
        firstAttemptSuccessTarget: 0.88,
        customerSatisfactionTarget: 0.92,
        crowdSourcingPlatforms: ['uber_direct', 'doordash_drive', 'freelancer_network', 'local_couriers'],
        pickupPointTypes: ['locker', 'partner_store', 'convenience_store', 'post_office'],
        alternativeMethods: ['neighbor_delivery', 'safe_spot', 'locker_upgrade', 'time_flexible'],
        customerPreferenceLearning: true,
        realTimeOptimization: true,
        microFulfillmentCoordination: true
      },
      realTimeAnalytics: {
        demandSupplyBalance: true,
        trafficIntegration: true,
        weatherImpact: true,
        competitivePricing: true,
        capacityForecasting: true,
        driverFatigueMonitoring: true,
        lastMileOptimization: true,
        successRatePrediction: true
      },
      emergencyScaling: {
        gigEconomyProviders: ['uber', 'doordash', 'freelance'],
        partnerFleetIntegration: true,
        overtimeCapacity: true,
        deferralOptions: true,
        averageScalingTime: 12,
        crowdSourcingBackup: true
      },
      sustainability: {
        carbonFootprintTracking: true,
        ecoFriendlyOptions: true,
        greenDeliveryScore: 86,
        electricVehiclePriority: true,
        pickupPointCarbonReduction: true
      },
      smartNotifications: {
        proactiveUpdates: true,
        customerPreferences: true,
        driverOptimization: true,
        capacityAlerts: true,
        lastMileUpdates: true,
        methodRecommendations: true
      },
      deliveryClustering: {
        geographicClustering: true,
        timeWindowOptimization: true,
        capacityBasedGrouping: true,
        maxClusterSize: 18,
        maxClusterRadius: 6,
        methodBasedClustering: true,
        mixedMethodOptimization: true
      }
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const includeAnalytics = searchParams.get('includeAnalytics') === 'true';

    let filteredAgents = [...mockAgents];

    // Apply filters
    if (category && category !== 'all') {
      filteredAgents = filteredAgents.filter(agent => agent.category === category);
    }

    if (status && status !== 'all') {
      filteredAgents = filteredAgents.filter(agent => agent.status === status);
    }

    // Add enhanced metrics
    const enhancedAgents = filteredAgents.map(agent => ({
      ...agent,
      treeMetrics: {
        layer: agent.treeLayer,
        depth: agent.treeDepth,
        weight: agent.branchWeight,
        children_count: 0,
        parent_name: null
      },
      evolutionMetrics: {
        cycle: agent.evolutionCycle,
        status: agent.evolutionStatus,
        last_evolution: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        next_evolution: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
        modifications_count: Math.floor(Math.random() * 10),
        success_rate: 0.85 + Math.random() * 0.15
      },
      protocolMetrics: {
        compliance: agent.protocolCompliance,
        confidence: agent.confidenceScore,
        validation_score: Math.random() * 100,
        mcp_compatible: agent.usbcCompatibility
      },
      paradiseMetrics: {
        happiness_contribution: Math.random() * 1000,
        community_impact: Math.random() * 500,
        innovation_rate: Math.random() * 100
      },
      ...(includeAnalytics && {
        analytics: {
          avgPerformance: agent.performanceScore,
          totalRevenue: agent.revenue,
          recentPerformanceCount: Math.floor(Math.random() * 20),
          recentRevenueCount: Math.floor(Math.random() * 15),
          trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)]
        }
      })
    }));

    return NextResponse.json({
      success: true,
      data: enhancedAgents,
      count: enhancedAgents.length,
      metadata: {
        total_agents: enhancedAgents.length,
        active_agents: enhancedAgents.filter(a => a.isActive).length,
        evolution_cycles_total: enhancedAgents.reduce((sum, a) => sum + a.evolutionCycle, 0),
        avg_confidence_score: enhancedAgents.length > 0 ? 
          enhancedAgents.reduce((sum, a) => sum + a.confidenceScore, 0) / enhancedAgents.length : 0,
        protocol_compliance_rate: enhancedAgents.length > 0 ? 
          enhancedAgents.filter(a => a.protocolCompliance === 'FULL').length / enhancedAgents.length : 0
      }
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch agents'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simulate creating a new agent
    const newAgent = {
      id: `agent-${Date.now()}`,
      name: body.name || 'New Agent',
      description: body.description || 'AI Agent description',
      type: body.type || 'standard',
      category: body.category || 'general',
      version: body.version || '1.0.0',
      status: 'active',
      performance: 0,
      revenue: 0,
      performanceScore: 0,
      requests: 0,
      successRate: 100,
      avgResponseTime: 0,
      capabilities: body.capabilities || [],
      isActive: true,
      evolutionCycle: 1,
      evolutionStatus: 'LEARNING',
      protocolCompliance: 'PARTIAL',
      confidenceScore: 0.5,
      treeLayer: 'LEAVES',
      treeDepth: 1,
      branchWeight: 0.5,
      usbcCompatibility: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return NextResponse.json({
      success: true,
      data: newAgent,
      message: 'Agent created successfully'
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create agent'
      },
      { status: 500 }
    );
  }
} 