/**
 * Marketplace Connector
 * Connector for YOUR local Fleetopia marketplace
 * Follows the user's specific plan for cargo marketplace integration
 */

import prisma from '@/lib/prisma';
import { systemConfigService } from '@/lib/system-config-service';

export interface MarketplaceCargo {
  id: string;
  title: string;
  fromCountry: string;
  toCountry: string;
  fromCity: string;
  toCity: string;
  fromPostalCode: string;
  toPostalCode: string;
  fromAddress?: string;
  toAddress?: string;
  weight: number;
  volume?: number;
  cargoType: string;
  price: number;
  priceType: 'fixed' | 'negotiable' | 'per_km';
  loadingDate: Date;
  deliveryDate: Date;
  deadline?: Date;
  pickupLat?: number;
  pickupLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;
  companyName?: string;
  requirements?: string[];
  urgency: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive' | 'completed';
  acceptedBy?: string;
  userId: string;
  lastSync?: Date;
}

class MarketplaceConnector {
  private cache: Map<string, MarketplaceCargo[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 2 * 60 * 1000; // 2 minutes

  /**
   * Get available cargo from marketplace
   * Main method as specified in user's plan
   */
  public async getAvailableCargo(filters?: {
    fromCountry?: string;
    toCountry?: string;
    maxWeight?: number;
    minPrice?: number;
    cargoType?: string;
    urgency?: 'low' | 'medium' | 'high';
    status?: 'active' | 'inactive' | 'completed';
    userId?: string;
  }): Promise<MarketplaceCargo[]> {
    try {
      console.log('🔍 Fetching available cargo from YOUR marketplace...');
      
      // Check cache first
      const cacheKey = JSON.stringify(filters || {});
      if (this.isCacheValid(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (cached) {
          console.log('💾 Returning cached marketplace data');
          return cached;
        }
      }
      
      // Build where clause for filtering
      const where: any = {};
      
      if (filters?.fromCountry) where.fromCountry = filters.fromCountry;
      if (filters?.toCountry) where.toCountry = filters.toCountry;
      if (filters?.maxWeight) where.weight = { lte: filters.maxWeight };
      if (filters?.minPrice) where.price = { gte: filters.minPrice };
      if (filters?.cargoType) where.cargoType = filters.cargoType;
      if (filters?.urgency) where.urgency = filters.urgency;
      if (filters?.status) where.status = filters.status;
      if (filters?.userId) where.userId = filters.userId;
      
      // Get cargo from YOUR marketplace
      const cargoOffers = await prisma.cargoOffer.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true }
          },
          offerRequests: {
            include: {
              user: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: [
          { urgency: 'desc' },
          { price: 'desc' },
          { createdAt: 'desc' }
        ]
      });

      // Transform to MarketplaceCargo format
      const marketplaceCargo = cargoOffers.map(this.transformCargoToMarketplace);
      
      // Cache the results
      this.cache.set(cacheKey, marketplaceCargo);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);
      
      console.log(`✅ Found ${marketplaceCargo.length} cargo offers in YOUR marketplace`);
      return marketplaceCargo;

    } catch (error) {
      console.error('❌ Error fetching marketplace cargo:', error);
      throw error;
    }
  }

  /**
   * Get cargo details for specific cargo
   * As specified in user's plan
   */
  public async getCargoDetails(cargoId: string): Promise<MarketplaceCargo | null> {
    try {
      console.log(`🔍 Fetching cargo details for: ${cargoId}`);

      const cargoOffer = await prisma.cargoOffer.findUnique({
        where: { id: cargoId },
        include: {
          user: {
            select: { name: true, email: true }
          },
          offerRequests: {
            include: {
              user: {
                select: { name: true }
              }
            }
          }
        }
      });

      if (!cargoOffer) {
        console.log(`❌ Cargo not found: ${cargoId}`);
        return null;
      }

      return this.transformCargoToMarketplace(cargoOffer);
    } catch (error) {
      console.error(`❌ Error fetching cargo details for ${cargoId}:`, error);
      throw error;
    }
  }

  /**
   * Update cargo status
   * As specified in user's plan
   */
  public async updateCargoStatus(cargoId: string, status: 'active' | 'inactive' | 'completed'): Promise<boolean> {
    try {
      console.log(`📝 Updating cargo status: ${cargoId} -> ${status}`);

      const updated = await prisma.cargoOffer.update({
        where: { id: cargoId },
        data: { 
          status: status,
          updatedAt: new Date()
        }
      });

      // Clear cache to force refresh
      this.clearCache();
      
      console.log(`✅ Cargo status updated: ${cargoId} -> ${status}`);
      return !!updated;
    } catch (error) {
      console.error(`❌ Error updating cargo status for ${cargoId}:`, error);
      return false;
    }
  }

  /**
   * Get marketplace statistics
   */
  public async getMarketplaceStats(): Promise<{
    totalCargo: number;
    activeCargo: number;
    completedCargo: number;
    urgentCargo: number;
    totalValue: number;
    averagePrice: number;
  }> {
    try {
      const stats = await prisma.cargoOffer.aggregate({
        _count: {
          id: true
        },
        _sum: {
          price: true
        },
        _avg: {
          price: true
        }
      });

      const activeCargo = await prisma.cargoOffer.count({
        where: { status: 'active' }
      });

      const completedCargo = await prisma.cargoOffer.count({
        where: { status: 'completed' }
      });

      const urgentCargo = await prisma.cargoOffer.count({
        where: { 
          status: 'active',
          urgency: 'high' 
        }
      });

      return {
        totalCargo: stats._count.id,
        activeCargo,
        completedCargo,
        urgentCargo,
        totalValue: stats._sum.price || 0,
        averagePrice: stats._avg.price || 0
      };
    } catch (error) {
      console.error('❌ Error getting marketplace stats:', error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
    console.log('🧹 Marketplace cache cleared');
  }

  // Private helper methods

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private transformCargoToMarketplace = (cargo: any): MarketplaceCargo => {
    return {
      id: cargo.id,
      title: cargo.title || `${cargo.fromCity} → ${cargo.toCity}`,
      fromCountry: cargo.fromCountry,
      toCountry: cargo.toCountry,
      fromCity: cargo.fromCity,
      toCity: cargo.toCity,
      fromPostalCode: cargo.fromPostalCode,
      toPostalCode: cargo.toPostalCode,
      fromAddress: cargo.fromAddress,
      toAddress: cargo.toAddress,
      weight: cargo.weight,
      volume: cargo.volume,
      cargoType: cargo.cargoType,
      price: cargo.price,
      priceType: cargo.priceType,
      loadingDate: cargo.loadingDate,
      deliveryDate: cargo.deliveryDate,
      deadline: cargo.deadline,
      pickupLat: cargo.pickupLat,
      pickupLng: cargo.pickupLng,
      deliveryLat: cargo.deliveryLat,
      deliveryLng: cargo.deliveryLng,
      companyName: cargo.user?.name || cargo.companyName,
      requirements: Array.isArray(cargo.requirements) ? cargo.requirements : [],
      urgency: cargo.urgency,
      status: cargo.status,
      acceptedBy: cargo.acceptedBy,
      userId: cargo.userId,
      lastSync: new Date()
    };
  };
}

// Export singleton instance
export const marketplaceConnector = new MarketplaceConnector();

// Export for external use
export default marketplaceConnector;