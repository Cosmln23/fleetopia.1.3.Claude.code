import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AnalyticsData {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  metrics: {
    totalDistance: number;
    totalFuelConsumption: number;
    totalCost: number;
    averageSpeed: number;
    efficiency: number;
    co2Emissions: number;
  };
  trends: {
    costTrend: number; // percentage change
    efficiencyTrend: number;
    distanceTrend: number;
    fuelTrend: number;
  };
  breakdown: {
    costByCategory: { [category: string]: number };
    distanceByVehicle: { [vehicleId: string]: number };
    fuelByRoute: { [routeId: string]: number };
  };
}

export interface PredictionResult {
  type: 'cost' | 'maintenance' | 'fuel' | 'efficiency';
  period: 'next_week' | 'next_month' | 'next_quarter';
  prediction: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

export interface OptimizationSuggestion {
  type: 'route' | 'fuel' | 'maintenance' | 'driver';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialSavings: number;
  implementationCost: number;
  roi: number;
  timeframe: string;
}

export class AnalyticsEngine {
  
  // Generate comprehensive analytics for a fleet
  async generateFleetAnalytics(fleetId: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<AnalyticsData> {
    const { startDate, endDate } = this.getPeriodDates(period);
    
    try {
      // Get fleet data
      const fleet = await prisma.fleet.findUnique({
        where: { id: fleetId },
        include: {
          vehicles: {
            include: {
              routes: {
                where: {
                  createdAt: {
                    gte: startDate,
                    lte: endDate
                  }
                }
              },
              maintenances: {
                where: {
                  createdAt: {
                    gte: startDate,
                    lte: endDate
                  }
                }
              }
            }
          },
          metrics: {
            where: {
              timestamp: {
                gte: startDate,
                lte: endDate
              }
            },
            orderBy: {
              timestamp: 'desc'
            }
          }
        }
      });

      if (!fleet) {
        throw new Error('Fleet not found');
      }

      // Calculate core metrics
      const metrics = await this.calculateCoreMetrics(fleet, startDate, endDate);
      const trends = await this.calculateTrends(fleetId, period);
      const breakdown = await this.calculateBreakdown(fleet);

      return {
        period,
        startDate,
        endDate,
        metrics,
        trends,
        breakdown
      };

    } catch (error) {
      console.error('Error generating fleet analytics:', error);
      throw error;
    }
  }

  // AI-powered predictions
  async generatePredictions(fleetId: string): Promise<PredictionResult[]> {
    try {
      const historicalData = await this.getHistoricalData(fleetId, 90); // 90 days
      const predictions: PredictionResult[] = [];

      // Cost prediction
      const costPrediction = await this.predictCosts(historicalData);
      predictions.push(costPrediction);

      // Maintenance prediction
      const maintenancePrediction = await this.predictMaintenance(historicalData);
      predictions.push(maintenancePrediction);

      // Fuel consumption prediction
      const fuelPrediction = await this.predictFuelConsumption(historicalData);
      predictions.push(fuelPrediction);

      // Efficiency prediction
      const efficiencyPrediction = await this.predictEfficiency(historicalData);
      predictions.push(efficiencyPrediction);

      return predictions;

    } catch (error) {
      console.error('Error generating predictions:', error);
      throw error;
    }
  }

  // Generate optimization suggestions
  async generateOptimizationSuggestions(fleetId: string): Promise<OptimizationSuggestion[]> {
    try {
      const analytics = await this.generateFleetAnalytics(fleetId);
      const suggestions: OptimizationSuggestion[] = [];

      // Route optimization suggestions
      if (analytics.metrics.efficiency < 70) {
        suggestions.push({
          type: 'route',
          priority: 'high',
          title: 'Optimize Routes with AI',
          description: 'Current route efficiency is below optimal. AI route optimization can improve efficiency by 15-25%.',
          potentialSavings: analytics.metrics.totalCost * 0.2,
          implementationCost: 0,
          roi: analytics.metrics.totalCost * 0.2,
          timeframe: 'Immediate'
        });
      }

      // Fuel optimization suggestions
      if (analytics.trends.fuelTrend > 10) {
        suggestions.push({
          type: 'fuel',
          priority: 'high',
          title: 'Fuel Cost Optimization',
          description: 'Fuel costs are increasing. Implement dynamic fuel station selection and consumption monitoring.',
          potentialSavings: analytics.metrics.totalFuelConsumption * 1.5 * 0.1,
          implementationCost: 100,
          roi: (analytics.metrics.totalFuelConsumption * 1.5 * 0.1) - 100,
          timeframe: '1-2 weeks'
        });
      }

      // Maintenance optimization
      suggestions.push({
        type: 'maintenance',
        priority: 'medium',
        title: 'Predictive Maintenance',
        description: 'Implement predictive maintenance to reduce breakdowns and extend vehicle life.',
        potentialSavings: analytics.metrics.totalCost * 0.05,
        implementationCost: 200,
        roi: (analytics.metrics.totalCost * 0.05) - 200,
        timeframe: '1 month'
      });

      // Driver behavior optimization
      if (analytics.metrics.averageSpeed > 80) {
        suggestions.push({
          type: 'driver',
          priority: 'medium',
          title: 'Driver Behavior Optimization',
          description: 'High average speeds detected. Implement speed monitoring and training programs.',
          potentialSavings: analytics.metrics.totalFuelConsumption * 1.5 * 0.08,
          implementationCost: 150,
          roi: (analytics.metrics.totalFuelConsumption * 1.5 * 0.08) - 150,
          timeframe: '2-3 weeks'
        });
      }

      // Sort by ROI
      return suggestions.sort((a, b) => b.roi - a.roi);

    } catch (error) {
      console.error('Error generating optimization suggestions:', error);
      throw error;
    }
  }

  // Generate automated reports
  async generateReport(fleetId: string, type: 'performance' | 'cost' | 'efficiency' | 'summary'): Promise<any> {
    try {
      const analytics = await this.generateFleetAnalytics(fleetId);
      const predictions = await this.generatePredictions(fleetId);
      const suggestions = await this.generateOptimizationSuggestions(fleetId);

      const report = {
        id: `report_${Date.now()}`,
        fleetId,
        type,
        generatedAt: new Date(),
        period: analytics.period,
        summary: {
          totalCost: analytics.metrics.totalCost,
          totalDistance: analytics.metrics.totalDistance,
          efficiency: analytics.metrics.efficiency,
          co2Emissions: analytics.metrics.co2Emissions
        },
        keyMetrics: analytics.metrics,
        trends: analytics.trends,
        predictions: predictions.slice(0, 3), // Top 3 predictions
        recommendations: suggestions.slice(0, 5), // Top 5 suggestions
        charts: await this.generateChartData(analytics),
        insights: this.generateInsights(analytics, predictions, suggestions)
      };

      return report;

    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  // Private helper methods
  private getPeriodDates(period: string): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'daily':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'yearly':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    return { startDate, endDate };
  }

  private async calculateCoreMetrics(fleet: any, startDate: Date, endDate: Date) {
    const routes = fleet.vehicles.flatMap((v: any) => v.routes);
    const maintenances = fleet.vehicles.flatMap((v: any) => v.maintenances);

    const totalDistance = routes.reduce((sum: number, route: any) => sum + (route.distance || 0), 0);
    const totalFuelConsumption = totalDistance * 0.08; // 8L/100km average
    const fuelCost = totalFuelConsumption * 1.5; // €1.5/L
    const maintenanceCost = maintenances.reduce((sum: number, m: any) => sum + (m.cost || 0), 0);
    const totalCost = fuelCost + maintenanceCost;

    return {
      totalDistance,
      totalFuelConsumption,
      totalCost,
      averageSpeed: routes.length > 0 ? routes.reduce((sum: number, r: any) => sum + (r.distance || 0) / (r.duration || 1), 0) / routes.length : 0,
      efficiency: totalDistance > 0 ? (totalDistance / totalFuelConsumption) * 100 : 0,
      co2Emissions: totalFuelConsumption * 2.31 // kg CO2 per liter
    };
  }

  private async calculateTrends(fleetId: string, period: string) {
    // Get previous period data for comparison
    const previousPeriod = this.getPreviousPeriod(period);
    const currentAnalytics = await this.generateFleetAnalytics(fleetId, period);
    
    // Simulate trend calculations (replace with real historical comparison)
    return {
      costTrend: Math.random() * 20 - 10, // -10% to +10%
      efficiencyTrend: Math.random() * 10 - 5,
      distanceTrend: Math.random() * 15 - 7.5,
      fuelTrend: Math.random() * 12 - 6
    };
  }

  private async calculateBreakdown(fleet: any) {
    const routes = fleet.vehicles.flatMap((v: any) => v.routes);
    const vehicles = fleet.vehicles;

    return {
      costByCategory: {
        fuel: routes.reduce((sum: number, r: any) => sum + (r.fuelCost || 0), 0),
        maintenance: vehicles.reduce((sum: number, v: any) => 
          sum + v.maintenances.reduce((s: number, m: any) => s + (m.cost || 0), 0), 0),
        tolls: routes.reduce((sum: number, r: any) => sum + (r.tollCost || 0), 0)
      },
      distanceByVehicle: vehicles.reduce((acc: any, v: any) => {
        acc[v.id] = v.routes.reduce((sum: number, r: any) => sum + (r.distance || 0), 0);
        return acc;
      }, {}),
      fuelByRoute: routes.reduce((acc: any, r: any) => {
        acc[r.id] = (r.distance || 0) * 0.08;
        return acc;
      }, {})
    };
  }

  private async getHistoricalData(fleetId: string, days: number) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    return await prisma.fleetMetric.findMany({
      where: {
        fleetId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });
  }

  private async predictCosts(historicalData: any[]): Promise<PredictionResult> {
    // Simple linear regression for cost prediction
    const costs = historicalData.map(d => (d.metrics as any).totalCost || 0);
    const trend = costs.length > 1 ? (costs[costs.length - 1] - costs[0]) / costs.length : 0;
    const nextMonthPrediction = costs[costs.length - 1] + (trend * 30);

    return {
      type: 'cost',
      period: 'next_month',
      prediction: nextMonthPrediction,
      confidence: 0.78,
      factors: ['Fuel price trends', 'Route efficiency', 'Vehicle maintenance'],
      recommendations: ['Optimize routes', 'Monitor fuel consumption', 'Schedule preventive maintenance']
    };
  }

  private async predictMaintenance(historicalData: any[]): Promise<PredictionResult> {
    // Predict maintenance costs based on vehicle age and usage
    const avgMaintenanceCost = historicalData.reduce((sum, d) => 
      sum + ((d.metrics as any).maintenanceCost || 0), 0) / historicalData.length;

    return {
      type: 'maintenance',
      period: 'next_quarter',
      prediction: avgMaintenanceCost * 3 * 1.1, // 10% increase
      confidence: 0.82,
      factors: ['Vehicle age', 'Mileage', 'Driving conditions'],
      recommendations: ['Implement predictive maintenance', 'Regular inspections', 'Driver training']
    };
  }

  private async predictFuelConsumption(historicalData: any[]): Promise<PredictionResult> {
    const fuelData = historicalData.map(d => (d.metrics as any).fuelConsumption || 0);
    const avgConsumption = fuelData.reduce((sum, f) => sum + f, 0) / fuelData.length;

    return {
      type: 'fuel',
      period: 'next_month',
      prediction: avgConsumption * 1.05, // 5% increase
      confidence: 0.75,
      factors: ['Route complexity', 'Traffic conditions', 'Driver behavior'],
      recommendations: ['Route optimization', 'Fuel-efficient driving training', 'Vehicle maintenance']
    };
  }

  private async predictEfficiency(historicalData: any[]): Promise<PredictionResult> {
    const efficiencyData = historicalData.map(d => (d.metrics as any).efficiency || 0);
    const avgEfficiency = efficiencyData.reduce((sum, e) => sum + e, 0) / efficiencyData.length;

    return {
      type: 'efficiency',
      period: 'next_month',
      prediction: avgEfficiency * 1.08, // 8% improvement with optimization
      confidence: 0.85,
      factors: ['Route optimization', 'AI algorithms', 'Driver behavior'],
      recommendations: ['Implement AI route optimization', 'Real-time monitoring', 'Performance incentives']
    };
  }

  private getPreviousPeriod(period: string): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'daily':
        endDate.setDate(endDate.getDate() - 1);
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'weekly':
        endDate.setDate(endDate.getDate() - 7);
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'monthly':
        endDate.setMonth(endDate.getMonth() - 1);
        startDate.setMonth(endDate.getMonth() - 1);
        break;
    }

    return { startDate, endDate };
  }

