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
  fuelCost: number;
  tollCost: number;
  distanceToPickup: number;
  distanceOfCargo: number;
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

    // --- Pasul 1: Rezolvarea locațiilor pentru vehiculele candidate ---
    const readyVehicles: Vehicle[] = [];
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    for (const vehicle of candidateVehicles) {
      if (vehicle.locationType === 'MANUAL_COORDS' && vehicle.lat != null && vehicle.lng != null) {
        readyVehicles.push(vehicle);
      } else if (vehicle.locationType === 'MANUAL_ADDRESS' && vehicle.manualLocationAddress) {
        // Folosim Geocoding API pentru a converti adresa in coordonate
        try {
          const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(vehicle.manualLocationAddress)}&key=${apiKey}`;
          const response = await fetch(geocodingUrl);
          const data = await response.json();
          if (data.status === 'OK' && data.results[0]) {
            const location = data.results[0].geometry.location;
            // Adaugam coordonatele la obiectul vehicul pentru a-l folosi mai tarziu
            readyVehicles.push({ ...vehicle, lat: location.lat, lng: location.lng });
          } else {
            console.warn(`Geocoding failed for address '${vehicle.manualLocationAddress}': ${data.status}`);
          }
        } catch (error) {
          console.error('Error during geocoding:', error);
        }
      }
      // Vehiculele cu 'GPS_API' vor fi tratate aici in viitor
    }

    if (readyVehicles.length === 0) {
      return NextResponse.json({ 
        proposal: `Analysis complete: No suitable vehicles with a verifiable location were found.`,
        chosenVehicleId: null 
      });
    }

    const simulationPromises = readyVehicles.map(async (vehicle: Vehicle): Promise<SimulationResult | null> => {
        // Verificare suplimentară de siguranță
        if (vehicle.lat == null || vehicle.lng == null) return null;

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
                    'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.travelAdvisory.tollInfo,routes.legs.distanceMeters'
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
            const totalDuration = parseInt(route.duration.slice(0, -1));

            // --- Robust Leg Distance Extraction ---
            let distanceToPickup = 0;
            let distanceOfCargo = 0;

            if (route.legs && route.legs.length >= 2) {
                distanceToPickup = route.legs[0].distanceMeters;
                distanceOfCargo = route.legs[1].distanceMeters;
            } else if (route.legs && route.legs.length === 1) {
                console.warn("Route has only one leg. Assuming vehicle is at pickup location.");
                distanceToPickup = 0;
                distanceOfCargo = route.legs[0].distanceMeters;
            } else {
                console.warn("Route legs are not defined. Using total distance for cargo leg.");
                distanceToPickup = 0;
                distanceOfCargo = totalDistance;
            }

            const estimatedPrice = route.travelAdvisory?.tollInfo?.estimatedPrice;
            const tollCost = estimatedPrice && estimatedPrice.length > 0 
                ? parseFloat(estimatedPrice[0].units || '0') 
                : 0;

            const distanceInKm = totalDistance / 1000;
            const fuelNeeded = (distanceInKm * (vehicle.fuelConsumption || 10)) / 100;
            const fuelCost = fuelNeeded * FUEL_PRICE_PER_LITER;

            const totalTripCost = fuelCost + tollCost;
            const profit = cargoOffer.price - totalTripCost;

            return { vehicle, distance: totalDistance, duration: totalDuration, cost: totalTripCost, profit, fuelCost, tollCost, distanceToPickup, distanceOfCargo };
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

    const chosenVehicleId = bestCandidate.vehicle.id;

    const actionRecommendation = bestCandidate.profit >= 0
      ? `recomandă asignarea cursei vehiculului cu ID ${chosenVehicleId}`
      : `recomandă RESPINGEREA ofertei pentru că nu este profitabilă`;

    const prompt = `
      Rol: Ești un dispecer AI pentru o companie de transport rutier.
      Sarcina: Analizează oferta de transport și datele vehiculului optim, apoi formulează o propunere scurtă, profesională și directă.
      
      Context:
      - Ofertă de transport de la "${cargoOffer.fromAddress}" la "${cargoOffer.toAddress}".
      - Preț ofertă: ${cargoOffer.price} EUR.
      - Cel mai bun vehicul identificat pentru cursă are ID-ul: ${chosenVehicleId}.
      - Analiza financiară a arătat un profit estimat de ${bestCandidate.profit.toFixed(2)} EUR, după un cost total de ${bestCandidate.cost.toFixed(2)} EUR (combustibil + taxe).
      
      Acțiune Recomandată: Agentul de calcul ${actionRecommendation}.
      
      Instrucțiuni Specifice:
      1. Formulează un paragraf scurt (2-4 propoziții) care să prezinte recomandarea ta.
      2. Dacă recomanzi asignarea, folosește un ton încrezător. Exemplu: "Am analizat oferta și recomand asignarea vehiculului... Este o cursă profitabilă."
      3. Dacă recomanzi respingerea, explică pe scurt motivul (profit negativ). Exemplu: "Deși vehiculul este disponibil, analiza arată un profit negativ. Recomand respingerea ofertei pentru a evita o pierdere financiară."
      4. **Notă de prudență:** Adresele indică o posibilă rută prin țări ca Austria, Ungaria, Elveția, Cehia sau Slovenia. Costul calculat pentru taxe (tolls) s-ar putea să NU includă vinietele (taxe de drum pe perioadă determinată). Adaugă o scurtă avertizare despre acest aspect la finalul propunerii tale, dacă este cazul. Exemplu: "Notă: Vă rugăm să verificați și să achiziționați vinietele necesare pentru țările tranzitate, deoarece costul acestora s-ar putea să nu fie inclus în estimarea taxelor de drum."
      
      Răspunsul tău trebuie să fie DOAR textul propunerii, fără introduceri sau alte comentarii.
    `;

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
    
    const finalProposal = {
        proposal: claudeResponseText,
        chosenVehicleId: bestCandidate.profit >= 0 ? chosenVehicleId : null
    };

    const responseWithBreakdown = {
        ...finalProposal,
        breakdown: {
            offerPrice: cargoOffer.price,
            fuelCost: bestCandidate.fuelCost,
            tollCost: bestCandidate.tollCost,
            totalCost: bestCandidate.cost,
            profit: bestCandidate.profit,
            distance: bestCandidate.distance,
            distanceToPickup: bestCandidate.distanceToPickup,
            distanceOfCargo: bestCandidate.distanceOfCargo,
        }
    };

    return NextResponse.json(responseWithBreakdown);

  } catch (error) {
    console.error('AI analysis failed:', error);
    if (error instanceof Anthropic.APIError) {
        return new NextResponse(JSON.stringify({ error: `Anthropic API Error: ${error.status} ${error.name}`, details: error.message }), { status: 500 });
    }
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error during AI analysis' }), { status: 500 });
  }
}