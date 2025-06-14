
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Freight Matching API - Uber Freight, Convoy, Loadsmart integration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'uber_freight';
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Mock freight loads data based on research
    const mockFreightLoads = [
      {
        loadId: `UF-${Date.now()}-001`,
        provider: 'uber_freight',
        origin: { lat: 40.7128, lng: -74.0060, address: 'New York, NY' },
        destination: { lat: 34.0522, lng: -118.2437, address: 'Los Angeles, CA' },
        pickupDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        weight: 15000,
        distance: 2789,
        rate: 3500,
        status: 'available',
        requirements: {
          equipmentType: 'dry_van',
          hazmat: false,
          temperature_controlled: false
        },
        biddingData: {
          bidDeadline: new Date(Date.now() + 12 * 60 * 60 * 1000),
          currentBids: 12,
          suggestedRate: 3200
        }
      },
      {
        loadId: `CV-${Date.now()}-002`,
        provider: 'convoy',
        origin: { lat: 41.8781, lng: -87.6298, address: 'Chicago, IL' },
        destination: { lat: 29.7604, lng: -95.3698, address: 'Houston, TX' },
        pickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        weight: 22000,
        distance: 1082,
        rate: 2100,
        status: 'available',
        requirements: {
          equipmentType: 'flatbed',
          hazmat: true,
          temperature_controlled: false
        },
        biddingData: {
          bidDeadline: new Date(Date.now() + 8 * 60 * 60 * 1000),
          currentBids: 8,
          suggestedRate: 1950
        }
      },
      {
        loadId: `LS-${Date.now()}-003`,
        provider: 'loadsmart',
        origin: { lat: 25.7617, lng: -80.1918, address: 'Miami, FL' },
        destination: { lat: 33.4484, lng: -84.3880, address: 'Atlanta, GA' },
        pickupDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        deliveryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        weight: 18500,
        distance: 662,
        rate: 1800,
        status: 'available',
        requirements: {
          equipmentType: 'reefer',
          hazmat: false,
          temperature_controlled: true,
          temperature_range: { min: 35, max: 38 }
        },
        biddingData: {
          bidDeadline: new Date(Date.now() + 6 * 60 * 60 * 1000),
          currentBids: 15,
          suggestedRate: 1750
        }
      }
    ];

    // Filter by provider if specified
    const filteredLoads = provider === 'all' 
      ? mockFreightLoads 
      : mockFreightLoads.filter(load => load.provider === provider);

    // Store in database
    for (const load of filteredLoads.slice(0, limit)) {
      await prisma.freightLoad.upsert({
        where: { loadId: load.loadId },
        update: {
          provider: load.provider,
          origin: load.origin,
          destination: load.destination,
          pickupDate: load.pickupDate,
          deliveryDate: load.deliveryDate,
          weight: load.weight,
          distance: load.distance,
          rate: load.rate,
          status: load.status,
          requirements: load.requirements,
          biddingData: load.biddingData
        },
        create: {
          loadId: load.loadId,
          provider: load.provider,
          origin: load.origin,
          destination: load.destination,
          pickupDate: load.pickupDate,
          deliveryDate: load.deliveryDate,
          weight: load.weight,
          distance: load.distance,
          rate: load.rate,
          status: load.status,
          requirements: load.requirements,
          biddingData: load.biddingData
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: filteredLoads.slice(0, limit),
      provider,
      total: filteredLoads.length,
      message: `Retrieved ${filteredLoads.slice(0, limit).length} freight loads from ${provider}`,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Freight matching API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch freight loads',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Submit bid for freight load
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loadId, vehicleId, driverId, bidAmount, provider } = body;

    if (!loadId || !vehicleId || !bidAmount) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: loadId, vehicleId, bidAmount',
        timestamp: new Date()
      }, { status: 400 });
    }

    // Create bid record
    const bid = await prisma.loadBid.create({
      data: {
        loadId,
        vehicleId,
        driverId,
        bidAmount,
        provider: provider || 'uber_freight',
        status: 'pending',
        bidData: {
          submissionTime: new Date(),
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          equipmentReady: true
        }
      }
    });

    // Mock bid acceptance logic (30% chance of immediate acceptance)
    const accepted = Math.random() < 0.3;
    if (accepted) {
      await prisma.loadBid.update({
        where: { id: bid.id },
        data: {
          status: 'accepted',
          respondedAt: new Date()
        }
      });

      // Update freight load as matched
      await prisma.freightLoad.updateMany({
        where: { loadId },
        data: {
          matched: true,
          vehicleId,
          status: 'matched'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...bid,
        status: accepted ? 'accepted' : 'pending',
        respondedAt: accepted ? new Date() : null
      },
      message: accepted ? 'Bid accepted!' : 'Bid submitted successfully',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Freight bid submission error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to submit bid',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}
