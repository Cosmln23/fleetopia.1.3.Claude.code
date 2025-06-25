import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import prisma from '@/lib/prisma';
import { CargoStatus, VehicleStatus } from '@prisma/client';

// Initialize the Anthropic client with the API key from environment variables
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the user
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user info for personalization
    const user = await currentUser();
    const userName = user?.firstName || user?.username || 'there';

    // 2. Check for Anthropic API Key
    if (!process.env.ANTHROPIC_API_KEY) {
        return NextResponse.json(
          { error: 'Anthropic API key is not configured on the server.' },
          { status: 500 }
        );
    }

    // 3. Parse the request body
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is a required field.' },
        { status: 400 }
      );
    }

    // Map the history to the format expected by Anthropic
    const mappedHistory = (history || [])
        .filter((msg: any) => msg.type === 'user' || msg.type === 'ai')
        .map((msg: any) => ({
            role: msg.type === 'ai' ? 'assistant' : 'user',
            content: msg.message,
        }));

    // 4. Fetch comprehensive platform context using direct database access
    let platformContext = '';
    try {
      // Get user's fleets first
      const userFleets = await prisma.fleet.findMany({
        where: { userId: userId }
      });
      
      const fleetIds = userFleets.map(fleet => fleet.id);

      // Fetch all dispatch data directly from database in parallel
      const [vehicles, cargoOffers, activeJobs] = await Promise.all([
        // Get user's vehicles
        fleetIds.length > 0 ? prisma.vehicle.findMany({
          where: { fleetId: { in: fleetIds } },
          select: {
            id: true,
            name: true,
            licensePlate: true,
            type: true,
            status: true,
            driverName: true,
            lat: true,
            lng: true,
            fuelConsumption: true,
            createdAt: true
          },
          take: 10
        }) : [],
        
        // Get recent cargo offers
        prisma.cargoOffer.findMany({
          where: {
            status: { in: [CargoStatus.NEW, CargoStatus.OPEN] },
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
          },
          select: {
            id: true,
            title: true,
            fromCity: true,
            toCity: true,
            price: true,
            weight: true,
            urgency: true,
            status: true,
            createdAt: true
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        }),
        
        // Get active jobs (if any)
        fleetIds.length > 0 ? prisma.cargoOffer.findMany({
          where: {
            acceptedByUserId: userId,
            status: { in: [CargoStatus.TAKEN, CargoStatus.IN_PROGRESS] }
          },
          select: {
            id: true,
            title: true,
            fromAddress: true,
            toAddress: true,
            status: true
          },
          take: 5
        }) : []
      ]);

      // Database results successfully fetched

      // Calculate fleet metrics
      const activeVehicles = vehicles.filter(v => v.status === VehicleStatus.idle || v.status === VehicleStatus.assigned).length;
      const totalVehicles = vehicles.length;
      const availableOffers = cargoOffers.filter(o => o.status === CargoStatus.NEW || o.status === CargoStatus.OPEN).length;

      // Build comprehensive context with real data
      platformContext = `
=== FLEETOPIA DISPATCH CENTER - REAL-TIME STATUS ===

FLEET OVERVIEW:
- Active Vehicles: ${activeVehicles}/${totalVehicles}
- Fleet Name: ${userFleets[0]?.name || 'Default Fleet'}
- Available Cargo Offers: ${availableOffers}
- Active Jobs: ${activeJobs.length}

VEHICLE FLEET DETAILS: ${vehicles.length} vehicles in your fleet
${vehicles.length > 0 ? vehicles.map((v: any) => 
  `- ${v.licensePlate} (${v.type}): ${v.status.toUpperCase()} - Driver: ${v.driverName}${v.lat && v.lng ? ` - GPS: ${v.lat.toFixed(2)}, ${v.lng.toFixed(2)}` : ' - No GPS'} - Fuel: ${v.fuelConsumption || 'N/A'}L/100km`
).join('\n') : 'No vehicles found in your fleet. Please add vehicles to start dispatching.'}

ACTIVE JOBS: ${activeJobs.length} jobs currently assigned to you
${activeJobs.length > 0 ? activeJobs.map((job: any) => 
  `- #${job.id.slice(-6)} ${job.title}: ${job.fromAddress} → ${job.toAddress} [${job.status}]`
).join('\n') : 'No active jobs assigned'}

