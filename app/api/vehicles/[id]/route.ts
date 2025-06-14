import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET handler to fetch a single vehicle's data (useful for pre-populating forms)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: params.id },
    });

    if (!vehicle) {
      return new NextResponse(JSON.stringify({ error: 'Vehicle not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// PUT handler to update a vehicle's data
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, location } = body;

    // Basic validation
    if (!status && !location) {
      return new NextResponse(
        JSON.stringify({ error: 'At least one field to update must be provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const dataToUpdate: { status?: string, lat?: number, lng?: number } = {};
    if (status) dataToUpdate.status = status;
    if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
      dataToUpdate.lat = location.lat;
      dataToUpdate.lng = location.lng;
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 