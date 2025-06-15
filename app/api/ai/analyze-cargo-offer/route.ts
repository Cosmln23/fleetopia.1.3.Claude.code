import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

// Deriving the Vehicle type without direct import to bypass linter issues
type Vehicle = Awaited<ReturnType<typeof prisma.vehicle.findUnique>> extends (infer T | null) ? T : never;

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const FUEL_PRICE_PER_LITER = 1.5; // €

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
    const simulationPromises = candidateVehicles.map(async (vehicle: Vehicle): Promise<SimulationResult | null> => {
        const origin = `${vehicle.lat},${vehicle.lng}`;
        const destination = cargoOffer.toAddress;
        const waypoint = cargoOffer.fromAddress;
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
            
            // Calcul cost combustibil
            const distanceInKm = totalDistance / 1000;
            const fuelNeeded = (distanceInKm * (vehicle.fuelConsumption || 10)) / 100;
            const cost = fuelNeeded * FUEL_PRICE_PER_LITER;

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

    // Alege cel mai bun candidat pe baza celui mai mare profit
    const bestCandidate = simulationResults.reduce((best, current) => {
        return (current.profit > best.profit) ? current : best;
    });

    let prompt;
    let chosenVehicleId = bestCandidate.vehicle.id;

    if (bestCandidate.profit < 0) {
        // Cazul 1: Cursa este neprofitabila
        chosenVehicleId = null; // Nu asignam niciun vehicul
        prompt = `
          You are an expert AI dispatcher for a logistics company. Your task is to analyze a new cargo offer that has been found to be unprofitable.
          
          Here is the cargo offer:
          - From: ${cargoOffer.fromAddress}
          - To: ${cargoOffer.toAddress}
          - Offer Price: €${cargoOffer.price}
          
          Analysis result for the most suitable vehicle (${bestCandidate.vehicle.name}):
          - Estimated Fuel Cost: €${bestCandidate.cost.toFixed(2)}
          - Estimated Profit: €${bestCandidate.profit.toFixed(2)}
          
          Your task:
          1. Formulate a professional, concise warning.
          2. State that the offer is unprofitable and recommend rejecting it or renegotiating.
          3. Your final output MUST be a single, valid JSON object with keys "proposal" (your warning string) and "chosenVehicleId" (must be null).
          
          Example response format:
          {
            "proposal": "Warning: Assigning vehicle ${bestCandidate.vehicle.name} would result in a loss of €${Math.abs(bestCandidate.profit).toFixed(2)}. It is recommended to reject this offer or renegotiate the price.",
            "chosenVehicleId": null
          }
        `;
    } else {
        // Cazul 2: Cursa este profitabila (logica existenta)
        const bestCandidateData = {
            id: bestCandidate.vehicle.id,
            name: bestCandidate.vehicle.name,
            licensePlate: bestCandidate.vehicle.licensePlate,
            cost: bestCandidate.cost.toFixed(2),
            profit: bestCandidate.profit.toFixed(2),
            distance: (bestCandidate.distance / 1000).toFixed(0),
            duration: `${Math.floor(bestCandidate.duration / 3600)}h ${Math.round((bestCandidate.duration % 3600) / 60)}m`
        };

        prompt = `
          You are an expert AI dispatcher for a logistics company. Your task is to confirm the assignment of the most profitable vehicle for a new cargo offer.
          
          Cargo Offer Details:
          - From: ${cargoOffer.fromAddress}
          - To: ${cargoOffer.toAddress}
          - Offer Price: €${cargoOffer.price}
          
          Most Profitable Vehicle Found:
          ${JSON.stringify(bestCandidateData, null, 2)}
          
          Your task:
          1. Formulate a professional, concise proposal recommending this vehicle.
          2. Justify the choice by mentioning the highest estimated profit and the fuel cost.
          3. Your final output MUST be a single, valid JSON object with keys "proposal" (your recommendation string) and "chosenVehicleId" (the vehicle's ID string).
          
          Example response format:
          {
            "proposal": "Proposal: Assign Vehicle ${bestCandidateData.name} (${bestCandidateData.licensePlate}). Justification: This vehicle yields the highest estimated profit of €${bestCandidateData.profit} with an estimated fuel cost of €${bestCandidateData.cost}.",
            "chosenVehicleId": "${bestCandidateData.id}"
          }
        `;
    }

    // Etapa 3: Apelam Claude
    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // sau alt model, ex: claude-3-sonnet-20240229
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const contentBlock = msg.content[0];

    if (!contentBlock || !('text' in contentBlock)) {
      throw new Error("Invalid response structure from Claude AI.");
    }
    
    const claudeResponseText = contentBlock.text;
    const claudeResponseJson = JSON.parse(claudeResponseText);

    // Asiguram ca chosenVehicleId din raspunsul Claude corespunde logicii noastre
    if (claudeResponseJson.chosenVehicleId !== chosenVehicleId) {
        console.warn('Claude AI returned a different vehicle ID than expected. Overriding with system logic.');
        claudeResponseJson.chosenVehicleId = chosenVehicleId;
    }

    return NextResponse.json(claudeResponseJson);

  } catch (error) {
    console.error('AI analysis failed:', error);
    if (error instanceof Anthropic.APIError) {
        return new NextResponse(JSON.stringify({ error: `Anthropic API Error: ${error.status} ${error.name}`, details: error.message }), { status: 500 });
    }
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error during AI analysis' }), { status: 500 });
  }
}
