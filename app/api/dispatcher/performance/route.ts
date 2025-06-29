/**
 * Dispatcher API - Performance Metrics Endpoint
 * REST API for performance analytics as specified in user's plan
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { matchingEngine } from '@/lib/algorithms/matching-engine';
import { scoringSystem } from '@/lib/algorithms/scoring-system';
import { marketplaceConnector } from '@/lib/connectors/marketplace-connector';
import { gpsFleetConnector } from '@/lib/connectors/gps-fleet-connector';
import { fleetManager } from '@/lib/algorithms/fleet-manager';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/dispatcher/performance - Get performance metrics
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'today'; // today, week, month
    const includeDetails = searchParams.get('includeDetails') === 'true';

    console.log(`📊 API: Getting performance metrics for timeframe: ${timeframe}`);

    // Get current data for analysis
    const [
      marketplaceStats,
      fleetStatus,
      fleetUtilization,
      recentMatches,
      assignments
    ] = await Promise.all([
      marketplaceConnector.getMarketplaceStats(),
      gpsFleetConnector.getFleetStatus(),
      fleetManager.getFleetUtilization(),
      matchingEngine.findBestMatches(20),
      getAssignmentStats(timeframe)
    ]);

    // Calculate performance metrics
    const performanceMetrics = {
      matching_efficiency: {
        total_matches_found: recentMatches.length,
        high_score_matches: recentMatches.filter(m => m.score > 80).length,
        average_match_score: recentMatches.length > 0 ? 
          recentMatches.reduce((sum, m) => sum + m.score, 0) / recentMatches.length : 0,
        success_rate: calculateSuccessRate(recentMatches),
        optimization_opportunities: recentMatches.filter(m => m.score < 60).length
      },
      
      profitability: {
        total_potential_profit: recentMatches.reduce((sum, m) => sum + m.estimatedProfit, 0),
        average_profit_per_route: recentMatches.length > 0 ?
          recentMatches.reduce((sum, m) => sum + m.estimatedProfit, 0) / recentMatches.length : 0,
        high_profit_routes: recentMatches.filter(m => m.estimatedProfit > 500).length,
        profit_margin_distribution: calculateProfitDistribution(recentMatches),
        roi_estimate: calculateROI(recentMatches)
      },

      fleet_performance: {
        utilization_rate: fleetUtilization.utilizationRate,
        active_vehicles: fleetStatus.activeVehicles,
        efficiency_score: calculateFleetEfficiencyScore(fleetStatus, fleetUtilization),
        average_distance_per_vehicle: fleetUtilization.averageDistance,
        fuel_efficiency_estimate: calculateFuelEfficiency(fleetStatus),
        maintenance_ratio: (fleetStatus.maintenanceVehicles / fleetStatus.totalVehicles) * 100
      },

      marketplace_performance: {
        total_cargo_available: marketplaceStats.activeCargo,
        urgent_cargo_count: marketplaceStats.urgentCargo,
        average_cargo_value: marketplaceStats.averagePrice,
        total_marketplace_value: marketplaceStats.totalValue,
        completion_rate: (marketplaceStats.completedCargo / marketplaceStats.totalCargo) * 100
      },

      operational_kpis: {
        assignment_success_rate: assignments.successRate,
        average_response_time: assignments.averageResponseTime,
        customer_satisfaction_estimate: calculateSatisfactionScore(recentMatches, assignments),
        cost_per_route: calculateAverageCostPerRoute(recentMatches),
        revenue_per_vehicle: calculateRevenuePerVehicle(recentMatches, fleetStatus.totalVehicles)
      }
    };

    // Build response
    const response: any = {
      status: 'success',
      timeframe,
      performance_metrics: performanceMetrics,
      summary: {
        overall_score: calculateOverallPerformanceScore(performanceMetrics),
        top_performers: getTopPerformers(recentMatches),
        improvement_areas: identifyImprovementAreas(performanceMetrics),
        recommendations: generatePerformanceRecommendations(performanceMetrics)
      },
      metadata: {
        generated_at: new Date().toISOString(),
        data_freshness: 'real-time',
        analysis_depth: includeDetails ? 'detailed' : 'summary'
      }
    };

    // Add detailed breakdown if requested
    if (includeDetails) {
      response.detailed_analysis = {
        route_performance: analyzeRoutePerformance(recentMatches),
        vehicle_utilization: analyzeVehicleUtilization(fleetUtilization),
        profit_optimization: analyzeProfitOptimization(recentMatches),
        risk_analysis: analyzeRiskFactors(recentMatches),
        seasonal_trends: 'N/A', // Would require historical data
        competitor_analysis: 'N/A' // Would require market data
      };
    }

    console.log(`✅ API: Performance metrics calculated (Score: ${response.summary.overall_score})`);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ API Error in performance metrics:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to get performance metrics',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions for performance calculations

async function getAssignmentStats(timeframe: string) {
  const now = new Date();
  let startDate: Date;

  switch (timeframe) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  try {
    const assignments = await prisma.assignment.findMany({
      where: {
        assignedAt: { gte: startDate }
      },
      include: {
        cargoOffer: true,
        vehicle: true
      }
    });

    const totalAssignments = assignments.length;
    const successfulAssignments = assignments.filter(a => a.status === 'completed').length;
    const avgResponseTime = 15; // Mock data - would calculate from real timestamps

    return {
      total: totalAssignments,
      successful: successfulAssignments,
      successRate: totalAssignments > 0 ? (successfulAssignments / totalAssignments) * 100 : 0,
      averageResponseTime: avgResponseTime
    };
  } catch (error) {
    console.warn('Could not get assignment stats:', error);
    return {
      total: 0,
      successful: 0,
      successRate: 0,
      averageResponseTime: 0
    };
  }
}

function calculateSuccessRate(matches: any[]): number {
  if (matches.length === 0) return 0;
  const highQualityMatches = matches.filter(m => m.score > 70).length;
  return (highQualityMatches / matches.length) * 100;
}

function calculateProfitDistribution(matches: any[]) {
  const profits = matches.map(m => m.estimatedProfit);
  return {
    low: profits.filter(p => p < 300).length,
    medium: profits.filter(p => p >= 300 && p < 600).length,
    high: profits.filter(p => p >= 600).length
  };
}

function calculateROI(matches: any[]): number {
  const totalRevenue = matches.reduce((sum, m) => sum + m.cargo.price, 0);
  const totalProfit = matches.reduce((sum, m) => sum + m.estimatedProfit, 0);
  
  if (totalRevenue === 0) return 0;
  return (totalProfit / totalRevenue) * 100;
}

function calculateFleetEfficiencyScore(fleetStatus: any, utilization: any): number {
  const utilizationScore = utilization.utilizationRate;
  const onlineScore = (fleetStatus.onlineVehicles / fleetStatus.totalVehicles) * 100;
  const maintenanceScore = 100 - ((fleetStatus.maintenanceVehicles / fleetStatus.totalVehicles) * 100);
  
  return (utilizationScore * 0.5) + (onlineScore * 0.3) + (maintenanceScore * 0.2);
}

function calculateFuelEfficiency(fleetStatus: any): number {
  // Mock calculation - would use real fuel consumption data
  return 7.2; // L/100km average
}

function calculateSatisfactionScore(matches: any[], assignments: any): number {
  // Estimate satisfaction based on match quality and assignment success
  const avgMatchScore = matches.length > 0 ? matches.reduce((sum, m) => sum + m.score, 0) / matches.length : 0;
  const assignmentSuccessRate = assignments.successRate;
  
  return (avgMatchScore * 0.6) + (assignmentSuccessRate * 0.4);
}

function calculateAverageCostPerRoute(matches: any[]): number {
  if (matches.length === 0) return 0;
  
  const totalCosts = matches.reduce((sum, m) => {
    const revenue = m.cargo.price;
    const profit = m.estimatedProfit;
    return sum + (revenue - profit);
  }, 0);
  
  return totalCosts / matches.length;
}

function calculateRevenuePerVehicle(matches: any[], totalVehicles: number): number {
  if (totalVehicles === 0) return 0;
  
  const totalRevenue = matches.reduce((sum, m) => sum + m.cargo.price, 0);
  return totalRevenue / totalVehicles;
}

function calculateOverallPerformanceScore(metrics: any): number {
  const matchingScore = metrics.matching_efficiency.average_match_score;
  const profitScore = Math.min(100, (metrics.profitability.average_profit_per_route / 10)); // Scale to 100
  const fleetScore = metrics.fleet_performance.efficiency_score;
  const operationalScore = metrics.operational_kpis.assignment_success_rate;
  
  return (matchingScore * 0.3) + (profitScore * 0.3) + (fleetScore * 0.25) + (operationalScore * 0.15);
}

function getTopPerformers(matches: any[]) {
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(match => ({
      route: `${match.cargo.fromCity} → ${match.cargo.toCity}`,
      vehicle: match.vehicle.name,
      score: match.score,
      profit: match.estimatedProfit
    }));
}

function identifyImprovementAreas(metrics: any): string[] {
  const areas: string[] = [];
  
  if (metrics.matching_efficiency.average_match_score < 70) {
    areas.push('Match quality needs improvement');
  }
  
  if (metrics.fleet_performance.utilization_rate < 70) {
    areas.push('Fleet utilization is below optimal');
  }
  
  if (metrics.profitability.average_profit_per_route < 400) {
    areas.push('Route profitability could be improved');
  }
  
  if (metrics.operational_kpis.assignment_success_rate < 85) {
    areas.push('Assignment process needs optimization');
  }
  
  return areas;
}

function generatePerformanceRecommendations(metrics: any): string[] {
  const recommendations: string[] = [];
  
  if (metrics.fleet_performance.utilization_rate < 75) {
    recommendations.push('Increase fleet utilization by accepting more cargo or optimizing routes');
  }
  
  if (metrics.matching_efficiency.average_match_score < 75) {
    recommendations.push('Review matching algorithm parameters for better cargo-vehicle pairing');
  }
  
  if (metrics.profitability.high_profit_routes < metrics.profitability.total_potential_profit * 0.3) {
    recommendations.push('Focus on higher-margin routes to improve profitability');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Performance is within acceptable ranges - maintain current operations');
  }
  
  return recommendations;
}

function analyzeRoutePerformance(matches: any[]) {
  return {
    most_profitable_routes: matches
      .sort((a, b) => b.estimatedProfit - a.estimatedProfit)
      .slice(0, 5)
      .map(m => ({ route: `${m.cargo.fromCity} → ${m.cargo.toCity}`, profit: m.estimatedProfit })),
    least_profitable_routes: matches
      .sort((a, b) => a.estimatedProfit - b.estimatedProfit)
      .slice(0, 5)
      .map(m => ({ route: `${m.cargo.fromCity} → ${m.cargo.toCity}`, profit: m.estimatedProfit })),
    average_distance: matches.reduce((sum, m) => sum + m.cargoAnalysis.distanceKm, 0) / matches.length
  };
}

function analyzeVehicleUtilization(utilization: any) {
  return {
    top_performers: utilization.topPerformers.map(v => ({
      vehicle: v.name,
      status: v.status,
      utilization_score: 'N/A' // Would calculate from real data
    })),
    underutilized: utilization.underutilized.map(v => ({
      vehicle: v.name,
      status: v.status,
      improvement_potential: 'N/A' // Would calculate from real data
    }))
  };
}

function analyzeProfitOptimization(matches: any[]) {
  const profits = matches.map(m => m.estimatedProfit);
  const avgProfit = profits.reduce((a, b) => a + b, 0) / profits.length;
  
  return {
    current_average: avgProfit,
    optimization_potential: Math.max(...profits) - avgProfit,
    underperforming_routes: matches.filter(m => m.estimatedProfit < avgProfit * 0.8).length
  };
}

function analyzeRiskFactors(matches: any[]) {
  return {
    high_risk_routes: matches.filter(m => m.riskLevel === 'high').length,
    risk_distribution: {
      low: matches.filter(m => m.riskLevel === 'low').length,
      medium: matches.filter(m => m.riskLevel === 'medium').length,
      high: matches.filter(m => m.riskLevel === 'high').length
    },
    primary_risk_factors: ['Distance', 'Cargo type', 'Deadline pressure', 'Vehicle availability']
  };
}