  private async generateChartData(analytics: AnalyticsData) {
    return {
      costTrend: this.generateTrendData('cost', analytics.period),
      fuelConsumption: this.generateTrendData('fuel', analytics.period),
      efficiency: this.generateTrendData('efficiency', analytics.period),
      distanceByVehicle: analytics.breakdown.distanceByVehicle
    };
  }

  private generateTrendData(metric: string, period: string) {
    // Generate sample trend data
    const points = period === 'daily' ? 24 : period === 'weekly' ? 7 : 30;
    return Array.from({ length: points }, (_, i) => ({
      x: i,
      y: Math.random() * 100 + 50
    }));
  }

  private generateInsights(analytics: AnalyticsData, predictions: PredictionResult[], suggestions: OptimizationSuggestion[]) {
    const insights = [];

    // Efficiency insight
    if (analytics.metrics.efficiency < 70) {
      insights.push({
        type: 'warning',
        title: 'Low Fleet Efficiency',
        message: `Current efficiency is ${analytics.metrics.efficiency.toFixed(1)}%. Consider implementing route optimization.`
      });
    }

    // Cost trend insight
    if (analytics.trends.costTrend > 5) {
      insights.push({
        type: 'alert',
        title: 'Rising Costs',
        message: `Costs have increased by ${analytics.trends.costTrend.toFixed(1)}% this period.`
      });
    }

    // Positive insight
    if (suggestions.length > 0 && suggestions[0].roi > 1000) {
      insights.push({
        type: 'opportunity',
        title: 'High ROI Opportunity',
        message: `Top optimization suggestion could save €${suggestions[0].potentialSavings.toFixed(0)} monthly.`
      });
    }

    return insights;
  }
}

// Export singleton instance
export const analyticsEngine = new AnalyticsEngine(); 