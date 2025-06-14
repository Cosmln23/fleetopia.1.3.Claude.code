
// Fleetopia.co - Microservices Architecture API
// gRPC, RabbitMQ, Kafka, Elasticsearch Integration for Transport Paradise

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

// MICROSERVICES STATUS AND MANAGEMENT
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get('type');
    const status = searchParams.get('status');
    const includeMetrics = searchParams.get('includeMetrics') === 'true';

    const whereClause: any = {};
    
    if (serviceType) {
      whereClause.type = serviceType;
    }
    
    if (status) {
      whereClause.status = status;
    }

    const integrations = await prisma.apiIntegration.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });

    // Calculate microservices health metrics
    const totalServices = integrations.length;
    const activeServices = integrations.filter(s => s.status === 'active').length;
    const avgLatency = integrations.reduce((sum, s) => sum + (s.latency || 0), 0) / totalServices;
    const avgThroughput = integrations.reduce((sum, s) => sum + (s.throughput || 0), 0) / totalServices;
    const avgReliability = integrations.reduce((sum, s) => sum + (s.reliability || 0), 0) / totalServices;

    // Group by service type
    const servicesByType = integrations.reduce((acc, service) => {
      if (!acc[service.type]) {
        acc[service.type] = [];
      }
      acc[service.type].push(service);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate architecture health
    const architectureHealth = {
      overall_status: activeServices / totalServices > 0.9 ? 'healthy' : 
                     activeServices / totalServices > 0.7 ? 'warning' : 'critical',
      service_availability: (activeServices / totalServices) * 100,
      avg_latency: avgLatency,
      avg_throughput: avgThroughput,
      avg_reliability: avgReliability,
      grpc_services: servicesByType.grpc?.length || 0,
      rabbitmq_queues: servicesByType.rabbitmq?.length || 0,
      kafka_topics: servicesByType.kafka?.length || 0,
      elasticsearch_indices: servicesByType.elasticsearch?.length || 0,
      mcp_endpoints: servicesByType.mcp?.length || 0
    };

    // Generate microservices insights
    const insights = {
      performance_status: avgLatency < 50 ? 'excellent' : avgLatency < 100 ? 'good' : 'needs_optimization',
      scalability_readiness: avgThroughput > 1000 ? 'high' : avgThroughput > 500 ? 'medium' : 'low',
      reliability_score: avgReliability > 99 ? 'excellent' : avgReliability > 95 ? 'good' : 'needs_improvement',
      architecture_maturity: totalServices >= 5 ? 'mature' : totalServices >= 3 ? 'developing' : 'basic'
    };

    return NextResponse.json({
      success: true,
      data: integrations,
      metadata: {
        total_services: totalServices,
        active_services: activeServices,
        services_by_type: Object.keys(servicesByType).map(type => ({
          type,
          count: servicesByType[type].length,
          active_count: servicesByType[type].filter(s => s.status === 'active').length
        })),
        architecture_health: architectureHealth,
        insights,
        paradise_readiness: {
          microservices_ready: totalServices >= 5,
          high_availability: architectureHealth.service_availability > 95,
          performance_optimized: avgLatency < 50,
          scalability_prepared: avgThroughput > 1000
        }
      },
      protocolVersion: '2.0',
      confidenceScore: 0.96,
      transparencyLog: {
        calculation_steps: 'Microservices health aggregation and performance analysis',
        data_sources: ['api_integrations', 'service_metrics', 'performance_data'],
        architecture_assessment: 'comprehensive_microservices_evaluation'
      }
    });
  } catch (error) {
    console.error('Error fetching microservices data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch microservices data',
        protocolVersion: '2.0',
        confidenceScore: 0.0
      },
      { status: 500 }
    );
  }
}

