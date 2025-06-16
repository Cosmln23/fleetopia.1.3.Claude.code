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

    // Etapa 1: Calculele se schimba pentru a folosi noul Routes API
    const simulationPromises = candidateVehicles.map(async (vehicle: Vehicle): Promise<SimulationResult | null> => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';
        
        const requestBody = {
            origin: { location: { latLng: { latitude: vehicle.lat, longitude: vehicle.lng } } },
            destination: { address: cargoOffer.toAddress },
            intermediates: [{ address: cargoOffer.fromAddress }],
            travelMode: 'DRIVE',
            extraComputations: ['TOLLS'],
            routeModifiers: {
                vehicleInfo: {
                    emissionType: 'DIESEL',
                }
            }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': apiKey!,
                    'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.travelAdvisory.tollInfo'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (!data.routes || data.routes.length === 0) {
              console.error("Google Routes API nu a returnat nicio rută.", data);
              return null;
            }

            const route = data.routes[0];
            const totalDistance = route.distanceMeters;
            const totalDuration = parseInt(route.duration.slice(0, -1)); // '3600s' -> 3600
            
            // Extrage costul taxelor in mod sigur
            const estimatedPrice = route.travelAdvisory?.tollInfo?.estimatedPrice;
            const tollCost = estimatedPrice && estimatedPrice.length > 0 
                ? parseFloat(estimatedPrice[0].units || '0') 
                : 0;

            const distanceInKm = totalDistance / 1000;
            const fuelNeeded = (distanceInKm * (vehicle.fuelConsumption || 10)) / 100;
            const fuelCost = fuelNeeded * FUEL_PRICE_PER_LITER;

            const totalTripCost = fuelCost + tollCost;
            const profit = cargoOffer.price - totalTripCost;

            return { vehicle, distance: totalDistance, duration: totalDuration, cost: totalTripCost, profit };
        } catch (error) {
            console.error('Eroare la apelarea Google Routes API:', error);
            return null;
        }
    });

    const simulationResults = (await Promise.all(simulationPromises)).filter(Boolean) as SimulationResult[];

    if (simulationResults.length === 0) {
        return NextResponse.json({ proposal: "Analysis failed: Could not simulate routes for any candidate vehicles.", chosenVehicleId: null });
    }

    const bestCandidate = simulationResults.reduce((best, current) => {
        return (current.profit > best.profit) ? current : best;
    });

    let prompt;
    let chosenVehicleId = bestCandidate.vehicle.id;

    if (bestCandidate.profit < 0) {
        chosenVehicleId = null; 
        prompt = `
          You are an expert AI dispatcher. A cargo offer was analyzed and found to be unprofitable.
          
          Offer Details:
          - Price: €${cargoOffer.price}
          
          Analysis for the best vehicle option (${bestCandidate.vehicle.name}):
          - Estimated Total Cost (Fuel + Tolls): €${bestCandidate.cost.toFixed(2)}
          - Estimated Loss: €${Math.abs(bestCandidate.profit).toFixed(2)}

          Your task:
          1. Formulate a concise warning.
          2. Recommend rejecting or renegotiating the offer due to the financial loss.
          3. Your final output MUST be a single, valid JSON object with keys "proposal" (your warning string) and "chosenVehicleId" (must be null).
          
          Example:
          {
            "proposal": "Warning: Assigning vehicle ${bestCandidate.vehicle.name} would result in a loss of €${Math.abs(bestCandidate.profit).toFixed(2)} (Total costs: €${bestCandidate.cost.toFixed(2)}). It is recommended to reject this offer or renegotiate.",
            "chosenVehicleId": null
          }
        `;
    } else {
        const bestCandidateData = {
            id: bestCandidate.vehicle.id,
            name: bestCandidate.vehicle.name,
            cost: bestCandidate.cost.toFixed(2),
            profit: bestCandidate.profit.toFixed(2),
            distance: (bestCandidate.distance / 1000).toFixed(0),
        };

        prompt = `
          You are an expert AI dispatcher. Confirm the assignment of the most profitable vehicle for a cargo offer.
          
          Offer Details:
          - Price: €${cargoOffer.price}
          
          Most Profitable Vehicle Found:
          ${JSON.stringify(bestCandidateData, null, 2)}
          
          Your task:
          1. Formulate a concise proposal recommending this vehicle.
          2. Justify the choice by mentioning the highest estimated profit and the total estimated costs (fuel + tolls).
          3. Your final output MUST be a single, valid JSON object with keys "proposal" and "chosenVehicleId".
          
          Example:
          {
            "proposal": "Proposal: Assign Vehicle ${bestCandidateData.name}. Justification: This option yields the highest estimated profit of €${bestCandidateData.profit} with total estimated costs of €${bestCandidateData.cost}.",
            "chosenVehicleId": "${bestCandidateData.id}"
          }
        `;
    }

    const msg = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const contentBlock = msg.content[0];

    if (!contentBlock || !('text' in contentBlock)) {
      throw new Error("Invalid response structure from Claude AI.");
    }
    
    const claudeResponseText = contentBlock.text;
    const claudeResponseJson = JSON.parse(claudeResponseText);

    if (claudeResponseJson.chosenVehicleId !== chosenVehicleId) {
        console.warn('Claude AI returned a different vehicle ID. Overriding with system logic.');
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
