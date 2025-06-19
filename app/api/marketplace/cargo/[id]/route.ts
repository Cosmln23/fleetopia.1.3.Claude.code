import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const { params } = context;
  try {
    console.log('DELETE API: Starting delete process');
    
    const session = await getServerSession(authOptions);
    console.log('DELETE API: Session obtained:', session?.user?.id ? 'Valid' : 'Invalid');
    
    if (!session || !session.user || !session.user.id) {
      console.log('DELETE API: Unauthorized - no valid session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    console.log('DELETE API: Cargo ID:', id);

    // Check if the cargo offer exists and belongs to the user
    const cargoOffer = await prisma.cargoOffer.findUnique({
      where: { id },
      select: { userId: true }
    });
    console.log('DELETE API: Cargo found:', cargoOffer ? 'Yes' : 'No');

    if (!cargoOffer) {
      console.log('DELETE API: Cargo not found');
      return NextResponse.json({ error: 'Cargo offer not found' }, { status: 404 });
    }

    if (cargoOffer.userId !== session.user.id) {
      console.log('DELETE API: Permission denied - user mismatch');
      return NextResponse.json({ error: 'You can only delete your own cargo offers' }, { status: 403 });
    }

    console.log('DELETE API: Attempting to delete cargo with related data');
    
    // Delete related records first to avoid foreign key constraint violations
    
    // Delete chat messages
    await prisma.chatMessage.deleteMany({
      where: { cargoOfferId: id }
    });
    console.log('DELETE API: Chat messages deleted');
    
    // Delete offer requests (if they exist)
    await prisma.offerRequest.deleteMany({
      where: { cargoOfferId: id }
    }).catch(() => {
      // Ignore error if OfferRequest table doesn't exist
      console.log('DELETE API: OfferRequest table not found, skipping');
    });
    console.log('DELETE API: Offer requests deleted');
    
    // Delete system alerts related to this cargo
    await prisma.systemAlert.deleteMany({
      where: { relatedId: id }
    }).catch(() => {
      // Ignore error if not found
      console.log('DELETE API: System alerts not found, skipping');
    });
    console.log('DELETE API: System alerts deleted');
    
    // Now delete the cargo offer
    await prisma.cargoOffer.delete({
      where: { id },
    });
    console.log('DELETE API: Cargo deleted successfully');
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE API: Error occurred:`, error);
    return NextResponse.json(
      { error: 'Failed to delete cargo offer', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const { params } = context;
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const body = await request.json();
    
    const updatedCargoOffer = await prisma.cargoOffer.update({
      where: { id },
      data: {
        ...body,
        // Ensure numeric fields are correctly typed
        weight: body.weight ? parseFloat(body.weight) : undefined,
        volume: body.volume ? parseFloat(body.volume) : undefined,
        price: body.price ? parseFloat(body.price) : undefined,
        loadingDate: body.loadingDate ? new Date(body.loadingDate) : undefined,
        deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : undefined,
        requirements: body.requirements ? body.requirements.split(',').map((req: string) => req.trim()).filter(Boolean) : undefined,
      },
    });

    return NextResponse.json(updatedCargoOffer, { status: 200 });
  } catch (error) {
    console.error(`Error updating cargo offer:`, error);
    return NextResponse.json({ message: 'Error updating cargo offer' }, { status: 500 });
  }
} 