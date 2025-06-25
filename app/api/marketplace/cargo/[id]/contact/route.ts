import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST to express interest in a cargo offer (for non-authenticated users)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const offerId = params.id;

    const body = await request.json();
    const { driverName, driverPhone, message } = body;

    if (!driverName || !driverPhone) {
      return NextResponse.json({ 
        message: 'Driver name and phone are required' 
      }, { status: 400 });
    }

    // Check if cargo offer exists
    const cargoOffer = await prisma.cargoOffer.findUnique({
      where: { id: offerId },
      select: { 
        id: true, 
        title: true, 
        fromLocation: true, 
        toLocation: true,
        userId: true,
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!cargoOffer) {
      return NextResponse.json({ 
        message: 'Cargo offer not found' 
      }, { status: 404 });
    }

    // Create a contact request record
    const contactRequest = await prisma.chatMessage.create({
      data: {
        content: `${message}\n\n--- Contact Info ---\nDriver: ${driverName}\nPhone: ${driverPhone}\n\nType: contact_request\nTimestamp: ${new Date().toISOString()}`,
        cargoOfferId: offerId,
        senderId: 'anonymous' // We'll use this for non-authenticated users
      }
    });

    // In a real app, you would:
    // 1. Send SMS/email notification to cargo owner
    // 2. Send confirmation SMS to driver
    // 3. Log the interaction for follow-up

    return NextResponse.json({ 
      success: true,
      message: 'Your interest has been sent to the cargo owner. They will contact you soon!',
      contactId: contactRequest.id
    }, { status: 201 });

  } catch (error) {
    console.error('[API_CONTACT_POST] Error:', error);
    return NextResponse.json({ 
      message: 'Error sending contact request' 
    }, { status: 500 });
  }
}