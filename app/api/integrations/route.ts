import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// GET - Retrieve API Integrations
export async function GET(request: NextRequest) {
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
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const where: any = { userId: user.id };
    
    if (type && type !== 'all') {
      where.type = type;
    }
    
    if (status && status !== 'all') {
      where.status = status;
    }

    const integrations = await prisma.aPIIntegration.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Remove sensitive credentials from response
    const sanitizedIntegrations = integrations.map(integration => ({
      ...integration,
      credentials: {
        configured: Object.keys(integration.credentials as any).length > 0,
        // Only return non-sensitive info
        authType: (integration.credentials as any).authType || 'unknown'
      }
    }));

    return NextResponse.json(sanitizedIntegrations);
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new API Integration
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
      type,
      provider,
      baseUrl,
      credentials,
      settings,
      description
    } = body;

    // Validation
    if (!name || !type || !provider || !baseUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Default settings
    const defaultSettings = {
      timeout: 30,
      retryAttempts: 3,
      cacheTime: 15,
      rateLimitPerMinute: 60,
      ...settings
    };

    const integration = await prisma.aPIIntegration.create({
      data: {
        name,
        type,
        provider,
        credentials: {
          baseUrl,
          ...credentials,
          description
        },
        settings: defaultSettings,
        userId: user.id
      }
    });

    // Remove credentials from response
    const response = {
      ...integration,
      credentials: {
        configured: true,
        baseUrl,
        authType: credentials.authType || 'unknown'
      }
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating integration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update API Integration
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
        { error: 'Integration ID is required' },
        { status: 400 }
      );
    }

    // Check if user owns the integration
    const existingIntegration = await prisma.aPIIntegration.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingIntegration) {
      return NextResponse.json(
        { error: 'Integration not found or unauthorized' },
        { status: 404 }
      );
    }

    const updatedIntegration = await prisma.aPIIntegration.update({
      where: { id },
      data: updateData
    });

    // Remove credentials from response
    const response = {
      ...updatedIntegration,
      credentials: {
        configured: Object.keys(updatedIntegration.credentials as any).length > 0,
        authType: (updatedIntegration.credentials as any).authType || 'unknown'
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating integration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete API Integration
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
        { error: 'Integration ID is required' },
        { status: 400 }
      );
    }

    // Check if user owns the integration
    const existingIntegration = await prisma.aPIIntegration.findFirst({
      where: {
        id,
        userId: user.id
      }
    });

    if (!existingIntegration) {
      return NextResponse.json(
        { error: 'Integration not found or unauthorized' },
        { status: 404 }
      );
    }

    await prisma.aPIIntegration.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Integration deleted successfully' });
  } catch (error) {
    console.error('Error deleting integration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Test functionality moved to /api/integrations/test/route.ts 