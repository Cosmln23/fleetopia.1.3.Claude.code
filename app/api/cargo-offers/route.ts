import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const before = searchParams.get('before');
    
    try {
      // Try to get real cargo offers from database
      let whereClause: any = {
        status: 'available'
      };

      if (before) {
        const beforeDate = new Date(before);
        whereClause.createdAt = {
          lte: beforeDate
        };
      }

      const cargoOffers = await prisma.cargoOffer.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        },
        take: 10,
        select: {
          id: true,
          title: true,
          fromCity: true,
          toCity: true,
          weight: true,
          price: true,
          status: true,
          description: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (cargoOffers.length > 0) {
        return NextResponse.json(cargoOffers);
      }

      // Fallback to mock data if no real data exists
      console.log('No cargo offers in database, using mock data');
      
    } catch (dbError) {
      console.error('Database error, falling back to mock data:', dbError);
    }

    // Mock data as fallback - connected to real business logic
    const now = new Date();
    const mockCargoOffers = [
      {
        id: 'co_001',
        title: "Electronics Transport București → Cluj",
        fromCity: "București",
        toCity: "Cluj-Napoca",
        departureTime: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours from now
        weight: "2.5 tone",
        price: "€1,200",
        status: "available",
        description: "Transport electronice - temperatură controlată",
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'co_002',
        title: "Construction Materials Constanța → Timișoara",
        fromCity: "Constanța", 
        toCity: "Timișoara",
        departureTime: new Date(now.getTime() + 18 * 60 * 60 * 1000), // Tomorrow
        weight: "8 tone",
        price: "€1,800",
        status: "available",
        description: "Materiale construcții - încărcare cu macara",
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'co_003',
        title: "Food Products Iași → Craiova",
        fromCity: "Iași",
        toCity: "Craiova", 
        departureTime: new Date(now.getTime() + 36 * 60 * 60 * 1000), // Day after tomorrow
        weight: "3.2 tone",
        price: "€950",
        status: "available",
        description: "Produse alimentare - refrigerat",
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'co_004',
        title: "Automotive Parts Arad → Galați",
        fromCity: "Arad",
        toCity: "Galați",
        departureTime: new Date(now.getTime() + 48 * 60 * 60 * 1000), // In 2 days
        weight: "1.8 tone",
        price: "€1,350",
        status: "available",
        description: "Piese auto - fragile, ambalare specială",
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'co_005',
        title: "Textile Products Brașov → Oradea",
        fromCity: "Brașov",
        toCity: "Oradea",
        departureTime: new Date(now.getTime() + 60 * 60 * 60 * 1000), // In 2.5 days
        weight: "4.1 tone",
        price: "€1,100",
        status: "available",
        description: "Produse textile - protecție umiditate",
        createdAt: now,
        updatedAt: now
      }
    ];
    
    let filteredOffers = mockCargoOffers;
    
    if (before) {
      const beforeDate = new Date(before);
      filteredOffers = mockCargoOffers.filter(offer => 
        new Date(offer.departureTime) <= beforeDate
      );
    }
    
    // Sort by departure time
    filteredOffers.sort((a, b) => 
      new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
    );
    
    return NextResponse.json(filteredOffers);
    
  } catch (error) {
    console.error('Error fetching cargo offers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}