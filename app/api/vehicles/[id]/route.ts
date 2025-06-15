import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/vehicles/[id] - Not typically needed, but good practice to have
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
    });
    if (!vehicle) {
      return new NextResponse(JSON.stringify({ error: 'Vehicle not found' }), { status: 404 });
    }
    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Failed to fetch vehicle:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// PUT /api/vehicles/[id] - To update a vehicle's details or status
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updatedVehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: body,
    });
    return NextResponse.json(updatedVehicle);
  } catch (error) {
    console.error(`Failed to update vehicle ${params.id}:`, error);
    return new NextResponse(JSON.stringify({ error: 'Failed to update vehicle' }), { status: 500 });
  }
}

// DELETE /api/vehicles/[id] - To delete a vehicle
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.vehicle.delete({
      where: { id: params.id },
    });
    return new NextResponse(null, { status: 204 }); // 204 No Content for successful deletion
  } catch (error) {
    console.error(`Failed to delete vehicle ${params.id}:`, error);
    return new NextResponse(JSON.stringify({ error: 'Failed to delete vehicle' }), { status: 500 });
  }
} 