import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import Anthropic from '@anthropic-ai/sdk';
import prisma from '@/lib/prisma';
import { CargoStatus, VehicleStatus } from '@prisma/client';
import { clerkGmailIntegration } from '@/lib/services/clerk-gmail-integration';

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

    // 5. Call the Anthropic API with intelligent dispatcher context and tools
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Using Haiku for speed and cost-efficiency
      system: `You are the AI Dispatcher for Fleetopia Dispatch Center. You are an intelligent logistics coordinator helping ${userName} optimize fleet operations.

IMPORTANT: Always respond in the same language the user writes to you. If they write in Romanian, respond in Romanian. If they write in English, respond in English.

${platformContext}

YOUR ROLE AS INTELLIGENT DISPATCHER:
- BE DIRECT AND CONCISE: Give short, actionable answers (1-3 sentences max)
- ONLY use the REAL DATA provided above - never invent or assume vehicle information
- FOCUS on immediate dispatch opportunities and urgent decisions
- SUGGEST specific cargo-vehicle matches with clear reasoning
- ASK quick strategic questions to gather missing info
- RECOMMEND one clear action the user should take next
- NEVER send emails automatically! ONLY when user explicitly confirms with "DA" or "YES" after showing email preview

AVAILABLE ACTIONS:
- NEVER use send_email tool automatically - ALWAYS ask for confirmation first
- When user asks about offers, just suggest them - don't send emails
- If user wants to contact someone, show email preview and ASK "Să trimit acest email? (DA/NU)"
- ONLY send after explicit confirmation

CRITICAL: If no vehicles are shown in the data above, tell the user "No vehicles found in your fleet database. Please add vehicles first." Do NOT invent fictional vehicles or data.

RESPONSE STYLE:
- MAX 2-3 sentences per response
- Lead with specific action items
- Use real data (vehicle IDs, exact locations, profit numbers)
- End with clear question or next step

EXAMPLES:
✅ "Vehicle B-123-ABC can take Cluj cargo (€2,400 profit, 180km). Assign now?"
✅ "3 vehicles idle. Check marketplace for new cargo?"
✅ "Urgent: 2h left on high-priority load. Use CT-456-DEF?"
❌ "I can help you with various logistics tasks and analyze your fleet..."`,
      tools: [
        {
          name: "send_email",
          description: "Send an email using the connected Gmail account",
          input_schema: {
            type: "object",
            properties: {
              to: {
                type: "string",
                description: "The recipient email address"
              },
              subject: {
                type: "string", 
                description: "The email subject line"
              },
              body: {
                type: "string",
                description: "The email body content"
              }
            },
            required: ["to", "subject", "body"]
          }
        }
      ],
      messages: [
        ...mappedHistory,
        { 
          role: 'user', 
          content: message 
        },
      ],
      max_tokens: 150,
    });

    // Handle tool calls if present
    let aiResponse = '';
    let toolResults = [];

    for (const content of response.content) {
      if (content.type === 'text') {
        aiResponse += content.text;
      } else if (content.type === 'tool_use') {
        // Execute the tool
        if (content.name === 'send_email') {
          try {
            const { to, subject, body } = content.input as { to: string; subject: string; body: string };
            
            // Check if user has Gmail connected before attempting to send
            try {
              const gmailAdapter = await clerkGmailIntegration.getGmailAdapter(userId);
              const result = await gmailAdapter.sendEmail({
                to: [to],
                subject,
                body,
                isHTML: false,
              });

              if (result.success) {
                toolResults.push(`✅ Email successfully sent to ${to}`);
              } else {
                toolResults.push(`❌ Failed to send email: ${result.error || 'Unknown error'}`);
              }
            } catch (gmailError) {
              // Handle Gmail connection gracefully - don't make it an error
              const errorMsg = gmailError instanceof Error ? gmailError.message : 'Unknown error';
              if (errorMsg.includes('does not have a Gmail account connected') || errorMsg.includes('Gmail account') || errorMsg.includes('oauth')) {
                toolResults.push(`📧 To send emails directly, you can connect your Gmail account in Settings. For now, here's what I would send:\n\n📨 To: ${to}\n📋 Subject: ${subject}\n📝 Message: ${body}\n\n💡 Connect Gmail for automatic sending!`);
              } else {
                toolResults.push(`❌ Email error: ${errorMsg}`);
              }
            }
          } catch (error) {
            toolResults.push(`❌ Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
    }

    // Combine AI response with tool results
    const finalResponse = aiResponse + (toolResults.length > 0 ? '\n\n' + toolResults.join('\n') : '');

    return NextResponse.json({ reply: finalResponse || 'Sorry, I could not generate a response.' });

  } catch (error) {
    console.error('Error in Anthropic chat route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error.';
    return NextResponse.json(
      { error: 'Failed to get response from AI.', details: errorMessage },
      { status: 500 }
    );
  }
} 