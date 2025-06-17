import { prisma } from './prisma';
import { cachedQuery, cacheHelpers, cacheInvalidation } from './cache';

/**
 * Cached database operations for common queries
 */
export const dbUtils = {
  // Fleet operations with caching
  async getUserFleets(userId: string) {
    return cachedQuery(
      cacheHelpers.getUserFleets(userId),
      () => prisma.fleet.findMany({
        where: { userId },
        include: {
          vehicles: {
            select: {
              id: true,
              name: true,
              licensePlate: true,
              status: true,
              type: true,
              fuelConsumption: true
            }
          },
          _count: {
            select: { vehicles: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      10 * 60 * 1000 // 10 minutes cache
    );
  },

  async getFleetVehicles(fleetId: string, status?: string) {
    const cacheKey = status 
      ? `${cacheHelpers.getFleetVehicles(fleetId)}:${status}`
      : cacheHelpers.getFleetVehicles(fleetId);

    return cachedQuery(
      cacheKey,
      () => prisma.vehicle.findMany({
        where: {
          fleetId,
          ...(status ? { status: status as any } : {})
        },
        orderBy: { name: 'asc' }
      }),
      5 * 60 * 1000 // 5 minutes cache
    );
  },

  // Cargo operations with caching
  async getCargoOffers(filters: any, page: number = 1, limit: number = 20) {
    const cacheKey = `${cacheHelpers.getCargoOffers(filters)}:${page}:${limit}`;
    
    return cachedQuery(
      cacheKey,
      async () => {
        const offset = (page - 1) * limit;
        
        const [cargoOffers, totalCount] = await Promise.all([
          prisma.cargoOffer.findMany({
            where: filters,
            select: {
              id: true,
              title: true,
              weight: true,
              price: true,
              companyName: true,
              urgency: true,
              createdAt: true,
              fromCity: true,
              toCity: true,
              fromCountry: true,
              toCountry: true,
              status: true,
              distance: true,
              cargoType: true,
              deliveryDate: true,
              loadingDate: true,
              priceType: true,
              userId: true,
              acceptedByUserId: true,
              volume: true,
              requirements: true,
              companyRating: true
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
          }),
          prisma.cargoOffer.count({ where: filters })
        ]);

        return {
          cargoOffers,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
          }
        };
      },
      2 * 60 * 1000 // 2 minutes cache for cargo offers
    );
  },

  async getUserCargoOffers(userId: string, listType?: string) {
    return cachedQuery(
      cacheHelpers.getUserCargoOffers(userId, listType),
      async () => {
        let filters: any = {};

        if (listType === 'my_offers') {
          filters.userId = userId;
        } else if (listType === 'accepted_offers') {
          filters.acceptedByUserId = userId;
          filters.status = { in: ['TAKEN', 'COMPLETED'] };
        } else if (listType === 'conversations') {
          filters.OR = [
            { userId: userId },
            { acceptedByUserId: userId }
          ];
          filters.status = 'TAKEN';
        }

        return prisma.cargoOffer.findMany({
          where: filters,
          orderBy: { createdAt: 'desc' },
          take: 50 // Limit for performance
        });
      },
      3 * 60 * 1000 // 3 minutes cache
    );
  },

  // Dispatcher operations with caching
  async getDispatcherAnalysis(userId: string) {
    return cachedQuery(
      cacheHelpers.getDispatcherAnalysis(userId),
      async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const [userFleets, newOffers] = await Promise.all([
          prisma.fleet.findMany({
            where: { userId },
            include: {
              vehicles: {
                where: { status: { in: ['idle', 'assigned'] } },
                select: {
                  id: true,
                  name: true,
                  licensePlate: true,
                  status: true,
                  type: true,
                  fuelConsumption: true
                }
              }
            }
          }),
          prisma.cargoOffer.findMany({
            where: {
              status: 'NEW',
              createdAt: { gte: yesterday }
            },
            select: {
              id: true,
              title: true,
              price: true,
              fromCity: true,
              toCity: true,
              fromCountry: true,
              toCountry: true,
              distance: true,
              urgency: true,
              weight: true,
              cargoType: true
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          })
        ]);

        const availableVehicles = userFleets.reduce((acc, fleet) => acc + fleet.vehicles.length, 0);

        return {
          availableVehicles,
          newOffers: newOffers.length,
          userFleets,
          newOffers: newOffers
        };
      },
      1 * 60 * 1000 // 1 minute cache for dispatcher analysis
    );
  },

  // Chat operations with caching
  async getChatMessages(cargoOfferId: string) {
    return cachedQuery(
      cacheHelpers.getChatMessages(cargoOfferId),
      () => prisma.chatMessage.findMany({
        where: { cargoOfferId },
        include: {
          sender: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'asc' },
        take: 100 // Limit for performance
      }),
      30 * 1000 // 30 seconds cache for chat messages
    );
  },

  // System alerts with caching
  async getSystemAlerts(type?: string) {
    return cachedQuery(
      cacheHelpers.getSystemAlerts(type),
      () => prisma.systemAlert.findMany({
        where: type ? { type } : {},
        orderBy: { createdAt: 'desc' },
        take: 50 // Limit for performance
      }),
      1 * 60 * 1000 // 1 minute cache
    );
  },

  // Cache invalidation helpers for mutations
  async createVehicle(data: any, userId: string) {
    const result = await prisma.vehicle.create({ data });
    
    // Invalidate related caches
    cacheInvalidation.invalidateFleet(data.fleetId, userId);
    
    return result;
  },

  async updateVehicle(id: string, data: any, userId: string) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id },
      include: { fleet: true }
    });

    const result = await prisma.vehicle.update({
      where: { id },
      data
    });
    
    // Invalidate related caches
    if (vehicle) {
      cacheInvalidation.invalidateFleet(vehicle.fleetId, userId);
    }
    
    return result;
  },

  async createCargoOffer(data: any, userId: string) {
    const result = await prisma.cargoOffer.create({ data });
    
    // Invalidate cargo-related caches
    cacheInvalidation.invalidateCargo(result.id);
    cacheInvalidation.invalidateUser(userId);
    
    return result;
  },

  async updateCargoOffer(id: string, data: any, userId: string) {
    const result = await prisma.cargoOffer.update({
      where: { id },
      data
    });
    
    // Invalidate cargo-related caches
    cacheInvalidation.invalidateCargo(id);
    cacheInvalidation.invalidateUser(userId);
    
    return result;
  },

  async acceptCargoOffer(cargoOfferId: string, vehicleId: string, userId: string) {
    const result = await prisma.$transaction(async (tx) => {
      const cargoOffer = await tx.cargoOffer.findFirst({
        where: { id: cargoOfferId, status: 'NEW' }
      });

      if (!cargoOffer) {
        throw new Error('Cargo offer is no longer available');
      }

      const vehicle = await tx.vehicle.findFirst({
        where: { 
          id: vehicleId,
          status: { in: ['idle', 'assigned'] },
          fleet: { userId }
        },
        include: { fleet: true }
      });

      if (!vehicle) {
        throw new Error('Vehicle is not available for assignment');
      }

      const [updatedCargo, updatedVehicle] = await Promise.all([
        tx.cargoOffer.update({
          where: { id: cargoOfferId },
          data: { 
            status: 'TAKEN',
            acceptedByUserId: userId,
            acceptedAt: new Date()
          }
        }),
        tx.vehicle.update({
          where: { id: vehicleId },
          data: { 
            status: 'en_route',
            currentRoute: `${cargoOffer.fromCity} → ${cargoOffer.toCity}`
          }
        })
      ]);

      return { cargo: updatedCargo, vehicle: updatedVehicle };
    });

    // Invalidate all related caches
    cacheInvalidation.invalidateCargo(cargoOfferId);
    cacheInvalidation.invalidateUser(userId);
    
    return result;
  }
};

/**
 * Database health check with performance metrics
 */
export async function dbHealthCheck() {
  const start = Date.now();
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: `${Date.now() - start}ms`,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Database performance optimization suggestions
 */
export async function getPerformanceMetrics() {
  try {
    // Get table sizes (PostgreSQL specific)
    const tableSizes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname = 'public'
      ORDER BY n_distinct DESC
      LIMIT 10;
    ` as any[];

    return {
      tableSizes,
      suggestions: [
        'Consider adding indexes for frequently queried columns',
        'Monitor slow queries and optimize them',
        'Use pagination for large result sets',
        'Consider implementing connection pooling'
      ]
    };
  } catch (error) {
    return {
      error: 'Could not fetch performance metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}