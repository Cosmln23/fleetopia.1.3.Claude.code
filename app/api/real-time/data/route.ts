import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany();
    
    // In the future, we can add more data here, like alerts, metrics, etc.
    const realTimeData = {
      vehicleTracking: vehicles,
      // a
    };

    return NextResponse.json(realTimeData);
  } catch (error) {
    console.error('Failed to fetch real-time data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch real-time data' },
      { status: 500 }
    );
  }
} 