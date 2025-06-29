import prisma from '@/lib/prisma';

/**
 * System Configuration Service
 * Manages application-wide settings with type safety and caching
 */

export interface SystemConfigValue {
  settingName: string;
  settingValue: string;
  description?: string;
  category: string;
  dataType: 'string' | 'number' | 'boolean';
  isEditable: boolean;
}

// Type-safe configuration keys
export const CONFIG_KEYS = {
  // Pricing Configuration - EUR based
  FUEL_PRICE_PER_LITER: 'fuel_price_per_liter',
  DRIVER_COST_PER_HOUR: 'driver_cost_per_hour',
  PROFIT_MARGIN_MIN: 'profit_margin_min',
  
  // Speed Configuration
  AVERAGE_SPEED_CITY: 'average_speed_city', 
  AVERAGE_SPEED_HIGHWAY: 'average_speed_highway',
  
  // System Configuration
  DEFAULT_CURRENCY: 'default_currency',
  DISTANCE_UNIT: 'distance_unit',
  FUEL_UNIT: 'fuel_unit',
  
  // AI Configuration
  AI_CONFIDENCE_THRESHOLD: 'ai_confidence_threshold',
  AI_MAX_SUGGESTIONS: 'ai_max_suggestions',
  
  // Notification Configuration
  ENABLE_EMAIL_NOTIFICATIONS: 'enable_email_notifications',
  ENABLE_SMS_NOTIFICATIONS: 'enable_sms_notifications'
} as const;

export type ConfigKey = typeof CONFIG_KEYS[keyof typeof CONFIG_KEYS];

