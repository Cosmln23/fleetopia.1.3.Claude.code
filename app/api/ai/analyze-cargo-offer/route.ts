import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cargoOfferId } = body;

    if (!cargoOfferId) {
      return new NextResponse(JSON.stringify({ error: 'Missing cargoOfferId' }), { status: 400 });
    }

    // 1. Fetch the cargo offer details
    const cargoOffer = await prisma.cargoOffer.findUnique({
      where: { id: cargoOfferId },
    });

    if (!cargoOffer) {
      return new NextResponse(JSON.stringify({ error: 'Cargo offer not found' }), { status: 404 });
    }

    // 2. Fetch available vehicles (status 'idle')
    const availableVehicles = await prisma.vehicle.findMany({
      where: { status: 'idle' },
    });

    // 3. (SIMULATED) AI Logic
    // In a real scenario, you would format this data and send it to a language model (like Gemini).
    // For now, we simulate the logic: pick the first available vehicle.
    const chosenVehicle = availableVehicles.length > 0 ? availableVehicles[0] : null;

    const proposalText = chosenVehicle
      ? `Proposal: Assign vehicle ${chosenVehicle.name} (${chosenVehicle.licensePlate}) to handle the cargo from ${cargoOffer.fromLocation} to ${cargoOffer.toLocation}. Justification: This is the first available vehicle in the fleet.`
      : `Proposal: No available vehicles in the fleet to handle the cargo from ${cargoOffer.fromLocation} to ${cargoOffer.toLocation}. Action: Alert human supervisor.`;
    
    // 4. Return the simulated proposal
    return NextResponse.json({ 
      proposal: proposalText,
      chosenVehicleId: chosenVehicle?.id || null 
    });

  } catch (error) {
    console.error('AI analysis failed:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error during AI analysis' }), { status: 500 });
  }
} 