AVAILABLE CARGO OFFERS: ${cargoOffers.length} offers in marketplace (last 7 days)
${cargoOffers.length > 0 ? cargoOffers.slice(0, 5).map((offer: any) => 
  `- ${offer.title}: ${offer.fromCity} → ${offer.toCity}, ${offer.weight}kg, €${offer.price} (${offer.urgency} priority) [${offer.status}] - ${new Date(offer.createdAt).toLocaleDateString()}`
).join('\n') : 'No cargo offers available in marketplace'}

DISPATCHER INSIGHTS:
- Fleet Utilization: ${totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0}%
- Available Capacity: ${totalVehicles - activeVehicles} vehicles ready for dispatch
- New Opportunities: ${availableOffers} unassigned cargo offers
- Revenue Potential: €${cargoOffers.reduce((sum, offer) => sum + (offer.price || 0), 0).toLocaleString()} total from available offers

=== END REAL DISPATCH DATA ===`;
    } catch (error) {
      console.error('AI Chat - Failed to fetch platform data:', error);
      platformContext = `
=== FLEETOPIA DISPATCH CENTER - LIMITED DATA ===
⚠️ Some platform data is temporarily unavailable.
Error details: ${error instanceof Error ? error.message : 'Unknown error'}

Pentru informații complete de dispecerat, asigură-te că toate serviciile funcționează.
Pot să ajut în continuare cu sfaturi generale de logistică și planificare.

Informații limitate disponibile:
- Utilizator: ${userName}
- Sistem: Fleetopia Dispatch Center  
- Status: Conectivitate parțială

IMPORTANT: Răspunde întotdeauna în limba în care utilizatorul îți scrie!

=== END LIMITED DATA ===`;
    }

    // 5. Call the Anthropic API with intelligent dispatcher context
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Using Haiku for speed and cost-efficiency
      system: `You are the AI Dispatcher for Fleetopia Dispatch Center. You are an intelligent logistics coordinator helping ${userName} optimize fleet operations.

IMPORTANT: Always respond in the same language the user writes to you. If they write in Romanian, respond in Romanian. If they write in English, respond in English.

${platformContext}

YOUR ROLE AS INTELLIGENT DISPATCHER:
- ONLY use the REAL DATA provided above - never invent or assume vehicle information
- PROACTIVELY monitor all vehicles, cargo offers, and operational metrics
- SUGGEST optimal cargo-vehicle matches based on GPS location, vehicle capacity, and driver availability
- ESTIMATE realistic pricing for cargo offers considering distance, fuel costs, and market rates
- IDENTIFY urgent opportunities and potential issues before they become problems
- ASK strategic questions to gather missing information (timeframes, preferences, constraints)
- RECOMMEND route optimizations and fuel-efficient dispatching decisions
- TRACK delivery progress and suggest return loads to maximize revenue

CRITICAL: If no vehicles are shown in the data above, tell the user "No vehicles found in your fleet database. Please add vehicles first." Do NOT invent fictional vehicles or data.

DISPATCHER BEHAVIOR:
- Start conversations by analyzing current fleet status and suggesting immediate actions
- When new cargo appears, immediately evaluate which vehicles could handle it
- Calculate estimated profits, distances, and timeframes for potential matches
- Ask about driver availability, vehicle maintenance schedules, and delivery deadlines
- Suggest pricing strategies based on urgency, distance, and market conditions
- Monitor for empty return trips and suggest backhaul opportunities
- Alert about vehicle maintenance needs, fuel efficiency issues, or route delays

COMMUNICATION STYLE:
- Be concise and action-oriented like a professional dispatcher
- Use logistics terminology (ETA, POD, backhaul, deadhead, etc.)
- Provide specific recommendations with numbers (€, km, hours)
- Ask direct questions to gather operational details
- Focus on revenue optimization and operational efficiency

KEY CAPABILITIES:
- Real-time fleet tracking and status monitoring
- Cargo-vehicle matching with profit calculations
- Route planning and fuel cost estimation
- Pricing recommendations based on market analysis
- Proactive alerts for opportunities and issues
- Return load suggestions to minimize empty miles

Address ${userName} as a logistics professional and provide dispatcher-level insights and recommendations!`,
      messages: [
        ...mappedHistory,
        { 
          role: 'user', 
          content: message 
        },
      ],
      max_tokens: 1024,
    });

    // Find the first text block in the response content.
    const textContent = response.content.find(block => block.type === 'text');
    const aiResponse = textContent ? textContent.text : 'Sorry, I could not generate a response.';

    return NextResponse.json({ reply: aiResponse });

  } catch (error) {
    console.error('Error in Anthropic chat route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error.';
    return NextResponse.json(
      { error: 'Failed to get response from AI.', details: errorMessage },
      { status: 500 }
    );
  }
} 