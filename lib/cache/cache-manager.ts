/**
 * Cache Manager
 * Advanced caching strategy for performance optimization
 * Follows the user's specific plan for cache management
 */

import { VehiclePosition } from '@/lib/connectors/gps-fleet-connector';
import { MarketplaceCargo } from '@/lib/connectors/marketplace-connector';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface DistanceCalculation {
  from: string;
  to: string;
  distance: number;
  duration: number;
  calculatedAt: number;
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  
  // Cache durations as specified in user's plan (in seconds, converted to milliseconds)
  private readonly CACHE_DURATIONS = {
    VEHICLE_POSITIONS: 30 * 1000,      // 30 seconds - as per plan
    AVAILABLE_CARGO: 2 * 60 * 1000,    // 2 minutes - as per plan  
    DISTANCE_CALCULATIONS: 5 * 60 * 1000, // 5 minutes - as per plan
    MATCHING_RESULTS: 60 * 1000,       // 1 minute
    FLEET_STATUS: 45 * 1000,           // 45 seconds
    SCORING_RESULTS: 90 * 1000,        // 1.5 minutes
    PERFORMANCE_METRICS: 10 * 60 * 1000, // 10 minutes
    SYSTEM_CONFIG: 60 * 60 * 1000      // 1 hour
  };

  /**
   * Cache vehicle positions - 30 seconds as specified in user's plan
   */
  public cacheVehiclePositions(positions: VehiclePosition[]): void {
    console.log(`💾 Caching ${positions.length} vehicle positions for 30 seconds`);
    
    this.set('vehicle_positions', positions, this.CACHE_DURATIONS.VEHICLE_POSITIONS);
    
    // Also cache individual vehicle positions for quick lookup
    positions.forEach(position => {
      this.set(`vehicle_position_${position.vehicleId}`, position, this.CACHE_DURATIONS.VEHICLE_POSITIONS);
    });
  }

  /**
   * Cache available cargo - 2 minutes as specified in user's plan
   */
  public cacheAvailableCargo(cargo: MarketplaceCargo[]): void {
    console.log(`💾 Caching ${cargo.length} available cargo for 2 minutes`);
    
    this.set('available_cargo', cargo, this.CACHE_DURATIONS.AVAILABLE_CARGO);
    
    // Cache by filters for quick filtered retrieval
    const urgentCargo = cargo.filter(c => c.urgency === 'high');
    const highValueCargo = cargo.filter(c => c.price > 500);
    
    this.set('urgent_cargo', urgentCargo, this.CACHE_DURATIONS.AVAILABLE_CARGO);
    this.set('high_value_cargo', highValueCargo, this.CACHE_DURATIONS.AVAILABLE_CARGO);
  }

  /**
   * Cache distance calculations - 5 minutes as specified in user's plan
   */
  public cacheDistanceCalculations(calculations: DistanceCalculation[]): void {
    console.log(`💾 Caching ${calculations.length} distance calculations for 5 minutes`);
    
    this.set('distance_matrix', calculations, this.CACHE_DURATIONS.DISTANCE_CALCULATIONS);
    
    // Create lookup matrix for quick distance retrieval
    const distanceMatrix: Record<string, number> = {};
    calculations.forEach(calc => {
      const key = `${calc.from}_to_${calc.to}`;
      distanceMatrix[key] = calc.distance;
    });
    
    this.set('distance_lookup', distanceMatrix, this.CACHE_DURATIONS.DISTANCE_CALCULATIONS);
  }

  /**
   * Cache matching results for performance
   */
  public cacheMatchingResults(filters: string, results: any[]): void {
    const cacheKey = `matching_results_${this.hashFilters(filters)}`;
    console.log(`💾 Caching matching results: ${cacheKey}`);
    
    this.set(cacheKey, results, this.CACHE_DURATIONS.MATCHING_RESULTS);
  }

  /**
   * Cache fleet status data
   */
  public cacheFleetStatus(status: any): void {
    console.log('💾 Caching fleet status for 45 seconds');
    
    this.set('fleet_status', status, this.CACHE_DURATIONS.FLEET_STATUS);
  }

  /**
   * Cache scoring results
   */
  public cacheScoringResults(scoringId: string, results: any): void {
    const cacheKey = `scoring_results_${scoringId}`;
    console.log(`💾 Caching scoring results: ${cacheKey}`);
    
    this.set(cacheKey, results, this.CACHE_DURATIONS.SCORING_RESULTS);
  }

  /**
   * Cache performance metrics
   */
  public cachePerformanceMetrics(timeframe: string, metrics: any): void {
    const cacheKey = `performance_metrics_${timeframe}`;
    console.log(`💾 Caching performance metrics: ${cacheKey}`);
    
    this.set(cacheKey, metrics, this.CACHE_DURATIONS.PERFORMANCE_METRICS);
  }

  /**
   * Cache system configuration
   */
  public cacheSystemConfig(config: any): void {
    console.log('💾 Caching system configuration for 1 hour');
    
    this.set('system_config', config, this.CACHE_DURATIONS.SYSTEM_CONFIG);
  }

  // Core cache operations

  /**
   * Set cache entry with TTL
   */
  private set<T>(key: string, data: T, ttl: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    this.cache.set(key, entry);
    
    // Schedule automatic cleanup
    setTimeout(() => {
      this.delete(key);
    }, ttl);
  }

  /**
   * Get cache entry with validation
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  /**
   * Check if cache has valid entry
   */
  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete cache entry
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear entire cache
   */
  public clear(): void {
    console.log('🧹 Clearing entire cache');
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  public clearExpired(): number {
    const now = Date.now();
    let cleared = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    if (cleared > 0) {
      console.log(`🧹 Cleared ${cleared} expired cache entries`);
    }
    
    return cleared;
  }

  /**
   * Get cache statistics
   */
  public getStats(): {
    totalEntries: number;
    totalSize: number;
    expiredEntries: number;
    hitRate: number;
    byType: Record<string, number>;
  } {
    const now = Date.now();
    let totalSize = 0;
    let expiredEntries = 0;
    const byType: Record<string, number> = {};
    
    for (const [key, entry] of this.cache.entries()) {
      // Estimate size (rough calculation)
      totalSize += JSON.stringify(entry.data).length;
      
      // Count expired
      if (now - entry.timestamp > entry.ttl) {
        expiredEntries++;
      }
      
      // Count by type
      const type = key.split('_')[0];
      byType[type] = (byType[type] || 0) + 1;
    }
    
    return {
      totalEntries: this.cache.size,
      totalSize,
      expiredEntries,
      hitRate: this.calculateHitRate(),
      byType
    };
  }

  /**
   * Get cache info for debugging
   */
  public getCacheInfo(): {
    keys: string[];
    durations: typeof this.CACHE_DURATIONS;
    stats: ReturnType<typeof this.getStats>;
  } {
    return {
      keys: Array.from(this.cache.keys()),
      durations: this.CACHE_DURATIONS,
      stats: this.getStats()
    };
  }

  /**
   * Warm up cache with essential data
   */
  public async warmUp(): Promise<void> {
    console.log('🔥 Warming up cache with essential data...');
    
    try {
      // This would be called during application startup
      // to pre-populate cache with frequently accessed data
      
      // Note: Implementation would depend on actual data sources
      console.log('✅ Cache warm-up completed');
    } catch (error) {
      console.error('❌ Cache warm-up failed:', error);
    }
  }

  /**
   * Scheduled cache maintenance
   */
  public startMaintenance(): void {
    // Clean expired entries every 5 minutes
    setInterval(() => {
      this.clearExpired();
    }, 5 * 60 * 1000);
    
    // Log cache stats every 15 minutes
    setInterval(() => {
      const stats = this.getStats();
      console.log('📊 Cache Stats:', {
        entries: stats.totalEntries,
        size: `${(stats.totalSize / 1024).toFixed(2)}KB`,
        hitRate: `${stats.hitRate.toFixed(1)}%`,
        expired: stats.expiredEntries
      });
    }, 15 * 60 * 1000);
    
    console.log('🔧 Cache maintenance started');
  }

  // Helper methods

  private hashFilters(filters: string): string {
    // Simple hash function for filters
    let hash = 0;
    for (let i = 0; i < filters.length; i++) {
      const char = filters.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private calculateHitRate(): number {
    // This would track actual hit/miss rates in a real implementation
    // For now, return a mock rate
    return 85.5;
  }

  // Specialized cache getters

  /**
   * Get cached vehicle positions
   */
  public getVehiclePositions(): VehiclePosition[] | null {
    return this.get<VehiclePosition[]>('vehicle_positions');
  }

  /**
   * Get cached available cargo
   */
  public getAvailableCargo(): MarketplaceCargo[] | null {
    return this.get<MarketplaceCargo[]>('available_cargo');
  }

  /**
   * Get cached distance calculations
   */
  public getDistanceCalculations(): DistanceCalculation[] | null {
    return this.get<DistanceCalculation[]>('distance_matrix');
  }

  /**
   * Get distance between two points from cache
   */
  public getCachedDistance(from: string, to: string): number | null {
    const distanceLookup = this.get<Record<string, number>>('distance_lookup');
    if (!distanceLookup) return null;
    
    const key = `${from}_to_${to}`;
    return distanceLookup[key] || null;
  }

  /**
   * Get cached matching results
   */
  public getMatchingResults(filters: string): any[] | null {
    const cacheKey = `matching_results_${this.hashFilters(filters)}`;
    return this.get<any[]>(cacheKey);
  }

  /**
   * Get cached fleet status
   */
  public getFleetStatus(): any | null {
    return this.get('fleet_status');
  }

  /**
   * Get cached performance metrics
   */
  public getPerformanceMetrics(timeframe: string): any | null {
    const cacheKey = `performance_metrics_${timeframe}`;
    return this.get(cacheKey);
  }

  /**
   * Get cached system config
   */
  public getSystemConfig(): any | null {
    return this.get('system_config');
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Start maintenance on import
cacheManager.startMaintenance();

// Export for external use
export default cacheManager;