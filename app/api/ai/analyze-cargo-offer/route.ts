import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Vehicle } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const COST_PER_KM = 0.5;

interface SimulationResult {
  vehicle: Vehicle;
  distance: number;
  duration: number;
  cost: number;
  profit: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cargoOfferId } = body;

    if (!cargoOfferId) {
      return new NextResponse(JSON.stringify({ error: 'Missing cargoOfferId' }), { status: 400 });
    }

    const cargoOffer = await prisma.cargoOffer.findUnique({ where: { id: cargoOfferId } });
    if (!cargoOffer) {
      return new NextResponse(JSON.stringify({ error: 'Cargo offer not found' }), { status: 404 });
    }

    const candidateVehicles = await prisma.vehicle.findMany({
      where: { 
        status: 'idle',
        type: cargoOffer.vehicleType,
      },
    });

    if (candidateVehicles.length === 0) {
      return NextResponse.json({ 
        proposal: `Analysis complete: No suitable 'idle' vehicles of type '${cargoOffer.vehicleType}' were found.`,
        chosenVehicleId: null 
      });
    }

    // Etapa 1: Calculele raman la fel
    const simulationPromises = candidateVehicles.map(async (vehicle): Promise<SimulationResult | null> => {
        const origin = vehicle.currentLocation;
        const destination = cargoOffer.toLocation;
        const waypoint = cargoOffer.fromLocation;
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&waypoints=${encodeURIComponent(waypoint)}&key=${apiKey}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.status !== 'OK' || !data.routes[0] || data.routes[0].legs.length < 2) return null;
            const legToPickup = data.routes[0].legs[0];
            const legToDestination = data.routes[0].legs[1];
            const totalDistance = legToPickup.distance.value + legToDestination.distance.value;
            const totalDuration = legToPickup.duration.value + legToDestination.duration.value;
            const cost = (totalDistance / 1000) * COST_PER_KM;
            const profit = cargoOffer.price - cost;
            return { vehicle, distance: totalDistance, duration: totalDuration, cost, profit };
        } catch (error) {
            return null;
        }
    });

    const simulationResults = (await Promise.all(simulationPromises)).filter(Boolean) as SimulationResult[];

    if (simulationResults.length === 0) {
        return NextResponse.json({ proposal: "Analysis failed: Could not simulate routes for any candidate vehicles.", chosenVehicleId: null });
    }

    // Etapa 2: Construim prompt-ul pentru Claude
    const candidatesData = simulationResults.map(res => ({
      id: res.vehicle.id,
      name: res.vehicle.name,
      licensePlate: res.vehicle.licensePlate,
      profit: res.profit.toFixed(2),
      distance: (res.distance / 1000).toFixed(0),
      duration: `${Math.floor(res.duration / 3600)}h ${Math.round((res.duration % 3600) / 60)}m`
    }));

    const prompt = `
      You are an expert AI dispatcher for a logistics company. Your task is to analyze a new cargo offer and choose the best vehicle to assign to it.
      
      Here is the cargo offer:
      - From: ${cargoOffer.fromLocation}
      - To: ${cargoOffer.toLocation}
      - Cargo Type: ${cargoOffer.vehicleType}
      - Offer Price: €${cargoOffer.price}
      
      Here are the available candidate vehicles and the simulation data for this specific trip:
      ${JSON.stringify(candidatesData, null, 2)}
      
      Your task:
      1. Analyze the candidates based on profitability. The highest profit is the primary decision factor.
      2. Formulate a professional, concise proposal recommending the best vehicle.
      3. The proposal should clearly state which vehicle is chosen and why (mentioning the highest profit).
      4. VERY IMPORTANT: Your final output MUST be a single, valid JSON object and nothing else. The JSON object should have two keys: "proposal" (a string containing your recommendation) and "chosenVehicleId" (the ID string of the vehicle you chose).
      
      Example response format:
      {
        "proposal": "Proposal: Assign vehicle... Justification: Highest estimated profit of...",
        "chosenVehicleId": "cl..."
      }
    `;

    // Etapa 3: Apelam Claude
    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // sau alt model, ex: claude-3-sonnet-20240229
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const claudeResponseText = msg.content[0].text;
    
    // Etapa 4: Returnam raspunsul "gandit" de Claude
    const claudeResponseJson = JSON.parse(claudeResponseText);

    return NextResponse.json(claudeResponseJson);

  } catch (error) {
    console.error('AI analysis failed:', error);
    if (error instanceof Anthropic.APIError) {
        return new NextResponse(JSON.stringify({ error: `Anthropic API Error: ${error.status} ${error.name}`, details: error.message }), { status: 500 });
    }
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error during AI analysis' }), { status: 500 });
  }
}
