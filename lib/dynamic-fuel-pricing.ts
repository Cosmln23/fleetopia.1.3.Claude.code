// 💰 Dynamic Fuel Pricing Optimizer - PROMPT 2 Implementation
// Advanced fuel purchasing optimization with real-time market analysis

interface PriceDataSource {
  apiKey?: string;
  endpoint: string;
  updateFrequency: number;
  coverage: string;
  reliability: number;
}

interface FuelStation {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  brands: string[];
  amenities: string[];
  prices?: {
    diesel: number;
    gasoline: number;
    premium: number;
    lastUpdated: Date;
  };
  detourDistance?: number;
  detourTime?: number;
  detourCost?: number;
  totalCostPerLiter?: number;
  qualityRating?: number;
  discountsAvailable?: any[];
  currentInventory?: {
    diesel: boolean;
    gasoline: boolean;
    premium: boolean;
  };
}

interface MarketTrends {
  currentTrend: 'rising' | 'falling' | 'stable';
  trendStrength: number;
  shortTermForecast: {
    direction: string;
    priceChange: number;
    confidence: number;
  };
  mediumTermForecast: {
    direction: string;
    priceChange: number;
    confidence: number;
  };
  supplyChainStatus: string;
  seasonalImpact: number;
  marketOutlook: string;
  confidence: number;
  keyFactors: string[];
}

interface PurchasingStrategy {
  id: string;
  type: string;
  description: string;
  station?: FuelStation;
  amount: number;
  timing: string;
  totalCost: number;
  totalSavings: number;
  risk: 'low' | 'medium' | 'high';
  confidence: number;
  delayDays?: number;
  projectedTotalCost?: number;
  bulkDiscount?: number;
  timingSavings?: number;
}

export class DynamicFuelPricingOptimizer {
  private priceDataSources = new Map<string, PriceDataSource>();
  private priceHistory: any[] = [];
  private marketAnalyzer: any = null;
  private discountOptimizer: any = null;
  private timingOptimizer: any = null;
  private supplyChainMonitor: any = null;
  private arbitrageDetector: any = null;
  
  // Price tracking și prediction models
  private priceAccuracy = 0.85;
  private predictionHorizon = 14; // days
  private savingsThreshold = 0.05; // 5% minimum pentru recommendation

  constructor() {
    console.log('💰 Initializing Dynamic Fuel Pricing Optimizer...');
  }

  async initializeDynamicPricing(): Promise<void> {
    try {
      // Initialize price data sources
      await this.initializePriceDataSources();
      
      // Setup market analysis
      await this.initializeMarketAnalysis();
      
      // Initialize discount optimization
      await this.initializeDiscountOptimization();
      
      // Setup timing optimization
      await this.initializeTimingOptimization();
      
      // Initialize supply chain monitoring
      await this.initializeSupplyChainMonitoring();
      
      // Setup arbitrage detection
      await this.initializeArbitrageDetection();
      
      console.log('✅ Dynamic Fuel Pricing Optimizer initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Dynamic Pricing:', error);
    }
  }

  private async initializePriceDataSources(): Promise<void> {
    // Multiple fuel price APIs pentru comprehensive coverage
    this.priceDataSources.set('gasbuddy', {
      apiKey: process.env.GASBUDDY_API_KEY,
      endpoint: 'https://api.gasbuddy.com/v3/stations/search',
      updateFrequency: 15, // minutes
      coverage: 'global',
      reliability: 0.9
    });
    
    this.priceDataSources.set('fuel_prices_api', {
      apiKey: process.env.FUEL_PRICES_API_KEY,
      endpoint: 'https://api.fuelpricesapi.com/prices',
      updateFrequency: 30,
      coverage: 'europe',
      reliability: 0.85
    });
    
    this.priceDataSources.set('government_data', {
      endpoint: 'https://data.gov/fuel-prices',
      updateFrequency: 60,
      coverage: 'national',
      reliability: 0.95
    });
    
    // Initialize price monitoring
    await this.startPriceMonitoring();
  }

  private async initializeMarketAnalysis(): Promise<void> {
    // Fuel futures market analysis setup
    this.marketAnalyzer = {
      futuresAPI: process.env.FUTURES_API_KEY,
      commoditySymbols: ['CL', 'HO', 'RB'], // Crude Oil, Heating Oil, Gasoline
      analysisDepth: 30, // days
      trendAccuracy: 0.78
    };
    
    // Load historical market data
    await this.loadHistoricalMarketData();
    
    // Setup trend analysis
    await this.setupTrendAnalysis();
  }

  private async initializeDiscountOptimization(): Promise<void> {
    this.discountOptimizer = {
      fuelCardProviders: ['Shell', 'BP', 'Total', 'OMV', 'Petrom'],
      loyaltyPrograms: new Map(),
      corporateDiscounts: new Map(),
      volumeThresholds: [100, 500, 1000, 2000], // liters
      timeBasedDiscounts: true
    };
  }

  private async initializeTimingOptimization(): Promise<void> {
    this.timingOptimizer = {
      marketAnalysisEnabled: true,
      timeOfDayOptimization: true,
      seasonalFactors: true,
      supplyChainEvents: true,
      emergencyThresholds: {
        priceSpike: 0.15, // 15% price increase
        supplyShortage: 0.2 // 20% availability decrease
      }
    };
  }

  private async initializeSupplyChainMonitoring(): Promise<void> {
    this.supplyChainMonitor = {
      newsAPIs: ['newsapi.org', 'bloomberg.com'],
      priceVolatilityThreshold: 0.1, // 10% daily change
      regionalMonitoring: true,
      disruptionSeverityLevels: ['low', 'medium', 'high', 'critical']
    };
  }

  private async initializeArbitrageDetection(): Promise<void> {
    this.arbitrageDetector = {
      searchRadius: 50, // km
      minimumSavings: 0.05, // 5%
      detourCostCalculation: true,
      realTimeUpdates: true,
      opportunityThreshold: 0.02 // 2% minimum price difference
    };
  }

  private async startPriceMonitoring(): Promise<void> {
    // Start monitoring cu interval updates
    setInterval(() => {
      this.updatePriceData();
    }, 15 * 60 * 1000); // Every 15 minutes
    
    console.log('📊 Price monitoring started - updating every 15 minutes');
  }

  private async loadHistoricalMarketData(): Promise<void> {
    // Load last 90 days of market data pentru trend analysis
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (90 * 24 * 60 * 60 * 1000));
    
