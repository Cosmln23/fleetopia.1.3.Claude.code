import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// GET - Retrieve AI Agents
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const marketplace = searchParams.get('marketplace');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (marketplace !== null) {
      where.marketplace = marketplace === 'true';
    }

    const agents = await prisma.aIAgent.findMany({
      where,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5
        },
        metrics: {
          select: {
            performance: true,
            usage: true,
            timestamp: true
          },
          orderBy: {
            timestamp: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching AI agents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new AI Agent
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      description,
      version,
      category,
      capabilities,
      configuration,
      performance,
      marketplace = false
    } = body;

    // Validation
    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const agent = await prisma.aIAgent.create({
      data: {
        name,
        description,
        version: version || '1.0.0',
        category,
        capabilities: capabilities || {},
        configuration: configuration || {},
        performance: performance || {},
        marketplace,
        requiresAPI: true,
        userId: user.id
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error('Error creating AI agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update AI Agent
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Check if user owns the agent
    const existingAgent = await prisma.aIAgent.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found or unauthorized' },
        { status: 404 }
      );
    }

    const updatedAgent = await prisma.aIAgent.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(updatedAgent);
  } catch (error) {
    console.error('Error updating AI agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete AI Agent
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }

    // Check if user owns the agent
    const existingAgent = await prisma.aIAgent.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found or unauthorized' },
        { status: 404 }
      );
    }

    await prisma.aIAgent.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting AI agent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 