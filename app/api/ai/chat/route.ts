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
  `- ID: ${offer.id} | ${offer.title}: ${offer.fromCity} → ${offer.toCity}, ${offer.weight}kg, €${offer.price} (${offer.urgency} priority) [${offer.status}] - ${new Date(offer.createdAt).toLocaleDateString()}`
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

CARGO OFFER ACTIONS:
- When user asks about sending offers to cargo owners, offer 2 options:
  Option 1: "Go manually to marketplace card and send offer yourself"
  Option 2: "I can send the offer for you directly (same as clicking Send Offer on card)"
- Use send_cargo_offer tool ONLY after user explicitly confirms they want you to send it
- IMPORTANT: Always use the exact cargo ID from the list above (e.g. "ID: clzxxx...") 
- Always show: exact cargo ID, price, and ask "Să trimit oferta? (DA/NU)" before using the tool
- Example: "Found cargo ID: clzxxxyyy for Cluj transport. Send offer €2400? (DA/NU)"

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
        },
        {
          name: "send_cargo_offer",
          description: "Send an offer for a cargo directly through the marketplace system",
          input_schema: {
            type: "object",
            properties: {
              cargoId: {
                type: "string",
                description: "The ID of the cargo offer to send an offer for"
              },
              price: {
                type: "number",
                description: "The price to offer for the cargo"
              }
            },
            required: ["cargoId", "price"]
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
        } else if (content.name === 'send_cargo_offer') {
          try {
            const { cargoId, price } = content.input as { cargoId: string; price: number };
            
            // Debug logging
            console.log('AI send_cargo_offer attempt:', { cargoId, price, type: typeof cargoId });
            
            // Validate inputs
            if (!cargoId || !price || price <= 0) {
              toolResults.push(`❌ Invalid offer parameters: cargoId="${cargoId}", price=${price}`);
              continue;
            }

            // Use the same logic as the marketplace API
            const cargoOffer = await prisma.cargoOffer.findUnique({
              where: { id: cargoId },
            });

            if (!cargoOffer) {
              console.log('Cargo offer not found in database:', cargoId);
              // Try to find similar IDs for debugging
              const similarOffers = await prisma.cargoOffer.findMany({
                where: { 
                  OR: [
                    { id: { contains: cargoId.slice(-6) } },
                    { title: { contains: cargoId, mode: 'insensitive' } }
                  ]
                },
                select: { id: true, title: true },
                take: 3
              });
              console.log('Similar offers found:', similarOffers);
              toolResults.push(`❌ Cargo offer "${cargoId}" not found. Available offers: ${similarOffers.map(o => o.id).join(', ')}`);
              continue;
            }
            
            if (cargoOffer.userId === userId) {
              toolResults.push(`❌ You cannot make an offer on your own cargo`);
              continue;
            }

            // Check if the offered price is higher than the asking price
            const originalPrice = cargoOffer.price;
            const isHigherOffer = price > originalPrice;
            const priceDifference = price - originalPrice;
            
            // Create simple professional message
            let chatMessage = `Price offer: €${price}`;
            if (isHigherOffer) {
              chatMessage = `Price offer: €${price} (€${priceDifference} above asking price)`;
            }

            // Use prisma transaction to ensure both operations succeed or fail together
            await prisma.$transaction([
              // 1. Create or update the offer request
              prisma.offerRequest.upsert({
                where: { cargoOfferId_transporterId: { cargoOfferId: cargoId, transporterId: userId } },
                update: { price, status: 'PENDING' },
                create: {
                  cargoOfferId: cargoId,
                  transporterId: userId,
                  price,
                },
              }),

              // 2. Create the automated chat message with special handling for higher offers
              prisma.chatMessage.create({
                data: {
                  cargoOfferId: cargoId,
                  senderId: userId,
                  content: chatMessage,
                },
              }),
            ]);

            // Create special system alert for higher offers
            if (isHigherOffer) {
              await prisma.systemAlert.create({
                data: {
                  message: `💰 Premium Offer Alert: €${price} received for "${cargoOffer.title}" (€${priceDifference} above asking price!)`,
                  type: 'premium_offer',
                  relatedId: cargoId,
                  details: `Transporter offered €${price} for cargo originally priced at €${originalPrice}. This is €${priceDifference} above your asking price.`
                }
              });
            }

            // Return simple confirmation message
            toolResults.push(`Offer sent: €${price}. Check chat for responses.`);
          } catch (error) {
            toolResults.push(`❌ Offer error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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