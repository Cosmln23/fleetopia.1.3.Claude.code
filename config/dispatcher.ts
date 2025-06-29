/**
 * Dispatcher Performance Configuration
 * Performance settings and optimization parameters
 * Based on our system configuration (EUR currency and our values)
 */

export const dispatcherConfig = {
  matching: {
    max_suggestions: 10,           // Maximum suggestions to return
    min_profit_margin: 15,         // Minimum profit margin %
    max_distance_to_pickup: 200,   // Maximum distance to pickup (km)
    cache_duration: 60,            // Cache duration (seconds)
    min_score_threshold: 60,       // Minimum matching score to include
    optimization_enabled: true,    // Enable auto-optimization
    urgent_priority_boost: 25,     // Score boost for urgent cargo
    efficiency_bonus: 15           // Bonus for high-efficiency matches
  },
  
  scoring: {
    urgency_weight: 0.3,          // Urgency importance (30%)
    proximity_weight: 0.25,       // Distance importance (25%)  
    profit_weight: 0.35,          // Profit importance (35%)
    efficiency_weight: 0.1,       // Efficiency importance (10%)
    risk_penalty: 0.15,           // Risk reduction factor
    capacity_utilization_bonus: 0.1, // Bonus for good capacity use
    deadline_pressure_factor: 1.2 // Multiplier for tight deadlines
  },
  
  costs: {
    fuel_price_per_liter: 1.50,   // EUR per liter (our system config)
    driver_hourly_rate: 25.00,    // EUR per hour (our system config)
    maintenance_per_km: 0.15,     // EUR per km maintenance cost
    insurance_per_trip: 12.50,    // EUR insurance per trip
    toll_average_per_100km: 8.00, // EUR average toll costs
    overhead_percentage: 12,      // % overhead costs
    currency: 'EUR'               // Our currency
  },
  
  performance: {
    cache_strategy: {
      vehicle_positions_ttl: 30,      // 30 seconds
      available_cargo_ttl: 120,       // 2 minutes
      distance_calculations_ttl: 300, // 5 minutes
      matching_results_ttl: 60,       // 1 minute
      fleet_status_ttl: 45,           // 45 seconds
      performance_metrics_ttl: 600    // 10 minutes
    },
    
    optimization: {
      auto_assign_high_score: 90,     // Auto-assign if score > 90
      batch_processing_size: 50,       // Process matches in batches
      parallel_calculations: true,     // Enable parallel processing
      precompute_distances: true,      // Precompute common distances
      smart_caching: true,             // Intelligent cache management
      performance_monitoring: true     // Track performance metrics
    },
    
    limits: {
      max_concurrent_calculations: 20, // Max parallel calculations
      api_rate_limit: 100,            // Requests per minute
      max_cargo_per_request: 100,     // Max cargo items per API call
      max_vehicles_per_request: 50,   // Max vehicles per API call
      calculation_timeout: 30000,     // 30 seconds timeout
      memory_limit_mb: 512            // Memory limit for calculations
    }
  },
  
  ai_dispatcher: {
    confidence_threshold: 70,       // Minimum AI confidence %
    max_suggestions_per_query: 5,  // Max suggestions in chat
    conversation_memory: 10,       // Remember last 10 interactions
    context_timeout: 1800,         // 30 minutes session timeout
    learning_enabled: true,        // Enable AI learning
    fallback_enabled: true,        // Enable fallback responses
    intent_detection_threshold: 60 // Min threshold for intent detection
  },
  
  fleet_management: {
    gps_update_interval: 30,        // GPS update every 30 seconds
    idle_threshold_minutes: 15,     // Mark idle after 15 minutes
    maintenance_alert_threshold: 85,// Alert at 85% maintenance schedule
    fuel_efficiency_target: 8.0,    // L/100km target
    utilization_target: 80,         // 80% fleet utilization target
    performance_review_interval: 3600, // Review every hour
    emergency_response_time: 300    // 5 minutes emergency response
  },
  
  marketplace: {
    sync_interval: 300,             // Sync every 5 minutes
    priority_cargo_threshold: 1000, // EUR threshold for priority
    auto_accept_score: 95,          // Auto-accept excellent matches
    negotiation_margin: 10,         // % margin for price negotiation
    competitor_analysis: true,      // Enable competitor price analysis
    market_trend_tracking: true,    // Track market trends
    dynamic_pricing: false          // Enable dynamic pricing (future)
  },
  
  notifications: {
    urgent_cargo_alert: true,       // Alert for urgent cargo
    high_profit_opportunity: true,  // Alert for high-profit routes
    vehicle_maintenance_due: true,  // Maintenance reminders
    deadline_approaching: true,     // Deadline warnings
    performance_anomaly: true,      // Performance issue alerts
    email_notifications: true,      // Email notifications
    sms_notifications: false,       // SMS notifications
    push_notifications: true        // Push notifications
  },
  
  security: {
    api_key_required: true,         // Require API key
    rate_limiting: true,            // Enable rate limiting
    request_logging: true,          // Log all requests
    data_encryption: true,          // Encrypt sensitive data
    audit_trail: true,              // Maintain audit trail
    access_control: true,           // Role-based access control
    session_timeout: 3600           // 1 hour session timeout
  },
  
  analytics: {
    performance_tracking: true,     // Track performance metrics
    profit_analysis: true,          // Analyze profit trends
    efficiency_monitoring: true,    // Monitor efficiency metrics
    predictive_analytics: false,    // Predictive analytics (future)
    custom_reports: true,           // Custom report generation
    data_retention_days: 365,       // Keep data for 1 year
    real_time_dashboard: true       // Real-time dashboard updates
  }
};