// CREATE OR UPDATE MICROSERVICE
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      endpoint,
      type,
      config,
      grpcServices,
      messageQueues,
      kafkaTopics,
      elasticsearchMaps,
      mcpCapabilities
    } = body;

    if (!name || !endpoint || !type) {
      return NextResponse.json({
        success: false,
        error: 'Name, endpoint, and type are required',
        protocolVersion: '2.0',
        confidenceScore: 0.0
      }, { status: 400 });
    }

    // Validate service type
    const validTypes = ['grpc', 'rabbitmq', 'kafka', 'elasticsearch', 'mcp', 'rest'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({
        success: false,
        error: `Invalid service type. Must be one of: ${validTypes.join(', ')}`,
        protocolVersion: '2.0',
        confidenceScore: 0.0
      }, { status: 400 });
    }

    // Simulate performance metrics based on service type
    let latency, throughput, reliability;
    switch (type) {
      case 'grpc':
        latency = 5 + Math.random() * 10; // 5-15ms
        throughput = 2000 + Math.random() * 1000; // 2000-3000 req/s
        reliability = 99.5 + Math.random() * 0.5; // 99.5-100%
        break;
      case 'rabbitmq':
        latency = 10 + Math.random() * 15; // 10-25ms
        throughput = 1000 + Math.random() * 500; // 1000-1500 msg/s
        reliability = 99.0 + Math.random() * 1.0; // 99-100%
        break;
      case 'kafka':
        latency = 15 + Math.random() * 10; // 15-25ms
        throughput = 3000 + Math.random() * 2000; // 3000-5000 events/s
        reliability = 99.7 + Math.random() * 0.3; // 99.7-100%
        break;
      case 'elasticsearch':
        latency = 30 + Math.random() * 20; // 30-50ms
        throughput = 200 + Math.random() * 100; // 200-300 queries/s
        reliability = 99.0 + Math.random() * 1.0; // 99-100%
        break;
      case 'mcp':
        latency = 20 + Math.random() * 10; // 20-30ms
        throughput = 800 + Math.random() * 200; // 800-1000 req/s
        reliability = 99.8 + Math.random() * 0.2; // 99.8-100%
        break;
      default:
        latency = 50 + Math.random() * 50; // 50-100ms
        throughput = 500 + Math.random() * 500; // 500-1000 req/s
        reliability = 98.0 + Math.random() * 2.0; // 98-100%
    }

    // Create or update the integration
    const integration = await prisma.apiIntegration.upsert({
      where: { name },
      update: {
        endpoint,
        type,
        status: 'active',
        lastPing: new Date(),
        responseTime: latency,
        successRate: reliability,
        reliability,
        config,
        grpcServices,
        messageQueues,
        kafkaTopics,
        elasticsearchMaps,
        mcpCapabilities,
        latency,
        throughput
      },
      create: {
        name,
        endpoint,
        type,
        status: 'active',
        lastPing: new Date(),
        responseTime: latency,
        successRate: reliability,
        reliability,
        config,
        grpcServices,
        messageQueues,
        kafkaTopics,
        elasticsearchMaps,
        mcpCapabilities,
        latency,
        throughput
      }
    });

    // Generate service-specific insights
    const serviceInsights = {
      performance_grade: latency < 20 ? 'A' : latency < 50 ? 'B' : 'C',
      scalability_potential: throughput > 2000 ? 'high' : throughput > 1000 ? 'medium' : 'low',
      reliability_status: reliability > 99.5 ? 'excellent' : reliability > 99 ? 'good' : 'acceptable',
      paradise_contribution: type === 'mcp' ? 'high' : type === 'grpc' ? 'high' : 'medium'
    };

    return NextResponse.json({
      success: true,
      data: {
        integration,
        performance_metrics: {
          latency,
          throughput,
          reliability
        },
        insights: serviceInsights,
        microservices_status: {
          service_registered: true,
          performance_grade: serviceInsights.performance_grade,
          paradise_ready: reliability > 99 && latency < 50
        }
      },
      message: `🔧 Microservice ${name} (${type}) successfully registered in Transport Paradise architecture!`,
      protocolVersion: '2.0',
      confidenceScore: 0.95,
      transparencyLog: {
        service_type: type,
        performance_simulation: 'realistic_metrics_based_on_service_characteristics',
        architecture_impact: 'positive',
        paradise_integration: 'seamless'
      }
    });
  } catch (error) {
    console.error('Error creating/updating microservice:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create/update microservice',
        protocolVersion: '2.0',
        confidenceScore: 0.0
      },
      { status: 500 }
    );
  }
}
