/**
 * Cache Integration
 * Integration layer for cache management with existing algorithms
 * Optimizes performance across all system components
 */

import { cacheManager } from './cache-manager';
import { dispatcherConfig } from '@/config/dispatcher';
import { matchingEngine } from '@/lib/algorithms/matching-engine';
import { marketplaceConnector } from '@/lib/connectors/marketplace-connector';
import { gpsFleetConnector } from '@/lib/connectors/gps-fleet-connector';
import { scoringSystem } from '@/lib/algorithms/scoring-system';

export class CacheIntegration {
  
  /**
   * Enhanced marketplace connector with caching
   */
  public async getCachedAvailableCargo(filters?: any): Promise<any[]> {
    const cacheKey = `cargo_${JSON.stringify(filters || {})}`;
    
    // Try cache first
    let cargo = cacheManager.get(cacheKey);
    if (cargo) {
      console.log('💾 Cache HIT: Available cargo');
      return cargo;
    }
    
    // Fetch from source and cache
    console.log('🔍 Cache MISS: Fetching available cargo');
    cargo = await marketplaceConnector.getAvailableCargo(filters);
    
    // Cache with TTL from config
    cacheManager.cacheAvailableCargo(cargo);
    
    return cargo;
  }

  /**
   * Enhanced GPS connector with caching
   */
  public async getCachedVehiclePositions(vehicleIds?: string[]): Promise<any[]> {
    const cacheKey = vehicleIds ? `positions_${vehicleIds.join(',')}` : 'all_positions';
    
    // Try cache first
    let positions = cacheManager.get(cacheKey);
    if (positions) {
      console.log('💾 Cache HIT: Vehicle positions');
      return positions;
    }
    
    // Fetch from source and cache
    console.log('🔍 Cache MISS: Fetching vehicle positions');
    positions = await gpsFleetConnector.getVehiclePositions(vehicleIds);
    
    // Cache with TTL from config
    cacheManager.cacheVehiclePositions(positions);
    
    return positions;
  }

  /**
   * Enhanced fleet status with caching
   */
  public async getCachedFleetStatus(): Promise<any> {
    // Try cache first
    let status = cacheManager.getFleetStatus();
    if (status) {
      console.log('💾 Cache HIT: Fleet status');
      return status;
    }
    
    // Fetch from source and cache
    console.log('🔍 Cache MISS: Fetching fleet status');
    status = await gpsFleetConnector.getFleetStatus();
    
    // Cache with TTL from config
    cacheManager.cacheFleetStatus(status);
    
    return status;
  }

  /**
   * Enhanced matching with intelligent caching
   */
  public async getCachedMatches(limit: number = 5, options?: any): Promise<any[]> {
    const filtersString = JSON.stringify({ limit, ...options });
    
    // Try cache first
    let matches = cacheManager.getMatchingResults(filtersString);
    if (matches) {
      console.log('💾 Cache HIT: Matching results');
      return matches.slice(0, limit);
    }
    
    // Fetch from source and cache
    console.log('🔍 Cache MISS: Computing matches');
    matches = await matchingEngine.findBestMatches(limit, options);
    
    // Cache results
    cacheManager.cacheMatchingResults(filtersString, matches);
    
    return matches;
  }

  /**
   * Enhanced scoring with caching
   */
  public async getCachedScoringResults(cargo: any, vehicle: any): Promise<any> {
    const scoringId = `${cargo.id}_${vehicle.id}`;
    const cacheKey = `scoring_${scoringId}`;
    
    // Try cache first
    let results = cacheManager.get(cacheKey);
    if (results) {
      console.log('💾 Cache HIT: Scoring results');
      return results;
    }
    
    // Calculate and cache
    console.log('🔍 Cache MISS: Computing scoring');
    results = await scoringSystem.calculateCompleteScore(cargo, vehicle);
    
    // Cache results
    cacheManager.cacheScoringResults(scoringId, results);
    
    return results;
  }

  /**
   * Distance calculation with caching
   */
  public async getCachedDistance(from: string, to: string): Promise<number> {
    // Try cache first
    const cachedDistance = cacheManager.getCachedDistance(from, to);
    if (cachedDistance !== null) {
      console.log('💾 Cache HIT: Distance calculation');
      return cachedDistance;
    }
    
    // Calculate distance (would use actual calculation service)
    console.log('🔍 Cache MISS: Computing distance');
    const distance = this.calculateDistance(from, to);
    
    // Cache the calculation
    const calculation = {
      from,
      to,
      distance,
      duration: distance / 80 * 60, // Rough estimate: 80km/h average
      calculatedAt: Date.now()
    };
    
    cacheManager.cacheDistanceCalculations([calculation]);
    
    return distance;
  }

  /**
   * Performance metrics with caching
   */
  public async getCachedPerformanceMetrics(timeframe: string = 'today'): Promise<any> {
    // Try cache first
    let metrics = cacheManager.getPerformanceMetrics(timeframe);
    if (metrics) {
      console.log('💾 Cache HIT: Performance metrics');
      return metrics;
    }
    
    // Calculate metrics (would use actual performance calculation)
    console.log('🔍 Cache MISS: Computing performance metrics');
    metrics = await this.calculatePerformanceMetrics(timeframe);
    
    // Cache results
    cacheManager.cachePerformanceMetrics(timeframe, metrics);
    
    return metrics;
  }

