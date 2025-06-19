/**
 * In-memory cache implementation for frequently accessed data
 * In production, this should be replaced with Redis or similar
 */

interface CacheEntry<T> {
  data: T;
  expires: number;
  created: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes default
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 2 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 2 * 60 * 1000);
  }

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set item in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const ttlMs = ttl || this.defaultTTL;
    const now = Date.now();
    
    this.cache.set(key, {
      data,
      expires: now + ttlMs,
      created: now
    });
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get cache statistics
   */
  stats() {
    const now = Date.now();
    let expired = 0;
    let valid = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expires) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired,
      memoryUsage: this.getMemoryUsage()
    };
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`[CACHE] Cleaned up ${cleaned} expired entries`);
    }
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  private getMemoryUsage(): string {
    const size = this.cache.size;
    const avgKeySize = 50; // Average key length in bytes
    const avgDataSize = 1000; // Average data size in bytes
    const estimatedBytes = size * (avgKeySize + avgDataSize);
    
    if (estimatedBytes < 1024) {
      return `${estimatedBytes}B`;
    } else if (estimatedBytes < 1024 * 1024) {
      return `${Math.round(estimatedBytes / 1024)}KB`;
    } else {
      return `${Math.round(estimatedBytes / (1024 * 1024))}MB`;
    }
  }

  /**
   * Destroy cache and cleanup interval
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Global cache instance
export const cache = new MemoryCache();

/**
 * Cache helper functions for common use cases
 */
export const cacheHelpers = {
  // User fleet cache
  getUserFleets: (userId: string) => `user:${userId}:fleets`,
  
  // Vehicle cache
  getFleetVehicles: (fleetId: string) => `fleet:${fleetId}:vehicles`,
  getUserVehicles: (userId: string) => `user:${userId}:vehicles`,
  
  // Cargo offers cache
  getCargoOffers: (filters: Record<string, any>) => `cargo:${JSON.stringify(filters)}`,
  getUserCargoOffers: (userId: string, listType?: string) => 
    `user:${userId}:cargo:${listType || 'all'}`,
  
  // Dispatcher cache
  getDispatcherAnalysis: (userId: string) => `dispatcher:${userId}:analysis`,
  
  // System alerts cache
  getSystemAlerts: (type?: string) => `alerts:${type || 'all'}`,
  
  // Chat messages cache
  getChatMessages: (cargoOfferId: string) => `chat:${cargoOfferId}:messages`,
  
  // API rate limit cache (separate from main cache)
  getRateLimit: (identifier: string) => `ratelimit:${identifier}`,
};

/**
 * Cached database query wrapper
 */
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache first
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Execute query and cache result
  const result = await queryFn();
  cache.set(key, result, ttl);
  
  return result;
}

/**
 * Cache invalidation helpers
 */
export const cacheInvalidation = {
  // Invalidate user-related caches
  invalidateUser: (userId: string) => {
    const patterns = [
      cacheHelpers.getUserFleets(userId),
      cacheHelpers.getUserVehicles(userId),
      cacheHelpers.getUserCargoOffers(userId),
      cacheHelpers.getUserCargoOffers(userId, 'my_offers'),
      cacheHelpers.getUserCargoOffers(userId, 'accepted_offers'),
      cacheHelpers.getDispatcherAnalysis(userId),
    ];
    
    patterns.forEach(pattern => cache.delete(pattern));
  },

  // Invalidate fleet-related caches
  invalidateFleet: (fleetId: string, userId: string) => {
    cache.delete(cacheHelpers.getFleetVehicles(fleetId));
    cache.delete(cacheHelpers.getUserFleets(userId));
    cache.delete(cacheHelpers.getUserVehicles(userId));
  },

  // Invalidate cargo-related caches
  invalidateCargo: (cargoOfferId?: string) => {
    // Clear all cargo offer caches (simple approach)
    const allKeys = Array.from((cache as any).cache.keys());
    const cargoKeys = allKeys.filter(key => key.startsWith('cargo:') || key.startsWith('user:') && key.includes(':cargo:'));
    cargoKeys.forEach(key => cache.delete(key));
    
    if (cargoOfferId) {
      cache.delete(cacheHelpers.getChatMessages(cargoOfferId));
    }
  },

  // Invalidate system alerts
  invalidateAlerts: () => {
    const allKeys = Array.from((cache as any).cache.keys());
    const alertKeys = allKeys.filter(key => key.startsWith('alerts:'));
    alertKeys.forEach(key => cache.delete(key));
  }
};

/**
 * Cache middleware for API routes
 */
export function withCache<T>(
  keyGenerator: (...args: any[]) => string,
  ttl?: number
) {
  return function cacheMiddleware(
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = keyGenerator(...args);
      
      // Try cache first
      const cached = cache.get<T>(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await method.apply(this, args);
      
      // Cache result
      cache.set(cacheKey, result, ttl);
      
      return result;
    };

    return descriptor;
  };
}

// Export cache instance as default
export default cache;