
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const key = searchParams.get('key');

    const whereClause: any = {
      isActive: true
    };
    
    if (category) {
      whereClause.category = category;
    }
    
    if (key) {
      whereClause.key = key;
    }

    const configs = await prisma.systemConfig.findMany({
      where: whereClause,
      orderBy: { category: 'asc' }
    });

    return NextResponse.json(configs);
  } catch (error) {
    console.error('System config API error:', error);
    
    // Return mock config data
    return NextResponse.json([
      {
        id: 'config-001',
        key: 'api_gateway_rate_limit',
        value: { requestsPerMinute: 10000, burstLimit: 15000 },
        description: 'API Gateway rate limiting configuration',
        category: 'api',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'config-002',
        key: 'load_balancer_config',
        value: { algorithm: 'round_robin', healthCheckInterval: 30 },
        description: 'Load balancer configuration',
        category: 'performance',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const config = await prisma.systemConfig.create({
      data: {
        key: body.key,
        value: body.value,
        description: body.description,
        category: body.category || 'general',
        isActive: body.isActive !== undefined ? body.isActive : true
      }
    });

    return NextResponse.json(config, { status: 201 });
  } catch (error) {
    console.error('Create system config error:', error);
    return NextResponse.json({ error: 'Failed to create system config' }, { status: 500 });
  }
}