class SystemConfigService {
  private cache: Map<string, SystemConfigValue> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get a configuration value with type conversion
   */
  async get<T = string>(key: ConfigKey, defaultValue?: T): Promise<T> {
    try {
      // Check cache first
      if (this.isCacheValid(key)) {
        const cached = this.cache.get(key);
        if (cached) {
          return this.convertValue<T>(cached.settingValue, cached.dataType);
        }
      }

      // Fetch from database
      const config = await prisma.systemConfig.findUnique({
        where: { settingName: key }
      });

      if (!config) {
        if (defaultValue !== undefined) {
          return defaultValue;
        }
        throw new Error(`Configuration key '${key}' not found`);
      }

      // Cache the result
      this.cache.set(key, config);
      this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);

      return this.convertValue<T>(config.settingValue, config.dataType);
    } catch (error) {
      console.error(`Failed to get config '${key}':`, error);
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw error;
    }
  }

  /**
   * Set a configuration value
   */
  async set(key: ConfigKey, value: string | number | boolean, description?: string): Promise<void> {
    try {
      const stringValue = String(value);
      const dataType = this.inferDataType(value);

      await prisma.systemConfig.upsert({
        where: { settingName: key },
        update: {
          settingValue: stringValue,
          description,
          dataType,
          updatedAt: new Date()
        },
        create: {
          settingName: key,
          settingValue: stringValue,
          description,
          category: this.getCategoryForKey(key),
          dataType,
          isEditable: true
        }
      });

      // Invalidate cache
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    } catch (error) {
      console.error(`Failed to set config '${key}':`, error);
      throw error;
    }
  }

  /**
   * Get multiple configurations at once
   */
  async getMany(keys: ConfigKey[]): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    
    for (const key of keys) {
      try {
        result[key] = await this.get(key);
      } catch (error) {
        console.warn(`Failed to get config '${key}':`, error);
        result[key] = null;
      }
    }
    
    return result;
  }

  /**
   * Get all configurations by category
   */
  async getByCategory(category: string): Promise<SystemConfigValue[]> {
    try {
      const configs = await prisma.systemConfig.findMany({
        where: { category },
        orderBy: { settingName: 'asc' }
      });

      return configs;
    } catch (error) {
      console.error(`Failed to get configs for category '${category}':`, error);
      throw error;
    }
  }

  /**
   * Get pricing configuration for calculations
   */
  async getPricingConfig() {
    const configs = await this.getMany([
      CONFIG_KEYS.FUEL_PRICE_PER_LITER,
      CONFIG_KEYS.DRIVER_COST_PER_HOUR,
      CONFIG_KEYS.PROFIT_MARGIN_MIN
    ]);

    return {
      fuelPricePerLiter: Number(configs.fuel_price_per_liter) || 1.5,
      driverCostPerHour: Number(configs.driver_cost_per_hour) || 25,
      profitMarginMin: Number(configs.profit_margin_min) || 15
    };
  }

  /**
   * Get speed configuration for route calculations
   */
  async getSpeedConfig() {
    const configs = await this.getMany([
      CONFIG_KEYS.AVERAGE_SPEED_CITY,
      CONFIG_KEYS.AVERAGE_SPEED_HIGHWAY
    ]);

    return {
      averageSpeedCity: Number(configs.average_speed_city) || 30,
      averageSpeedHighway: Number(configs.average_speed_highway) || 80
    };
  }

  /**
   * Clear cache for a specific key or all cache
   */
  clearCache(key?: ConfigKey): void {
    if (key) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
    } else {
      this.cache.clear();
      this.cacheExpiry.clear();
    }
  }

  /**
   * Initialize default configurations
   */
  async initializeDefaults(): Promise<void> {
    const defaultConfigs = [
      {
        settingName: CONFIG_KEYS.FUEL_PRICE_PER_LITER,
        settingValue: '1.50',
        description: 'Fuel price in EUR per liter',
        category: 'pricing',
        dataType: 'number' as const
      },
      {
        settingName: CONFIG_KEYS.DRIVER_COST_PER_HOUR,
        settingValue: '25.00',
        description: 'Driver cost in EUR per hour',
        category: 'pricing',
        dataType: 'number' as const
      },
      {
        settingName: CONFIG_KEYS.AVERAGE_SPEED_CITY,
        settingValue: '30',
        description: 'Average city speed in km/h',
        category: 'routing',
        dataType: 'number' as const
      },
      {
        settingName: CONFIG_KEYS.AVERAGE_SPEED_HIGHWAY,
        settingValue: '80',
        description: 'Average highway speed in km/h',
        category: 'routing',
        dataType: 'number' as const
      },
      {
        settingName: CONFIG_KEYS.PROFIT_MARGIN_MIN,
        settingValue: '15',
        description: 'Minimum profit margin percentage',
        category: 'pricing',
        dataType: 'number' as const
      },
      {
        settingName: CONFIG_KEYS.DEFAULT_CURRENCY,
        settingValue: 'EUR',
        description: 'Default currency for the system',
        category: 'system',
        dataType: 'string' as const
      },
      {
        settingName: CONFIG_KEYS.DISTANCE_UNIT,
        settingValue: 'km',
        description: 'Default distance unit',
        category: 'system',
        dataType: 'string' as const
      },
      {
        settingName: CONFIG_KEYS.FUEL_UNIT,
        settingValue: 'liters',
        description: 'Default fuel unit',
        category: 'system',
        dataType: 'string' as const
      },
      {
        settingName: CONFIG_KEYS.AI_CONFIDENCE_THRESHOLD,
        settingValue: '70',
        description: 'Minimum AI confidence threshold percentage',
        category: 'ai',
        dataType: 'number' as const
      },
      {
        settingName: CONFIG_KEYS.AI_MAX_SUGGESTIONS,
        settingValue: '5',
        description: 'Maximum AI suggestions to generate',
        category: 'ai',
        dataType: 'number' as const
      },
      {
        settingName: CONFIG_KEYS.ENABLE_EMAIL_NOTIFICATIONS,
        settingValue: 'true',
        description: 'Enable email notifications',
        category: 'notifications',
        dataType: 'boolean' as const
      },
      {
        settingName: CONFIG_KEYS.ENABLE_SMS_NOTIFICATIONS,
        settingValue: 'false',
        description: 'Enable SMS notifications',
        category: 'notifications',
        dataType: 'boolean' as const
      }
    ];

    for (const config of defaultConfigs) {
      await prisma.systemConfig.upsert({
        where: { settingName: config.settingName },
        update: {}, // Don't update existing values
        create: {
          settingName: config.settingName,
          settingValue: config.settingValue,
          description: config.description,
          category: config.category,
          dataType: config.dataType,
          isEditable: true
        }
      });
    }

    console.log('✅ Default system configurations initialized');
  }

  // Private helper methods
  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private convertValue<T>(value: string, dataType: string): T {
    switch (dataType) {
      case 'number':
        return Number(value) as T;
      case 'boolean':
        return (value.toLowerCase() === 'true') as T;
      default:
        return value as T;
    }
  }

  private inferDataType(value: string | number | boolean): 'string' | 'number' | 'boolean' {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    return 'string';
  }

  private getCategoryForKey(key: ConfigKey): string {
    if (key.includes('fuel') || key.includes('cost') || key.includes('profit') || key.includes('price')) {
      return 'pricing';
    }
    if (key.includes('speed') || key.includes('route')) {
      return 'routing';
    }
    if (key.includes('ai')) {
      return 'ai';
    }
    if (key.includes('notification')) {
      return 'notifications';
    }
    return 'system';
  }
}

// Export singleton instance
export const systemConfigService = new SystemConfigService();

// Convenience functions for common operations
export const getConfig = <T = string>(key: ConfigKey, defaultValue?: T) => 
  systemConfigService.get<T>(key, defaultValue);

export const setConfig = (key: ConfigKey, value: string | number | boolean, description?: string) =>
  systemConfigService.set(key, value, description);

export const getPricingConfig = () => systemConfigService.getPricingConfig();
export const getSpeedConfig = () => systemConfigService.getSpeedConfig();