  /**
   * Preload essential cache data
   */
  public async preloadCache(): Promise<void> {
    console.log('🚀 Preloading essential cache data...');
    
    try {
      // Preload in parallel for better performance
      const preloadTasks = [
        this.getCachedAvailableCargo(),
        this.getCachedVehiclePositions(),
        this.getCachedFleetStatus(),
        this.getCachedMatches(10),
        this.getCachedPerformanceMetrics('today')
      ];
      
      await Promise.all(preloadTasks);
      console.log('✅ Cache preload completed successfully');
      
    } catch (error) {
      console.error('❌ Cache preload failed:', error);
    }
  }

  /**
   * Smart cache invalidation
   */
  public invalidateRelatedCache(type: 'cargo' | 'vehicle' | 'assignment'): void {
    console.log(`🧹 Invalidating ${type}-related cache entries`);
    
    switch (type) {
      case 'cargo':
        cacheManager.delete('available_cargo');
        cacheManager.delete('urgent_cargo');
        cacheManager.delete('high_value_cargo');
        // Invalidate matching results that depend on cargo
        this.invalidateMatchingCache();
        break;
        
      case 'vehicle':
        cacheManager.delete('vehicle_positions');
        cacheManager.delete('fleet_status');
        // Invalidate matching results that depend on vehicles
        this.invalidateMatchingCache();
        break;
        
      case 'assignment':
        // When assignments change, invalidate related caches
        cacheManager.delete('fleet_status');
        this.invalidateMatchingCache();
        break;
    }
  }

  /**
   * Invalidate matching cache (when dependencies change)
   */
  private invalidateMatchingCache(): void {
    const cacheInfo = cacheManager.getCacheInfo();
    const matchingKeys = cacheInfo.keys.filter(key => key.startsWith('matching_results_'));
    
    matchingKeys.forEach(key => {
      cacheManager.delete(key);
    });
    
    console.log(`🧹 Invalidated ${matchingKeys.length} matching cache entries`);
  }

  /**
   * Cache warming strategy
   */
  public async warmCache(): Promise<void> {
    console.log('🔥 Starting intelligent cache warming...');
    
    const config = dispatcherConfig.performance.cache_strategy;
    
    // Warm up most frequently accessed data
    const warmupTasks = [
      // Always warm these up
      this.getCachedAvailableCargo(),
      this.getCachedVehiclePositions(),
      this.getCachedFleetStatus(),
      
      // Warm up common matching scenarios
      this.getCachedMatches(5, { urgencyOnly: false }),
      this.getCachedMatches(5, { urgencyOnly: true }),
      
      // Warm up performance data
      this.getCachedPerformanceMetrics('today')
    ];
    
    try {
      await Promise.allSettled(warmupTasks);
      console.log('✅ Cache warming completed');
    } catch (error) {
      console.error('❌ Cache warming failed:', error);
    }
  }

  /**
   * Monitor cache performance
   */
  public startCacheMonitoring(): void {
    console.log('📊 Starting cache performance monitoring...');
    
    setInterval(() => {
      const stats = cacheManager.getStats();
      
      // Log cache performance
      console.log('📊 Cache Performance:', {
        entries: stats.totalEntries,
        hitRate: `${stats.hitRate.toFixed(1)}%`,
        memoryUsage: `${(stats.totalSize / 1024).toFixed(2)}KB`,
        expired: stats.expiredEntries
      });
      
      // Alert on low hit rate
      if (stats.hitRate < 70) {
        console.warn('⚠️ Low cache hit rate detected:', stats.hitRate);
      }
      
      // Alert on high memory usage
      if (stats.totalSize > 50 * 1024 * 1024) { // 50MB
        console.warn('⚠️ High cache memory usage:', stats.totalSize);
      }
      
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  // Helper methods

  private calculateDistance(from: string, to: string): number {
    // Mock distance calculation - would use actual routing service
    const mockDistances: Record<string, number> = {
      'Bucharest_Cluj': 450,
      'Bucharest_Berlin': 1100,
      'Cluj_Vienna': 680,
      'Ploiesti_Brasov': 120
    };
    
    const key = `${from}_${to}`;
    return mockDistances[key] || Math.random() * 500 + 100;
  }

  private async calculatePerformanceMetrics(timeframe: string): Promise<any> {
    // Mock performance calculation - would use actual data
    return {
      timeframe,
      calculated_at: new Date().toISOString(),
      efficiency_score: 85.5,
      profit_margin: 22.3,
      utilization_rate: 78.2,
      customer_satisfaction: 91.0
    };
  }
}

// Export singleton instance
export const cacheIntegration = new CacheIntegration();

// Auto-start monitoring and warming
cacheIntegration.startCacheMonitoring();

// Export for external use
export default cacheIntegration;