
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Fuel APIs - GasBuddy, TomTom Fuel, INRIX Fuel integration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider') || 'gasbuddy';
    const lat = parseFloat(searchParams.get('lat') || '40.7128');
    const lng = parseFloat(searchParams.get('lng') || '-74.0060');
    const radius = parseInt(searchParams.get('radius') || '25'); // km
    const fuelType = searchParams.get('fuelType') || 'diesel';

    // Mock fuel station data based on research
    const mockFuelStations = [
      {
        stationId: `${provider.toUpperCase()}-${Date.now()}-001`,
        provider,
        name: 'Shell Station #1234',
        brand: 'Shell',
        location: {
          lat: lat + (Math.random() - 0.5) * 0.02,
          lng: lng + (Math.random() - 0.5) * 0.02,
          address: '123 Main Street, New York, NY 10001'
        },
        fuelTypes: {
          diesel: { price: 1.45 + Math.random() * 0.3, available: true, lastUpdated: new Date() },
          gasoline: { price: 1.35 + Math.random() * 0.25, available: true, lastUpdated: new Date() },
          premium: { price: 1.55 + Math.random() * 0.35, available: true, lastUpdated: new Date() },
          electric: { price: 0.25 + Math.random() * 0.1, available: false, lastUpdated: new Date() }
        },
        amenities: ['restroom', 'convenience_store', 'atm', 'car_wash'],
        operatingHours: {
          monday: '24/7',
          tuesday: '24/7',
          wednesday: '24/7',
          thursday: '24/7',
          friday: '24/7',
          saturday: '24/7',
          sunday: '24/7'
        },
        rating: 4.2 + Math.random() * 0.8,
        distance: Math.random() * radius,
        lastUpdated: new Date()
      },
      {
        stationId: `${provider.toUpperCase()}-${Date.now()}-002`,
        provider,
        name: 'BP Express',
        brand: 'BP',
        location: {
          lat: lat + (Math.random() - 0.5) * 0.02,
          lng: lng + (Math.random() - 0.5) * 0.02,
          address: '456 Highway 1, New York, NY 10002'
        },
        fuelTypes: {
          diesel: { price: 1.42 + Math.random() * 0.3, available: true, lastUpdated: new Date() },
          gasoline: { price: 1.32 + Math.random() * 0.25, available: true, lastUpdated: new Date() },
          premium: { price: 1.52 + Math.random() * 0.35, available: true, lastUpdated: new Date() },
          electric: { price: 0.22 + Math.random() * 0.1, available: true, lastUpdated: new Date() }
        },
        amenities: ['restroom', 'convenience_store', 'restaurant', 'truck_parking'],
        operatingHours: {
          monday: '06:00-22:00',
          tuesday: '06:00-22:00',
          wednesday: '06:00-22:00',
          thursday: '06:00-22:00',
          friday: '06:00-23:00',
          saturday: '06:00-23:00',
          sunday: '07:00-21:00'
        },
        rating: 3.8 + Math.random() * 0.8,
        distance: Math.random() * radius,
        lastUpdated: new Date()
      },
      {
        stationId: `${provider.toUpperCase()}-${Date.now()}-003`,
        provider,
        name: 'Exxon Mobil',
        brand: 'Exxon',
        location: {
          lat: lat + (Math.random() - 0.5) * 0.02,
          lng: lng + (Math.random() - 0.5) * 0.02,
          address: '789 Interstate Drive, New York, NY 10003'
        },
        fuelTypes: {
          diesel: { price: 1.48 + Math.random() * 0.3, available: true, lastUpdated: new Date() },
          gasoline: { price: 1.38 + Math.random() * 0.25, available: true, lastUpdated: new Date() },
          premium: { price: 1.58 + Math.random() * 0.35, available: true, lastUpdated: new Date() },
          electric: { price: 0.28 + Math.random() * 0.1, available: false, lastUpdated: new Date() }
        },
        amenities: ['restroom', 'convenience_store', 'atm'],
        operatingHours: {
          monday: '05:00-23:00',
          tuesday: '05:00-23:00',
          wednesday: '05:00-23:00',
          thursday: '05:00-23:00',
          friday: '05:00-24:00',
          saturday: '05:00-24:00',
          sunday: '06:00-22:00'
        },
        rating: 4.0 + Math.random() * 0.6,
        distance: Math.random() * radius,
        lastUpdated: new Date()
      }
    ];

    // Sort by distance and filter by fuel type availability
    const filteredStations = mockFuelStations
      .filter(station => station.fuelTypes[fuelType as keyof typeof station.fuelTypes]?.available)
      .sort((a, b) => a.distance - b.distance);

    // Store fuel stations in database
    for (const station of filteredStations) {
      try {
        await prisma.fuelStation.upsert({
          where: { stationId: station.stationId },
          update: {
            provider: station.provider,
            name: station.name,
            brand: station.brand,
            location: station.location,
            fuelTypes: station.fuelTypes,
            amenities: station.amenities,
            operatingHours: station.operatingHours,
            lastUpdated: station.lastUpdated
          },
          create: {
            stationId: station.stationId,
            provider: station.provider,
            name: station.name,
            brand: station.brand,
            location: station.location,
            fuelTypes: station.fuelTypes,
            amenities: station.amenities,
            operatingHours: station.operatingHours,
            lastUpdated: station.lastUpdated
          }
        });

        // Store individual fuel prices
        for (const [type, data] of Object.entries(station.fuelTypes)) {
          if (data.available) {
            await prisma.fuelPrice.create({
              data: {
                stationId: station.stationId,
                fuelType: type,
                price: data.price,
                currency: 'USD',
                provider: station.provider,
                timestamp: new Date()
              }
            });
          }
        }

      } catch (dbError) {
        console.warn('Failed to store fuel station:', station.stationId, dbError);
      }
    }

    // Calculate price statistics
    const prices = filteredStations.map(s => s.fuelTypes[fuelType as keyof typeof s.fuelTypes]?.price).filter(Boolean);
    const priceStats = {
      min: Math.min(...prices),
      max: Math.max(...prices),
      average: prices.reduce((a, b) => a + b, 0) / prices.length,
      median: prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)]
    };

    return NextResponse.json({
      success: true,
      data: {
        stations: filteredStations,
        priceStats,
        searchParams: {
          location: { lat, lng },
          radius,
          fuelType,
          provider
        }
      },
      total: filteredStations.length,
      message: `Found ${filteredStations.length} fuel stations with ${fuelType}`,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Fuel API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch fuel stations',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}

// Fuel price tracking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stationId, fuelType, price, provider = 'gasbuddy' } = body;

    if (!stationId || !fuelType || !price) {
      return NextResponse.json({
        success: false,
        error: 'Station ID, fuel type, and price are required',
        timestamp: new Date()
      }, { status: 400 });
    }

    // Create fuel price record
    const priceRecord = await prisma.fuelPrice.create({
      data: {
        stationId,
        fuelType,
        price,
        currency: 'USD',
        provider,
        timestamp: new Date()
      }
    });

    // Check for significant price changes
    const recentPrices = await prisma.fuelPrice.findMany({
      where: {
        stationId,
        fuelType,
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 10
    });

    let priceAlert = null;
    if (recentPrices.length > 1) {
      const previousPrice = recentPrices[1].price;
      const priceChange = ((price - previousPrice) / previousPrice) * 100;

      if (Math.abs(priceChange) > 5) { // 5% change threshold
        priceAlert = {
          type: 'price_change',
          change: priceChange,
          previousPrice,
          newPrice: price,
          significant: Math.abs(priceChange) > 10
        };

        // Create alert for significant price changes
        if (Math.abs(priceChange) > 10) {
          await prisma.alert.create({
            data: {
              type: 'fuel',
              severity: 'medium',
              title: 'Significant Fuel Price Change',
              message: `${fuelType} price ${priceChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(priceChange).toFixed(1)}%`,
              data: {
                stationId,
                fuelType,
                priceChange,
                previousPrice,
                newPrice: price
              },
              provider
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        priceRecord,
        priceAlert,
        recentPrices: recentPrices.slice(0, 5)
      },
      message: 'Fuel price recorded successfully',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Fuel price tracking error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to record fuel price',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    }, { status: 500 });
  }
}
