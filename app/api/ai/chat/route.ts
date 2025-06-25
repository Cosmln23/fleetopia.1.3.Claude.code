import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';

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

    // 4. Fetch comprehensive platform context for intelligent dispatcher
    let platformContext = '';
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const headers = {
        'Authorization': req.headers.get('Authorization') || '',
        'Cookie': req.headers.get('Cookie') || ''
      };
      
      // Fetch all dispatch center data in parallel
      const [dashboardRes, cargoRes, vehiclesRes, jobsRes, dispatcherRes, cargoOffersRes] = await Promise.all([
        fetch(`${baseUrl}/api/dashboard`, { headers }),
        fetch(`${baseUrl}/api/marketplace/cargo`, { headers }),
        fetch(`${baseUrl}/api/vehicles?limit=10`, { headers }),
        fetch(`${baseUrl}/api/dispatch/jobs?status=TAKEN,IN_PROGRESS,COMPLETED,CANCELED`, { headers }),
        fetch(`${baseUrl}/api/dispatcher/analysis`, { headers }),
        fetch(`${baseUrl}/api/cargo-offers`, { headers })
      ]);

      const dashboard = dashboardRes.ok ? await dashboardRes.json() : null;
      const cargo = cargoRes.ok ? await cargoRes.json() : null;
      const vehicles = vehiclesRes.ok ? await vehiclesRes.json() : null;
      const jobs = jobsRes.ok ? await jobsRes.json() : null;
      const dispatcherAnalysis = dispatcherRes.ok ? await dispatcherRes.json() : null;
      const cargoOffers = cargoOffersRes.ok ? await cargoOffersRes.json() : null;

      // Build comprehensive context
      platformContext = `
=== FLEETOPIA DISPATCH CENTER - REAL-TIME STATUS ===

FLEET OVERVIEW:
- Active Vehicles: ${dashboard?.activeVehicles || 0}/${dashboard?.totalVehicles || 0}
- AI Agents Online: ${dashboard?.aiAgentsOnline || 0}
- Today's Revenue: €${dashboard?.revenueToday || 0}
- Fuel Efficiency: ${dashboard?.fuelEfficiency || 0}%

VEHICLE FLEET DETAILS: ${vehicles?.success ? vehicles.data?.vehicles?.length || 0 : 0} vehicles tracked
${vehicles?.success ? vehicles.data?.vehicles?.map((v: any) => 
  `- ${v.licensePlate} (${v.type}): ${v.status.toUpperCase()} - Driver: ${v.driverName}${v.lat && v.lng ? ` - GPS: ${v.lat.toFixed(2)}, ${v.lng.toFixed(2)}` : ' - No GPS'}`
).join('\n') || 'No vehicle data available' : 'No vehicle data available'}

ACTIVE JOBS: ${jobs?.length || 0} jobs in system
${jobs?.slice(0, 4)?.map((job: any) => 
  `- #${job.id.slice(-3)} ${job.fromAddress} → ${job.toAddress} [${job.status}]`
).join('\n') || 'No active jobs'}

CARGO MARKETPLACE: ${cargo?.length || 0} marketplace offers
${cargo?.slice(0, 5)?.map((offer: any) => 
  `- ${offer.title}: ${offer.fromCity} → ${offer.toCity}, ${offer.weight}kg, €${offer.price} (${offer.urgency} priority) [${offer.status}]`
).join('\n') || 'No marketplace offers available'}

CARGO OFFERS DATABASE: ${cargoOffers?.length || 0} total offers in system
${cargoOffers?.slice(0, 3)?.map((offer: any) => 
  `- ${offer.title}: ${offer.fromCity} → ${offer.toCity}, €${offer.price}`
).join('\n') || 'No cargo offers in database'}

AI DISPATCHER ANALYSIS:
- Available Vehicles: ${dispatcherAnalysis?.availableVehicles || 0}
- New Offers: ${dispatcherAnalysis?.newOffers || 0}
- AI Suggestions Generated: ${dispatcherAnalysis?.suggestions?.length || 0}
${dispatcherAnalysis?.suggestions?.slice(0, 2)?.map((s: any) => 
  `  • ${s.title}: €${s.estimatedProfit} profit, ${s.estimatedDistance}km, ${Math.round(s.confidence * 100)}% confidence`
).join('\n') || ''}

=== END DISPATCH DATA ===`;
    } catch (error) {
      platformContext = 'Real-time dispatch data temporarily unavailable.';
    }

    // 5. Call the Anthropic API with intelligent dispatcher context
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Using Haiku for speed and cost-efficiency
      system: `You are the AI Dispatcher for Fleetopia Dispatch Center. You are an intelligent logistics coordinator helping ${userName} optimize fleet operations.

${platformContext}

YOUR ROLE AS INTELLIGENT DISPATCHER:
- PROACTIVELY monitor all vehicles, cargo offers, and operational metrics
- SUGGEST optimal cargo-vehicle matches based on GPS location, vehicle capacity, and driver availability
- ESTIMATE realistic pricing for cargo offers considering distance, fuel costs, and market rates
- IDENTIFY urgent opportunities and potential issues before they become problems
- ASK strategic questions to gather missing information (timeframes, preferences, constraints)
- RECOMMEND route optimizations and fuel-efficient dispatching decisions
- TRACK delivery progress and suggest return loads to maximize revenue

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