// Export specific configurations for easy access
export const matchingConfig = dispatcherConfig.matching;
export const scoringConfig = dispatcherConfig.scoring;
export const costsConfig = dispatcherConfig.costs;
export const performanceConfig = dispatcherConfig.performance;
export const aiConfig = dispatcherConfig.ai_dispatcher;
export const fleetConfig = dispatcherConfig.fleet_management;
export const marketplaceConfig = dispatcherConfig.marketplace;

// Configuration validation
export function validateConfig(): boolean {
  const { scoring } = dispatcherConfig;
  
  // Validate scoring weights sum to approximately 1.0
  const totalWeight = scoring.urgency_weight + scoring.proximity_weight + 
                     scoring.profit_weight + scoring.efficiency_weight;
  
  if (Math.abs(totalWeight - 1.0) > 0.01) {
    console.warn(`⚠️ Scoring weights sum to ${totalWeight}, should be 1.0`);
    return false;
  }
  
  // Validate costs are positive
  const { costs } = dispatcherConfig;
  if (costs.fuel_price_per_liter <= 0 || costs.driver_hourly_rate <= 0) {
    console.warn('⚠️ Cost values must be positive');
    return false;
  }
  
  console.log('✅ Dispatcher configuration validated successfully');
  return true;
}

// Get configuration with environment overrides
export function getConfig(): typeof dispatcherConfig {
  const config = { ...dispatcherConfig };
  
  // Override with environment variables if available
  if (process.env.MAX_SUGGESTIONS) {
    config.matching.max_suggestions = parseInt(process.env.MAX_SUGGESTIONS, 10);
  }
  
  if (process.env.MIN_PROFIT_MARGIN) {
    config.matching.min_profit_margin = parseFloat(process.env.MIN_PROFIT_MARGIN);
  }
  
  if (process.env.FUEL_PRICE_EUR) {
    config.costs.fuel_price_per_liter = parseFloat(process.env.FUEL_PRICE_EUR);
  }
  
  if (process.env.DRIVER_RATE_EUR) {
    config.costs.driver_hourly_rate = parseFloat(process.env.DRIVER_RATE_EUR);
  }
  
  return config;
}

// Configuration presets for different scenarios
export const configPresets = {
  development: {
    ...dispatcherConfig,
    performance: {
      ...dispatcherConfig.performance,
      cache_strategy: {
        ...dispatcherConfig.performance.cache_strategy,
        vehicle_positions_ttl: 10,     // Shorter cache for development
        available_cargo_ttl: 30,
        distance_calculations_ttl: 60
      }
    },
    security: {
      ...dispatcherConfig.security,
      api_key_required: false,         // Relaxed for development
      rate_limiting: false
    }
  },
  
  production: {
    ...dispatcherConfig,
    performance: {
      ...dispatcherConfig.performance,
      optimization: {
        ...dispatcherConfig.performance.optimization,
        parallel_calculations: true,    // Full optimization for production
        smart_caching: true,
        performance_monitoring: true
      }
    },
    security: {
      ...dispatcherConfig.security,
      api_key_required: true,          // Full security for production
      rate_limiting: true,
      request_logging: true
    }
  },
  
  testing: {
    ...dispatcherConfig,
    matching: {
      ...dispatcherConfig.matching,
      max_suggestions: 3,              // Smaller datasets for testing
      cache_duration: 5
    },
    performance: {
      ...dispatcherConfig.performance,
      limits: {
        ...dispatcherConfig.performance.limits,
        calculation_timeout: 5000,     // Shorter timeout for testing
        max_concurrent_calculations: 5
      }
    }
  }
};

// Export default configuration
export default dispatcherConfig;