    try {
      // In production, this would load from actual APIs
      this.priceHistory = await this.generateDemoHistoricalData(startDate, endDate);
      console.log(`📈 Loaded ${this.priceHistory.length} days of historical market data`);
    } catch (error) {
      console.error('❌ Failed to load historical data:', error);
      this.priceHistory = [];
    }
  }

  private async setupTrendAnalysis(): Promise<void> {
    // Setup trend analysis algorithms
    console.log('🔍 Setting up market trend analysis algorithms');
  }

  private async updatePriceData(): Promise<void> {
    // Update prices from all configured sources
    this.priceDataSources.forEach(async (source, sourceName) => {
      try {
        await this.fetchPricesFromSource(sourceName, source);
      } catch (error) {
        console.error(`❌ Failed to update prices from ${sourceName}:`, error);
      }
    });
  }

  private async fetchPricesFromSource(sourceName: string, source: PriceDataSource): Promise<void> {
    // In production, this would make actual API calls
    // For now, simulate data updates
    console.log(`📡 Updating prices from ${sourceName}`);
  }

  private async generateDemoHistoricalData(startDate: Date, endDate: Date): Promise<any[]> {
    const data = [];
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let basePrice = 1.45; // Euro per liter
    
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
      
      // Simulate price variations
      const dailyChange = (Math.random() - 0.5) * 0.06; // ±3% daily variation
      const seasonalFactor = Math.sin((i / 365) * 2 * Math.PI) * 0.1;
      const trendFactor = Math.sin((i / 30) * 2 * Math.PI) * 0.05;
      
      basePrice += dailyChange + (seasonalFactor / 100) + (trendFactor / 100);
      basePrice = Math.max(1.20, Math.min(1.80, basePrice)); // Clamp between reasonable bounds
      
      data.push({
        date: date,
        price: Number(basePrice.toFixed(3)),
        volume: Math.floor(Math.random() * 10000) + 5000,
        volatility: Math.abs(dailyChange),
        marketFactors: {
          crude_oil: basePrice * 0.6,
          refining_margin: basePrice * 0.2,
          taxes: basePrice * 0.2
        }
      });
    }
    
    return data;
  }

  // === CORE OPTIMIZATION METHODS ===

  async optimizeFuelPurchasing(route: any, vehicleProfile: any, fuelNeed: number): Promise<any> {
    console.log(`💰 Optimizing fuel purchasing for ${fuelNeed}L needed`);
    
    try {
      // Get current fuel prices along route
      const routePrices = await this.getRouteFuelPrices(route);
      
      // Analyze market trends
      const marketTrends = await this.analyzeMarketTrends();
      
      // Calculate optimal purchasing strategy
      const purchasingStrategy = await this.calculateOptimalStrategy(
        routePrices, 
        marketTrends, 
        fuelNeed, 
        vehicleProfile
      );
      
      // Apply discount optimizations
      const discountOptimization = await this.optimizeDiscounts(purchasingStrategy, vehicleProfile);
      
      // Generate timing recommendations
      const timingRecommendations = await this.optimizePurchasingTiming(purchasingStrategy, marketTrends);
      
      // Calculate total savings
      const savingsAnalysis = this.calculateTotalSavings(purchasingStrategy, discountOptimization);
      
      console.log(`✅ Fuel purchasing optimized: ${savingsAnalysis.totalSavingsPercent.toFixed(1)}% savings identified`);
      
      return {
        strategy: purchasingStrategy,
        discountOptimization: discountOptimization,
        timing: timingRecommendations,
        savings: savingsAnalysis,
        marketContext: marketTrends,
        confidence: this.calculateOptimizationConfidence(purchasingStrategy),
        validUntil: this.calculateValidityPeriod()
      };
      
    } catch (error) {
      console.error('❌ Fuel purchasing optimization failed:', error);
      return this.fallbackPricingStrategy(route, fuelNeed);
    }
  }

  private async getRouteFuelPrices(route: any): Promise<any> {
    const stations: FuelStation[] = [];
    const searchRadius = 5; // km from route
    
    try {
      // Search pentru fuel stations along route
      const routeStations = await this.findStationsAlongRoute(route, searchRadius);
      
      // Get real-time prices pentru each station
      for (const station of routeStations) {
        const priceData = await this.getStationPrices(station);
        
        if (priceData) {
          const stationWithPricing: FuelStation = {
            ...station,
            prices: priceData,
            detourDistance: this.calculateDetourDistance(route, station),
            detourTime: this.calculateDetourTime(route, station),
            detourCost: this.calculateDetourCost(route, station),
            totalCostPerLiter: this.calculateTotalCostPerLiter(priceData, station),
            qualityRating: await this.getStationQualityRating(station.id),
            discountsAvailable: await this.getAvailableDiscounts(station.id),
            currentInventory: await this.checkFuelAvailability(station.id)
          };
          stations.push(stationWithPricing);
        }
      }
      
      // Sort by total cost efficiency
      stations.sort((a, b) => (a.totalCostPerLiter || 0) - (b.totalCostPerLiter || 0));
      
      return {
        totalStationsFound: stations.length,
        stations: stations,
        priceRange: this.calculatePriceRange(stations),
        averagePrice: this.calculateAveragePrice(stations),
        bestValueStation: stations[0],
        lastUpdated: new Date()
      };
      
    } catch (error) {
      console.error('❌ Failed to get route fuel prices:', error);
      return this.getDefaultPriceData(route);
    }
  }

  private async analyzeMarketTrends(): Promise<MarketTrends> {
    try {
      // Get fuel futures data
      const futuresData = await this.getFuturesData();
      
      // Analyze price trends
      const trendAnalysis = await this.analyzePriceTrends(futuresData);
      
      // Check supply chain factors
      const supplyFactors = await this.analyzeSupplyFactors();
      
      // Seasonal pattern analysis
      const seasonalFactors = this.analyzeSeasonalFactors();
      
      // Generate market outlook
      const marketOutlook = this.generateMarketOutlook(trendAnalysis, supplyFactors, seasonalFactors);
      
      return {
        currentTrend: trendAnalysis.direction,
        trendStrength: trendAnalysis.strength,
        shortTermForecast: trendAnalysis.shortTerm,
        mediumTermForecast: trendAnalysis.mediumTerm,
        supplyChainStatus: supplyFactors.status,
        seasonalImpact: seasonalFactors.impact,
        marketOutlook: marketOutlook,
        confidence: trendAnalysis.confidence,
        keyFactors: this.identifyKeyMarketFactors(trendAnalysis, supplyFactors)
      };
      
    } catch (error) {
      console.error('❌ Market trend analysis failed:', error);
      return this.getDefaultMarketTrends();
    }
  }

  private async calculateOptimalStrategy(routePrices: any, marketTrends: MarketTrends, fuelNeed: number, vehicleProfile: any): Promise<any> {
    const strategies: PurchasingStrategy[] = [];
    
    // Strategy 1: Immediate best price
    const immediateBest = this.calculateImmediateStrategy(routePrices, fuelNeed);
    strategies.push(immediateBest);
    
    // Strategy 2: Market timing optimization
    if (marketTrends.currentTrend === 'falling') {
      const delayStrategy = this.calculateDelayStrategy(routePrices, marketTrends, fuelNeed);
      strategies.push(delayStrategy);
    }
    
    // Strategy 3: Bulk purchasing (dacă tank capacity allows)
    const tankCapacity = vehicleProfile?.technicalSpecs?.fuelSystem?.tankCapacity || fuelNeed * 2;
    if (tankCapacity > fuelNeed * 1.5) {
      const bulkStrategy = this.calculateBulkStrategy(routePrices, marketTrends, tankCapacity);
      strategies.push(bulkStrategy);
    }
    
    // Strategy 4: Split purchasing
    const splitStrategy = this.calculateSplitStrategy(routePrices, marketTrends, fuelNeed);
    strategies.push(splitStrategy);
    
    // Select optimal strategy based pe total cost și risk
    const optimalStrategy = this.selectOptimalStrategy(strategies, marketTrends);
    
    return {
      selectedStrategy: optimalStrategy,
      alternativeStrategies: strategies.filter(s => s.id !== optimalStrategy.id),
      recommendation: this.generateStrategyRecommendation(optimalStrategy),
      riskAssessment: this.assessStrategyRisk(optimalStrategy, marketTrends),
      estimatedSavings: optimalStrategy.totalSavings
    };
  }

  private calculateImmediateStrategy(routePrices: any, fuelNeed: number): PurchasingStrategy {
    const bestStation = routePrices.bestValueStation;
    
    return {
      id: 'immediate_best_price',
      type: 'immediate_purchase',
      description: 'Purchase full amount at best current price',
      station: bestStation,
      amount: fuelNeed,
      timing: 'immediate',
      totalCost: (bestStation?.totalCostPerLiter || 1.45) * fuelNeed,
      totalSavings: this.calculateSavingsVsAverage(bestStation, routePrices.averagePrice, fuelNeed),
      risk: 'low',
      confidence: 0.95
    };
  }

  private calculateDelayStrategy(routePrices: any, marketTrends: MarketTrends, fuelNeed: number): PurchasingStrategy {
    // Calculate optimal delay based pe trend strength
    const optimalDelay = Math.min(7, marketTrends.trendStrength * 10); // max 7 days
    const projectedPriceChange = marketTrends.shortTermForecast.priceChange;
    const projectedSavings = Math.abs(projectedPriceChange) * fuelNeed;
    const projectedTotalCost = (routePrices.averagePrice + projectedPriceChange) * fuelNeed;
    
    return {
      id: 'market_timing_delay',
      type: 'delayed_purchase',
      description: `Delay purchase ${optimalDelay} days for better pricing`,
      delayDays: optimalDelay,
      amount: fuelNeed,
      timing: `delay_${optimalDelay}_days`,
      totalCost: projectedTotalCost,
      projectedTotalCost: projectedTotalCost,
      totalSavings: projectedSavings,
      risk: 'medium',
      confidence: marketTrends.confidence
    };
  }

  private calculateBulkStrategy(routePrices: any, marketTrends: MarketTrends, tankCapacity: number): PurchasingStrategy {
    const bulkAmount = tankCapacity * 0.9; // 90% tank capacity
    const bestStation = routePrices.bestValueStation;
    
    // Calculate bulk discount dacă applicable
    const bulkDiscount = this.calculateBulkDiscount(bulkAmount, bestStation);
    const effectivePrice = (bestStation?.totalCostPerLiter || 1.45) * (1 - bulkDiscount);
    
    return {
      id: 'bulk_purchase',
      type: 'bulk_purchase',
      description: 'Purchase maximum tank capacity for volume savings',
      station: bestStation,
      amount: bulkAmount,
      timing: 'immediate',
      totalCost: effectivePrice * bulkAmount,
      bulkDiscount: bulkDiscount,
      totalSavings: ((bestStation?.totalCostPerLiter || 1.45) - effectivePrice) * bulkAmount,
      risk: 'low',
      confidence: 0.9
    };
  }

  private calculateSplitStrategy(routePrices: any, marketTrends: MarketTrends, fuelNeed: number): PurchasingStrategy {
    // Split purchase între immediate needs și future reserves
    const immediatePortion = fuelNeed * 0.6; // 60% immediate
    const futurePortion = fuelNeed * 0.4; // 40% when prices improve
    
    const bestStation = routePrices.bestValueStation;
    const currentPrice = bestStation?.totalCostPerLiter || 1.45;
    const projectedFuturePrice = currentPrice + marketTrends.shortTermForecast.priceChange;
    
    const totalCost = (immediatePortion * currentPrice) + (futurePortion * projectedFuturePrice);
    const benchmarkCost = fuelNeed * currentPrice;
    const savings = benchmarkCost - totalCost;
    
    return {
      id: 'split_purchase',
      type: 'split_purchase',
      description: 'Split purchase between immediate and future optimal timing',
      station: bestStation,
      amount: fuelNeed,
      timing: 'split_timing',
      totalCost: totalCost,
      totalSavings: savings,
      risk: 'medium',
      confidence: 0.8
    };
  }

  private selectOptimalStrategy(strategies: PurchasingStrategy[], marketTrends: MarketTrends): PurchasingStrategy {
    // Score strategies based pe savings, risk, și confidence
    const scoredStrategies = strategies.map(strategy => {
      const savingsScore = strategy.totalSavings * 0.4;
      const riskScore = (strategy.risk === 'low' ? 1 : strategy.risk === 'medium' ? 0.7 : 0.4) * 0.3;
      const confidenceScore = strategy.confidence * 0.3;
      
      return {
        ...strategy,
        score: savingsScore + riskScore + confidenceScore
      };
    });
    
    // Return highest scoring strategy
    scoredStrategies.sort((a, b) => (b as any).score - (a as any).score);
    return scoredStrategies[0];
  }

  // === HELPER METHODS ===

  private async findStationsAlongRoute(route: any, searchRadius: number): Promise<FuelStation[]> {
    // Generate demo stations along route
    const stations: FuelStation[] = [];
    const stationCount = Math.floor(Math.random() * 5) + 3; // 3-8 stations
    
    for (let i = 0; i < stationCount; i++) {
      stations.push({
        id: `station_${i + 1}`,
        name: `Fuel Station ${i + 1}`,
        location: {
          lat: 44.4268 + (Math.random() - 0.5) * 0.1,
          lng: 26.1025 + (Math.random() - 0.5) * 0.1,
          address: `Station Address ${i + 1}, București`
        },
        brands: [['Shell', 'BP', 'Total', 'OMV', 'Petrom'][Math.floor(Math.random() * 5)]],
        amenities: ['toilet', 'shop', 'car_wash', 'restaurant'].slice(0, Math.floor(Math.random() * 4) + 1)
      });
    }
    
    return stations;
  }

  private async getStationPrices(station: FuelStation): Promise<any> {
    // Generate realistic price data
    const basePrice = 1.45 + (Math.random() - 0.5) * 0.2; // ±0.1 EUR variation
    
    return {
      diesel: Number((basePrice * 0.95).toFixed(3)),
      gasoline: Number(basePrice.toFixed(3)),
      premium: Number((basePrice * 1.08).toFixed(3)),
      lastUpdated: new Date()
    };
  }

  private calculateDetourDistance(route: any, station: FuelStation): number {
    return Math.random() * 3; // 0-3 km detour
  }

  private calculateDetourTime(route: any, station: FuelStation): number {
    return Math.random() * 10; // 0-10 minutes
  }

  private calculateDetourCost(route: any, station: FuelStation): number {
    const distance = this.calculateDetourDistance(route, station);
    return distance * 0.3; // 0.3 EUR per km detour cost
  }

  private calculateTotalCostPerLiter(priceData: any, station: FuelStation): number {
    const basePrice = priceData.diesel || 1.45;
    const detourCost = this.calculateDetourCost({}, station);
    return basePrice + (detourCost / 50); // Spread detour cost over 50L average
  }

  private async getStationQualityRating(stationId: string): Promise<number> {
    return 3.5 + Math.random() * 1.5; // 3.5-5.0 rating
  }

  private async getAvailableDiscounts(stationId: string): Promise<any[]> {
    const discounts = [];
    if (Math.random() > 0.5) {
      discounts.push({
        type: 'fuel_card',
        provider: 'Shell',
        discount: 0.05,
        description: '5% fuel card discount'
      });
    }
    if (Math.random() > 0.7) {
      discounts.push({
        type: 'loyalty',
        program: 'Station Loyalty',
        discount: 0.03,
        description: '3% loyalty program discount'
      });
    }
    return discounts;
  }

  private async checkFuelAvailability(stationId: string): Promise<any> {
    return {
      diesel: Math.random() > 0.1, // 90% availability
      gasoline: Math.random() > 0.05, // 95% availability
      premium: Math.random() > 0.15 // 85% availability
    };
  }

  private calculatePriceRange(stations: FuelStation[]): any {
    const prices = stations.map(s => s.totalCostPerLiter || 1.45);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      spread: Math.max(...prices) - Math.min(...prices)
    };
  }

  private calculateAveragePrice(stations: FuelStation[]): number {
    const prices = stations.map(s => s.totalCostPerLiter || 1.45);
    return prices.reduce((sum, price) => sum + price, 0) / prices.length;
  }

  private getDefaultPriceData(route: any): any {
    return {
      totalStationsFound: 0,
      stations: [],
      priceRange: { min: 1.40, max: 1.50, spread: 0.10 },
      averagePrice: 1.45,
      bestValueStation: null,
      lastUpdated: new Date()
    };
  }

  private calculateSavingsVsAverage(station: FuelStation, averagePrice: number, fuelNeed: number): number {
    const stationPrice = station?.totalCostPerLiter || averagePrice;
    return (averagePrice - stationPrice) * fuelNeed;
  }

  private calculateBulkDiscount(amount: number, station: FuelStation): number {
    // Volume-based discounts
    if (amount > 1000) return 0.08; // 8% for 1000L+
    if (amount > 500) return 0.05; // 5% for 500L+
    if (amount > 200) return 0.03; // 3% for 200L+
    return 0;
  }

  private generateStrategyRecommendation(strategy: PurchasingStrategy): string {
    return `Recommended: ${strategy.description} - Expected savings: ${strategy.totalSavings.toFixed(2)} EUR`;
  }

  private assessStrategyRisk(strategy: PurchasingStrategy, marketTrends: MarketTrends): any {
    return {
      level: strategy.risk,
      factors: [`Market trend: ${marketTrends.currentTrend}`, `Confidence: ${strategy.confidence}`],
      mitigation: 'Monitor market conditions and adjust timing as needed'
    };
  }

  private calculateOptimizationConfidence(purchasingStrategy: any): number {
    return purchasingStrategy.selectedStrategy.confidence;
  }

  private calculateValidityPeriod(): Date {
    return new Date(Date.now() + (2 * 60 * 60 * 1000)); // Valid for 2 hours
  }

  private fallbackPricingStrategy(route: any, fuelNeed: number): any {
    return {
      strategy: {
        selectedStrategy: {
          id: 'fallback',
          type: 'basic_price_search',
          description: 'Basic price comparison fallback',
          timing: 'immediate',
          totalCost: fuelNeed * 1.45,
          totalSavings: 0,
          risk: 'low',
          confidence: 0.5
        }
      },
      error: 'Dynamic pricing optimization unavailable, using fallback strategy'
    };
  }

  // === MARKET ANALYSIS METHODS ===

  private async getFuturesData(): Promise<any> {
    try {
      // Simulate futures data - in production would use real API
      const symbols = this.marketAnalyzer?.commoditySymbols || ['CL', 'HO', 'RB'];
      const futuresData: any = {};
      
      for (const symbol of symbols) {
        futuresData[symbol] = {
          symbol: symbol,
          currentPrice: 70 + (Math.random() - 0.5) * 20, // $50-90 range
          historicalPrices: this.generateFuturesPrices(30),
          volume: Math.floor(Math.random() * 100000) + 50000,
          openInterest: Math.floor(Math.random() * 50000) + 25000
        };
      }
      
      return futuresData;
      
    } catch (error) {
      console.error('❌ Futures data fetch failed:', error);
      return this.getDefaultFuturesData();
    }
  }

  private generateFuturesPrices(days: number): any[] {
    const prices = [];
    let basePrice = 70;
    
    for (let i = 0; i < days; i++) {
      const change = (Math.random() - 0.5) * 4; // ±$2 daily variation
      basePrice += change;
      basePrice = Math.max(50, Math.min(100, basePrice));
      
      prices.push({
        date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000),
        price: Number(basePrice.toFixed(2)),
        volume: Math.floor(Math.random() * 10000) + 5000
      });
    }
    
    return prices;
  }

  private getDefaultFuturesData(): any {
    return {
      CL: { symbol: 'CL', currentPrice: 70, historicalPrices: [] },
      HO: { symbol: 'HO', currentPrice: 2.1, historicalPrices: [] },
      RB: { symbol: 'RB', currentPrice: 2.0, historicalPrices: [] }
    };
  }

  private async analyzePriceTrends(futuresData: any): Promise<any> {
    const trends: any = {};
    
    Object.keys(futuresData).forEach(symbol => {
      const prices = futuresData[symbol].historicalPrices || [];
      const trend = this.calculateTrendDirection(prices);
      trends[symbol] = trend;
    });
    
    const overallTrend = this.synthesizeOverallTrend(trends);
    
    return {
      direction: overallTrend.direction,
      strength: overallTrend.strength,
      confidence: overallTrend.confidence,
      shortTerm: this.generateShortTermForecast(trends),
      mediumTerm: this.generateMediumTermForecast(trends),
      individualTrends: trends
    };
  }

  private calculateTrendDirection(prices: any[]): any {
    if (prices.length < 10) return { direction: 'stable', strength: 0, confidence: 0.5 };
    
    const recent = prices.slice(-7);
    const older = prices.slice(-14, -7);
    
    const recentAvg = recent.reduce((sum, p) => sum + p.price, 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + p.price, 0) / older.length;
    
    const change = (recentAvg - olderAvg) / olderAvg;
    const strength = Math.abs(change);
    
    let direction = 'stable';
    if (change > 0.02) direction = 'rising';
    else if (change < -0.02) direction = 'falling';
    
    return {
      direction: direction,
      strength: Math.min(1, strength * 10),
      confidence: Math.min(1, prices.length / 30),
      change: change
    };
  }

  private synthesizeOverallTrend(trends: any): any {
    const directions = Object.values(trends).map((t: any) => t.direction);
    const strengths = Object.values(trends).map((t: any) => t.strength);
    const confidences = Object.values(trends).map((t: any) => t.confidence);
    
    // Majority direction
    const risingCount = directions.filter(d => d === 'rising').length;
    const fallingCount = directions.filter(d => d === 'falling').length;
    
    let overallDirection = 'stable';
    if (risingCount > fallingCount) overallDirection = 'rising';
    else if (fallingCount > risingCount) overallDirection = 'falling';
    
    const avgStrength = strengths.reduce((sum: number, s: number) => sum + s, 0) / strengths.length;
    const avgConfidence = confidences.reduce((sum: number, c: number) => sum + c, 0) / confidences.length;
    
    return {
      direction: overallDirection,
      strength: avgStrength,
      confidence: avgConfidence
    };
  }

  private generateShortTermForecast(trends: any): any {
    const avgChange = Object.values(trends).reduce((sum: number, t: any) => sum + t.change, 0) / Object.keys(trends).length;
    
    return {
      direction: avgChange > 0 ? 'rising' : avgChange < 0 ? 'falling' : 'stable',
      priceChange: avgChange * 0.1, // Convert to EUR/L impact
      confidence: 0.7
    };
  }

  private generateMediumTermForecast(trends: any): any {
    const avgChange = Object.values(trends).reduce((sum: number, t: any) => sum + t.change, 0) / Object.keys(trends).length;
    
    return {
      direction: avgChange > 0 ? 'rising' : avgChange < 0 ? 'falling' : 'stable',
      priceChange: avgChange * 0.2, // Longer term impact
      confidence: 0.6
    };
  }

  private async analyzeSupplyFactors(): Promise<any> {
    // Simulate supply chain analysis
    const factors = {
      refinerCapacity: 0.85 + Math.random() * 0.2, // 85-105% capacity
      inventoryLevels: 0.7 + Math.random() * 0.4, // 70-110% normal levels
      transportationIssues: Math.random() > 0.8, // 20% chance of issues
      regionalSupply: 'normal'
    };
    
    let status = 'stable';
    if (factors.refinerCapacity < 0.9 || factors.inventoryLevels < 0.8) status = 'tight';
    if (factors.refinerCapacity > 1.05 || factors.inventoryLevels > 1.1) status = 'oversupply';
    if (factors.transportationIssues) status = 'disrupted';
    
    return {
      status: status,
      factors: factors,
      impact: this.calculateSupplyImpact(factors)
    };
  }

  private calculateSupplyImpact(factors: any): number {
    let impact = 0;
    
    if (factors.refinerCapacity < 0.9) impact += 0.05; // 5% price impact
    if (factors.inventoryLevels < 0.8) impact += 0.03; // 3% price impact
    if (factors.transportationIssues) impact += 0.08; // 8% price impact
    
    return Math.min(0.2, impact); // Cap at 20% impact
  }

  private analyzeSeasonalFactors(): any {
    const month = new Date().getMonth();
    const seasonalFactors = {
      winter: [11, 0, 1, 2], // Dec, Jan, Feb, Mar
      spring: [3, 4, 5], // Apr, May, Jun
      summer: [6, 7, 8], // Jul, Aug, Sep
      autumn: [9, 10] // Oct, Nov
    };
    
    let season = 'spring';
    let impact = 0;
    
    if (seasonalFactors.winter.includes(month)) {
      season = 'winter';
      impact = 0.08; // 8% higher demand
    } else if (seasonalFactors.summer.includes(month)) {
      season = 'summer';
      impact = 0.05; // 5% higher demand (travel season)
    } else if (seasonalFactors.autumn.includes(month)) {
      season = 'autumn';
      impact = -0.02; // 2% lower demand
    }
    
    return {
      season: season,
      impact: impact,
      description: `${season} seasonal factor: ${impact > 0 ? '+' : ''}${(impact * 100).toFixed(0)}%`
    };
  }

  private generateMarketOutlook(trendAnalysis: any, supplyFactors: any, seasonalFactors: any): string {
    const trend = trendAnalysis.direction;
    const supply = supplyFactors.status;
    const seasonal = seasonalFactors.impact;
    
    let outlook = 'Neutral market conditions expected. ';
    
    if (trend === 'rising' && supply === 'tight') {
      outlook = 'Bullish outlook - rising trend with tight supply. ';
    } else if (trend === 'falling' && supply === 'oversupply') {
      outlook = 'Bearish outlook - falling trend with oversupply. ';
    } else if (seasonal > 0.05) {
      outlook = 'Seasonal demand increase expected. ';
    }
    
    return outlook + 'Monitor market conditions closely.';
  }

  private identifyKeyMarketFactors(trendAnalysis: any, supplyFactors: any): string[] {
    const factors = [];
    
    if (trendAnalysis.strength > 0.5) {
      factors.push(`Strong ${trendAnalysis.direction} trend in futures`);
    }
    
    if (supplyFactors.status !== 'stable') {
      factors.push(`Supply chain status: ${supplyFactors.status}`);
    }
    
    if (supplyFactors.factors.transportationIssues) {
      factors.push('Transportation disruptions detected');
    }
    
    return factors;
  }

  private getDefaultMarketTrends(): MarketTrends {
    return {
      currentTrend: 'stable',
      trendStrength: 0.3,
      shortTermForecast: {
        direction: 'stable',
        priceChange: 0,
        confidence: 0.5
      },
      mediumTermForecast: {
        direction: 'stable',
        priceChange: 0,
        confidence: 0.5
      },
      supplyChainStatus: 'unknown',
      seasonalImpact: 0,
      marketOutlook: 'Market data unavailable',
      confidence: 0.3,
      keyFactors: ['Limited market data available']
    };
  }

  // === DISCOUNT OPTIMIZATION METHODS ===

  async optimizeDiscounts(purchasingStrategy: any, vehicleProfile: any): Promise<any> {
    const availableDiscounts = [];
    
    try {
      // Fuel card discounts
      const fuelCardDiscounts = await this.getFuelCardDiscounts(vehicleProfile.associations?.fuelCards || []);
      availableDiscounts.push(...fuelCardDiscounts);
      
      // Loyalty program benefits
      const loyaltyBenefits = await this.getLoyaltyProgramBenefits(purchasingStrategy.selectedStrategy?.station);
      availableDiscounts.push(...loyaltyBenefits);
      
      // Corporate fleet discounts
      const fleetDiscounts = await this.getFleetDiscounts(vehicleProfile.fleetId);
      availableDiscounts.push(...fleetDiscounts);
      
      // Time-based discounts (happy hour pricing)
      const timeDiscounts = this.getTimeBasedDiscounts(purchasingStrategy.selectedStrategy?.station);
      availableDiscounts.push(...timeDiscounts);
      
      // Volume discounts
      const volumeDiscounts = this.getVolumeDiscounts(purchasingStrategy.selectedStrategy?.amount, purchasingStrategy.selectedStrategy?.station);
      availableDiscounts.push(...volumeDiscounts);
      
      // Stack compatible discounts
      const stackedDiscounts = this.stackCompatibleDiscounts(availableDiscounts);
      
      // Calculate total discount value
      const totalDiscountValue = stackedDiscounts.reduce((sum, discount) => sum + discount.value, 0);
      
      return {
        availableDiscounts: availableDiscounts,
        stackedDiscounts: stackedDiscounts,
        totalDiscountPercent: totalDiscountValue,
        totalSavingsAmount: (purchasingStrategy.selectedStrategy?.totalCost || 0) * totalDiscountValue,
        optimalDiscountCombination: stackedDiscounts,
        applicationType: 'automatic'
      };
      
    } catch (error) {
      console.error('❌ Discount optimization failed:', error);
      return this.getDefaultDiscountOptimization();
    }
  }

  private async getFuelCardDiscounts(fuelCards: string[]): Promise<any[]> {
    const discounts = [];
    
    for (const card of fuelCards) {
      switch (card.toLowerCase()) {
        case 'shell':
          discounts.push({
            type: 'fuel_card',
            provider: 'Shell',
            value: 0.06,
            description: '6% Shell fuel card discount',
            stackable: false
          });
          break;
        case 'bp':
          discounts.push({
            type: 'fuel_card',
            provider: 'BP',
            value: 0.05,
            description: '5% BP fuel card discount',
            stackable: false
          });
          break;
        case 'total':
          discounts.push({
            type: 'fuel_card',
            provider: 'Total',
            value: 0.055,
            description: '5.5% Total fuel card discount',
            stackable: false
          });
          break;
      }
    }
    
    return discounts;
  }

  private async getLoyaltyProgramBenefits(station: FuelStation): Promise<any[]> {
    const benefits = [];
    
    if (station && Math.random() > 0.6) { // 40% chance of loyalty program
      benefits.push({
        type: 'loyalty',
        program: `${station.name} Loyalty`,
        value: 0.02 + Math.random() * 0.03, // 2-5% loyalty discount
        description: 'Loyalty program discount',
        stackable: true
      });
    }
    
    return benefits;
  }

  private async getFleetDiscounts(fleetId: string): Promise<any[]> {
    const discounts = [];
    
    if (fleetId && Math.random() > 0.5) { // 50% chance of fleet discount
      discounts.push({
        type: 'fleet',
        provider: 'Corporate Fleet',
        value: 0.04 + Math.random() * 0.04, // 4-8% fleet discount
        description: 'Corporate fleet volume discount',
        stackable: true
      });
    }
    
    return discounts;
  }

  private getTimeBasedDiscounts(station: FuelStation): any[] {
    const discounts = [];
    const hour = new Date().getHours();
    
    // Happy hour pricing (off-peak hours)
    if ((hour >= 10 && hour <= 14) || (hour >= 20 && hour <= 22)) {
      discounts.push({
        type: 'time_based',
        timeWindow: 'off_peak',
        value: 0.03,
        description: 'Off-peak hours 3% discount',
        stackable: true,
        validUntil: this.getNextPeakHour()
      });
    }
    
    return discounts;
  }

  private getNextPeakHour(): Date {
    const now = new Date();
    const hour = now.getHours();
    let nextPeakHour = 15; // 3 PM
    
    if (hour >= 15) nextPeakHour = 23; // 11 PM
    if (hour >= 23) nextPeakHour = 7; // 7 AM next day
    
    const nextPeak = new Date(now);
    nextPeak.setHours(nextPeakHour, 0, 0, 0);
    
    if (nextPeakHour === 7 && hour >= 23) {
      nextPeak.setDate(nextPeak.getDate() + 1);
    }
    
    return nextPeak;
  }

  private getVolumeDiscounts(amount: number, station: FuelStation): any[] {
    const discounts = [];
    
    if (amount >= 100) {
      let discountRate = 0;
      let description = '';
      
      if (amount >= 1000) {
        discountRate = 0.08;
        description = 'Volume discount 1000L+ (8%)';
      } else if (amount >= 500) {
        discountRate = 0.05;
        description = 'Volume discount 500L+ (5%)';
      } else if (amount >= 200) {
        discountRate = 0.03;
        description = 'Volume discount 200L+ (3%)';
      } else {
        discountRate = 0.02;
        description = 'Volume discount 100L+ (2%)';
      }
      
      discounts.push({
        type: 'volume',
        threshold: amount,
        value: discountRate,
        description: description,
        stackable: false
      });
    }
    
    return discounts;
  }

  private stackCompatibleDiscounts(discounts: any[]): any[] {
    const stacked = [];
    
    // Add best non-stackable discount
    const nonStackable = discounts.filter(d => !d.stackable);
    if (nonStackable.length > 0) {
      const bestNonStackable = nonStackable.reduce((best, current) => 
        current.value > best.value ? current : best
      );
      stacked.push(bestNonStackable);
    }
    
    // Add all stackable discounts
    const stackable = discounts.filter(d => d.stackable);
    stacked.push(...stackable);
    
    return stacked;
  }

  private getDefaultDiscountOptimization(): any {
    return {
      availableDiscounts: [],
      stackedDiscounts: [],
      totalDiscountPercent: 0,
      totalSavingsAmount: 0,
      optimalDiscountCombination: [],
      applicationType: 'manual'
    };
  }

  // === TIMING OPTIMIZATION METHODS ===

  async optimizePurchasingTiming(strategy: any, marketTrends: MarketTrends): Promise<any> {
    const timingOptions = [];
    
    // Immediate timing
    timingOptions.push({
      timing: 'immediate',
      description: 'Purchase now at current prices',
      priceRisk: 'low',
      supplyRisk: 'low',
      totalRisk: 'low',
      estimatedPrice: (strategy.selectedStrategy?.totalCost || 0) / (strategy.selectedStrategy?.amount || 1)
    });
    
    // Market-based timing
    if (marketTrends.currentTrend === 'falling') {
      const optimalDelay = this.calculateOptimalDelay(marketTrends);
      timingOptions.push({
        timing: `delay_${optimalDelay}_days`,
        description: `Wait ${optimalDelay} days for better prices`,
        priceRisk: 'medium',
        supplyRisk: 'low',
        totalRisk: 'medium',
        estimatedPrice: this.projectFuturePrice(strategy.selectedStrategy, optimalDelay),
        potentialSavings: this.calculateDelaySavings(strategy.selectedStrategy, optimalDelay)
      });
    }
    
    // Time-of-day optimization
    const todOptimization = this.getTimeOfDayOptimization(strategy.selectedStrategy?.station);
    if (todOptimization.savingsAvailable) {
      timingOptions.push({
        timing: todOptimization.optimalTime,
        description: `Purchase during ${todOptimization.optimalTime} for time-based discounts`,
        priceRisk: 'low',
        supplyRisk: 'low',
        totalRisk: 'low',
        estimatedPrice: (strategy.selectedStrategy?.totalCost || 0) / (strategy.selectedStrategy?.amount || 1) * (1 - todOptimization.discount),
        potentialSavings: (strategy.selectedStrategy?.totalCost || 0) * todOptimization.discount
      });
    }
    
    // Select optimal timing
    const optimalTiming = this.selectOptimalTiming(timingOptions, marketTrends);
    
    return {
      recommendedTiming: optimalTiming,
      alternativeTimings: timingOptions.filter(t => t.timing !== optimalTiming.timing),
      timingRationale: this.generateTimingRationale(optimalTiming, marketTrends),
      riskAssessment: this.assessTimingRisk(optimalTiming, marketTrends)
    };
  }

  private calculateOptimalDelay(marketTrends: MarketTrends): number {
    return Math.min(7, marketTrends.trendStrength * 10);
  }

  private projectFuturePrice(strategy: any, delayDays: number): number {
    const currentPrice = (strategy?.totalCost || 0) / (strategy?.amount || 1);
    const dailyChange = -0.01; // Assume 1% daily decrease during falling trend
    return currentPrice * Math.pow(1 + dailyChange, delayDays);
  }

  private calculateDelaySavings(strategy: any, delayDays: number): number {
    const currentCost = strategy?.totalCost || 0;
    const futureCost = this.projectFuturePrice(strategy, delayDays) * (strategy?.amount || 1);
    return Math.max(0, currentCost - futureCost);
  }

  private getTimeOfDayOptimization(station: FuelStation): any {
    const hour = new Date().getHours();
    const isOffPeak = (hour >= 10 && hour <= 14) || (hour >= 20 && hour <= 22);
    
    return {
      savingsAvailable: isOffPeak,
      optimalTime: isOffPeak ? 'current_off_peak' : 'next_off_peak',
      discount: isOffPeak ? 0.03 : 0,
      nextOptimalWindow: isOffPeak ? null : this.getNextOffPeakWindow()
    };
  }

  private getNextOffPeakWindow(): string {
    const hour = new Date().getHours();
    
    if (hour < 10) return '10:00-14:00 today';
    if (hour >= 10 && hour < 14) return '20:00-22:00 today';
    if (hour >= 14 && hour < 20) return '20:00-22:00 today';
    return '10:00-14:00 tomorrow';
  }

  private selectOptimalTiming(timingOptions: any[], marketTrends: MarketTrends): any {
    // Score timing options based on potential savings and risk
    const scoredOptions = timingOptions.map(option => {
      const savingsScore = (option.potentialSavings || 0) * 0.5;
      const riskScore = (option.totalRisk === 'low' ? 1 : option.totalRisk === 'medium' ? 0.7 : 0.4) * 0.5;
      
      return {
        ...option,
        score: savingsScore + riskScore
      };
    });
    
    scoredOptions.sort((a, b) => (b as any).score - (a as any).score);
    return scoredOptions[0];
  }

  private generateTimingRationale(timing: any, marketTrends: MarketTrends): string {
    if (timing.timing === 'immediate') {
      return 'Immediate purchase recommended due to stable market conditions and low supply risk.';
    }
    
    if (timing.timing.includes('delay')) {
      return `Delay recommended due to ${marketTrends.currentTrend} market trend. Expected savings: ${(timing.potentialSavings || 0).toFixed(2)} EUR.`;
    }
    
    if (timing.timing.includes('off_peak')) {
      return 'Time-based discount available during off-peak hours. Optimal timing for cost savings.';
    }
    
    return 'Optimal timing selected based on market analysis and risk assessment.';
  }

  private assessTimingRisk(timing: any, marketTrends: MarketTrends): any {
    return {
      priceRisk: timing.priceRisk,
      supplyRisk: timing.supplyRisk,
      totalRisk: timing.totalRisk,
      factors: [
        `Market trend: ${marketTrends.currentTrend}`,
        `Confidence: ${marketTrends.confidence.toFixed(1)}`,
        `Supply status: ${marketTrends.supplyChainStatus}`
      ],
      mitigation: 'Monitor market conditions and adjust timing if trends change significantly.'
    };
  }

  private calculateTotalSavings(purchasingStrategy: any, discountOptimization: any): any {
    // Base savings vs average market price
    const baseSavings = purchasingStrategy.estimatedSavings || 0;
    
    // Additional discount savings
    const discountSavings = discountOptimization.totalSavingsAmount || 0;
    
    // Strategic timing savings
    const timingSavings = purchasingStrategy.selectedStrategy?.timingSavings || 0;
    
    const totalSavings = baseSavings + discountSavings + timingSavings;
    const totalCost = (purchasingStrategy.selectedStrategy?.totalCost || 0) - totalSavings;
    const savingsPercent = totalSavings / ((totalCost + totalSavings) || 1);
    
    return {
      baseSavings: baseSavings,
      discountSavings: discountSavings,
      timingSavings: timingSavings,
      totalSavingsAmount: totalSavings,
      totalSavingsPercent: savingsPercent,
      finalCost: totalCost,
      benchmarkPrice: this.getMarketBenchmarkPrice(),
      savingsBreakdown: {
        locationOptimization: baseSavings,
        discountOptimization: discountSavings,
        timingOptimization: timingSavings
      }
    };
  }

  private getMarketBenchmarkPrice(): number {
    return 1.45; // EUR per liter benchmark
  }

  // === ARBITRAGE AND SUPPLY CHAIN METHODS ===

  async detectArbitrageOpportunities(currentLocation: any, searchRadius: number = 50): Promise<any> {
    const opportunities: any[] = [];
    
    try {
      // Get prices în expanded radius
      const expandedPrices = await this.getPricesInRadius(currentLocation, searchRadius);
      
      // Find significant price differences
      expandedPrices.forEach(station => {
        const localAverage = this.getLocalAveragePrice(currentLocation, 10); // 10km local average
        const priceDifference = localAverage - station.price;
        const detourCost = this.calculateDetourCost(currentLocation, station.location);
        const netSavings = priceDifference - detourCost;
        
        if (netSavings > this.savingsThreshold && priceDifference / localAverage > 0.05) {
          opportunities.push({
            station: station,
            localAveragePrice: localAverage,
            stationPrice: station.price,
            priceDifference: priceDifference,
            detourDistance: this.calculateDistance(currentLocation, station.location),
            detourCost: detourCost,
            netSavings: netSavings,
            savingsPercent: netSavings / localAverage,
            worthwhileFor: this.calculateMinimumFuelAmount(netSavings, priceDifference)
          });
        }
      });
      
      // Sort by net savings
      opportunities.sort((a, b) => b.netSavings - a.netSavings);
      
      return {
        opportunitiesFound: opportunities.length,
        topOpportunities: opportunities.slice(0, 5),
        averageSavings: opportunities.length > 0 ? 
          opportunities.reduce((sum, opp) => sum + opp.savingsPercent, 0) / opportunities.length : 0
      };
      
    } catch (error) {
      console.error('❌ Arbitrage detection failed:', error);
      return { opportunitiesFound: 0, topOpportunities: [] };
    }
  }

  private async getPricesInRadius(location: any, radius: number): Promise<any[]> {
    // Generate demo price data for stations in radius
    const stations = [];
    const stationCount = Math.floor(Math.random() * 10) + 5; // 5-15 stations
    
    for (let i = 0; i < stationCount; i++) {
      stations.push({
        id: `arbitrage_station_${i}`,
        name: `Station ${i + 1}`,
        location: {
          lat: (location.lat || 44.4268) + (Math.random() - 0.5) * 0.5,
          lng: (location.lng || 26.1025) + (Math.random() - 0.5) * 0.5
        },
        price: 1.35 + Math.random() * 0.3, // 1.35-1.65 EUR range
        brand: ['Shell', 'BP', 'Total', 'OMV', 'Petrom'][Math.floor(Math.random() * 5)]
      });
    }
    
    return stations;
  }

  private getLocalAveragePrice(location: any, radius: number): number {
    return 1.45 + (Math.random() - 0.5) * 0.1; // Local average with small variation
  }

  private calculateDistance(loc1: any, loc2: any): number {
    // Simplified distance calculation
    const lat1 = loc1.lat || 44.4268;
    const lng1 = loc1.lng || 26.1025;
    const lat2 = loc2.lat || 44.4268;
    const lng2 = loc2.lng || 26.1025;
    
    const deltaLat = lat2 - lat1;
    const deltaLng = lng2 - lng1;
    
    return Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng) * 111; // Rough km conversion
  }

  private calculateMinimumFuelAmount(netSavings: number, priceDifference: number): number {
    // Minimum fuel amount to make detour worthwhile
    return Math.ceil(10 / netSavings); // At least 10 EUR savings needed
  }

  async detectSupplyChainDisruptions(): Promise<any> {
    const disruptions = [];
    
    try {
      // Monitor news APIs pentru supply chain issues (simulated)
      const newsData = await this.getSupplyChainNews();
      
      // Analyze price volatility spikes
      const volatilitySpikes = this.detectVolatilitySpikes();
      
      // Check regional supply disparities
      const supplyDisparities = await this.checkRegionalSupplyDisparities();
      
      // Combine indicators
      if (newsData.disruptionMentions > 5) {
        disruptions.push({
          type: 'news_indicator',
          severity: 'medium',
          description: 'Multiple supply chain disruption mentions in news'
        });
      }
      
      if (volatilitySpikes.detected) {
        disruptions.push({
          type: 'price_volatility',
          severity: volatilitySpikes.severity,
          description: 'Unusual price volatility detected'
        });
      }
      
      return {
        disruptionsDetected: disruptions.length > 0,
        disruptions: disruptions,
        riskLevel: this.calculateSupplyRiskLevel(disruptions),
        recommendations: this.generateSupplyRiskRecommendations(disruptions)
      };
      
    } catch (error) {
      console.error('❌ Supply chain disruption detection failed:', error);
      return { disruptionsDetected: false, disruptions: [], riskLevel: 'unknown' };
    }
  }

  private async getSupplyChainNews(): Promise<any> {
    // Simulate news analysis
    return {
      disruptionMentions: Math.floor(Math.random() * 10),
      sentimentScore: Math.random() * 2 - 1, // -1 to 1
      keyTerms: ['refinery', 'pipeline', 'transportation', 'shortage']
    };
  }

  private detectVolatilitySpikes(): any {
    // Analyze recent price history for volatility
    const recentPrices = this.priceHistory.slice(-7); // Last 7 days
    
    if (recentPrices.length < 5) {
      return { detected: false, severity: 'low' };
    }
    
    const volatilities = recentPrices.map(p => p.volatility || 0);
    const avgVolatility = volatilities.reduce((sum, v) => sum + v, 0) / volatilities.length;
    
    const isSpike = avgVolatility > this.supplyChainMonitor?.priceVolatilityThreshold || 0.1;
    
    return {
      detected: isSpike,
      severity: avgVolatility > 0.15 ? 'high' : avgVolatility > 0.1 ? 'medium' : 'low',
      volatility: avgVolatility
    };
  }

  private async checkRegionalSupplyDisparities(): Promise<any> {
    // Simulate regional supply analysis
    return {
      detected: Math.random() > 0.8, // 20% chance
      regions: ['București', 'Cluj', 'Timișoara'],
      disparities: Math.random() * 0.2 // Up to 20% price difference
    };
  }

  private calculateSupplyRiskLevel(disruptions: any[]): string {
    if (disruptions.length === 0) return 'low';
    
    const severities = disruptions.map(d => d.severity);
    const hasHigh = severities.includes('high');
    const hasMedium = severities.includes('medium');
    
    if (hasHigh) return 'high';
    if (hasMedium || disruptions.length > 2) return 'medium';
    return 'low';
  }

  private generateSupplyRiskRecommendations(disruptions: any[]): string[] {
    const recommendations = [];
    
    if (disruptions.length > 0) {
      recommendations.push('Consider purchasing additional fuel reserves');
      recommendations.push('Monitor regional price variations closely');
      recommendations.push('Diversify fuel supplier relationships');
    }
    
    if (disruptions.some(d => d.severity === 'high')) {
      recommendations.push('Implement emergency fuel procurement protocol');
      recommendations.push('Consider alternative transportation routes');
    }
    
    return recommendations;
  }

  // === ACCURACY TRACKING ===

  async trackPriceAccuracy(predictionId: string, actualPrice: number): Promise<number | null> {
    // Track prediction accuracy pentru model improvement
    const prediction = await this.getPricePrediction(predictionId);
    
    if (prediction) {
      const accuracy = 1 - Math.abs(prediction.predictedPrice - actualPrice) / prediction.predictedPrice;
      
      // Update accuracy metrics
      this.priceAccuracy = (this.priceAccuracy * 0.9) + (accuracy * 0.1); // Moving average
      
      // Store accuracy data
      await this.storePriceAccuracyData({
        predictionId: predictionId,
        predicted: prediction.predictedPrice,
        actual: actualPrice,
        accuracy: accuracy,
        date: new Date(),
        marketConditions: prediction.marketConditions
      });
      
      console.log(`📊 Price prediction accuracy: ${(accuracy * 100).toFixed(1)}%`);
      
      return accuracy;
    }
    
    return null;
  }

  private async getPricePrediction(predictionId: string): Promise<any> {
    // Simulate prediction retrieval
    return {
      id: predictionId,
      predictedPrice: 1.45 + (Math.random() - 0.5) * 0.1,
      marketConditions: 'stable',
      confidence: 0.8
    };
  }

  private async storePriceAccuracyData(data: any): Promise<void> {
    // In production, this would store to database
    console.log('📈 Storing price accuracy data:', data);
  }
} 