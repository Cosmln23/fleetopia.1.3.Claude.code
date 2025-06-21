import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';

// GET all AI agents created by the user
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agents = await prisma.aIAgent.findMany({
      where: {
        userId: userId
      },
    });

    return NextResponse.json(agents);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST a new AI agent
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, ...rest } = await request.json();

    // Check if the user already has an agent with this name
    const existingAgent = await prisma.aIAgent.findFirst({
      where: {
        name: name,
        userId: userId
      },
    });

    if (existingAgent) {
      return NextResponse.json({ error: 'Agent with this name already exists' }, { status: 400 });
    }

    const newAgent = await prisma.aIAgent.create({
      data: {
        ...rest,
        userId: userId, // Link to the user
      },
    });

    return NextResponse.json(newAgent);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT (update) an existing AI agent
export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...rest } = await request.json();

    // Verify the agent belongs to the user
    const agent = await prisma.aIAgent.findFirst({
      where: {
        id: id,
        userId: userId
      },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const updatedAgent = await prisma.aIAgent.update({
      where: {
        id: id,
      },
      data: {
        ...rest,
      },
    });

    return NextResponse.json(updatedAgent);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE an AI agent
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();

    // Verify the agent belongs to the user
    const agent = await prisma.aIAgent.findFirst({
      where: {
        id: id,
        userId: userId
      },
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    await prisma.aIAgent.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 