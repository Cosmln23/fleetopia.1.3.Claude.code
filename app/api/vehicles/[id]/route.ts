import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/vehicles/[id] - Not typically needed, but good practice to have
export async function GET(request: Request, props: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = props.params;
    
    const vehicle = await prisma.vehicle.findFirst({
      where: { 
        id,
        fleet: {
          userId: session.user.id
        }
      },
    });
    
    if (!vehicle) {
      return new NextResponse(JSON.stringify({ error: 'Vehicle not found or access denied' }), { status: 404 });
    }
    
    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Failed to fetch vehicle:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// PUT /api/vehicles/[id] - To update a vehicle's details or status
export async function PUT(request: Request, props: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = props.params;
    
    // First verify that the vehicle belongs to the user
    const vehicle = await prisma.vehicle.findFirst({
      where: { 
        id,
        fleet: {
          userId: session.user.id
        }
      },
    });
    
    if (!vehicle) {
      return new NextResponse(JSON.stringify({ error: 'Vehicle not found or access denied' }), { status: 404 });
    }
    
    const body = await request.json();
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: body,
    });
    
    return NextResponse.json(updatedVehicle);
  } catch (error) {
    console.error(`Failed to update vehicle ${props.params.id}:`, error);
    return new NextResponse(JSON.stringify({ error: 'Failed to update vehicle' }), { status: 500 });
  }
}

// DELETE /api/vehicles/[id] - To delete a vehicle
export async function DELETE(request: Request, props: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = props.params;
    
    // First verify that the vehicle belongs to the user
    const vehicle = await prisma.vehicle.findFirst({
      where: { 
        id,
        fleet: {
          userId: session.user.id
        }
      },
    });
    
    if (!vehicle) {
      return new NextResponse(JSON.stringify({ error: 'Vehicle not found or access denied' }), { status: 404 });
    }
    
    await prisma.vehicle.delete({
      where: { id },
    });
    
    return new NextResponse(null, { status: 204 }); // 204 No Content for successful deletion
  } catch (error) {
    console.error(`Failed to delete vehicle ${props.params.id}:`, error);
    return new NextResponse(JSON.stringify({ error: 'Failed to delete vehicle' }), { status: 500 });
  }
} 