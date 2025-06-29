import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/system/config - Retrieve system configurations
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const settingName = searchParams.get('settingName');

    // Build where clause
    const where: any = {};
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (settingName) {
      where.settingName = settingName;
    }

    // Fetch configurations
    const configs = await prisma.systemConfig.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { settingName: 'asc' }
      ]
    });

    // Get categories summary
    const categories = await prisma.systemConfig.groupBy({
      by: ['category'],
      _count: {
        settingName: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        configs: configs.map(config => ({
          settingName: config.settingName,
          settingValue: config.settingValue,
          description: config.description,
          category: config.category,
          dataType: config.dataType,
          isEditable: config.isEditable,
          updatedAt: config.updatedAt
        })),
        summary: {
          totalConfigs: configs.length,
          categories: categories.length,
          categorySummary: categories.map(cat => ({
            category: cat.category,
            count: cat._count.settingName
          }))
        }
      }
    });

  } catch (error) {
    console.error('System Config API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch system configuration'
      },
      { status: 500 }
    );
  }
}

// POST /api/system/config - Create or update system configuration
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { settingName, settingValue, description, category, dataType } = body;

    // Validate required fields
    if (!settingName || !settingValue) {
      return NextResponse.json(
        { error: 'Setting name and value are required' },
        { status: 400 }
      );
    }

    // Create or update configuration
    const config = await prisma.systemConfig.upsert({
      where: { settingName },
      update: {
        settingValue,
        description,
        category: category || 'general',
        dataType: dataType || 'string',
        updatedAt: new Date()
      },
      create: {
        settingName,
        settingValue,
        description,
        category: category || 'general',
        dataType: dataType || 'string',
        isEditable: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `Configuration ${settingName} saved successfully`,
      data: config
    });

  } catch (error) {
    console.error('System Config POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save system configuration'
      },
      { status: 500 }
    );
  }
}

// PUT /api/system/config - Update existing system configuration
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { settingName, settingValue, description } = body;

    if (!settingName) {
      return NextResponse.json(
        { error: 'Setting name is required' },
        { status: 400 }
      );
    }

    // Check if setting exists and is editable
    const existingConfig = await prisma.systemConfig.findUnique({
      where: { settingName }
    });

    if (!existingConfig) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    if (!existingConfig.isEditable) {
      return NextResponse.json(
        { error: 'This configuration is not editable' },
        { status: 403 }
      );
    }

    // Update configuration
    const updatedConfig = await prisma.systemConfig.update({
      where: { settingName },
      data: {
        settingValue: settingValue || existingConfig.settingValue,
        description: description !== undefined ? description : existingConfig.description,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: `Configuration ${settingName} updated successfully`,
      data: updatedConfig
    });

  } catch (error) {
    console.error('System Config PUT error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update system configuration'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/system/config - Delete system configuration
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const settingName = searchParams.get('settingName');

    if (!settingName) {
      return NextResponse.json(
        { error: 'Setting name is required' },
        { status: 400 }
      );
    }

    // Check if setting exists and is editable
    const existingConfig = await prisma.systemConfig.findUnique({
      where: { settingName }
    });

    if (!existingConfig) {
      return NextResponse.json(
        { error: 'Configuration not found' },
        { status: 404 }
      );
    }

    if (!existingConfig.isEditable) {
      return NextResponse.json(
        { error: 'This configuration cannot be deleted' },
        { status: 403 }
      );
    }

    // Delete configuration
    await prisma.systemConfig.delete({
      where: { settingName }
    });

    return NextResponse.json({
      success: true,
      message: `Configuration ${settingName} deleted successfully`
    });

  } catch (error) {
    console.error('System Config DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete system configuration'
      },
      { status: 500 }
    );
  }
}
