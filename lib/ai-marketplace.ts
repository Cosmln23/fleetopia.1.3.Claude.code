
import { BaseAIAgent, AgentTemplate, MarketplaceAgent, RevenueDistribution } from './types';

export class AIMarketplace {
  private agents: Map<string, MarketplaceAgent> = new Map();
  private revenuePool: number = 0;

  constructor() {
    this.initializeDefaultAgents();
  }

  // Register a new AI agent in the marketplace
  registerAgent(template: AgentTemplate, owner: string): MarketplaceAgent {
    const agent: MarketplaceAgent = {
      id: this.generateId(),
      name: template.name,
      type: template.type,
      version: '1.0.0',
      status: 'active',
      performance: 0,
      revenue: 0,
      requests: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      template,
      owner,
      downloads: 0,
      rating: 5.0,
      reviews: []
    };

    this.agents.set(agent.id, agent);
    return agent;
  }

  // Distribute revenue according to the 40-35-15-10 model
  distributeRevenue(totalRevenue: number): RevenueDistribution {
    const distribution: RevenueDistribution = {
      core: totalRevenue * 0.40,      // 40% to Core Platform
      agents: totalRevenue * 0.35,    // 35% to AI Agents
      innovation: totalRevenue * 0.15, // 15% to Innovation Fund
      users: totalRevenue * 0.10      // 10% to Users/Rewards
    };

    this.revenuePool += distribution.core;
    this.distributeToAgents(distribution.agents);

    return distribution;
  }

  // Connect agents for collaborative processing
  connectAgents(agentIds: string[]): boolean {
    const agents = agentIds.map(id => this.agents.get(id)).filter(Boolean);
    
    if (agents.length < 2) {
      return false;
    }

    // Simulate agent connection and performance boost
    agents.forEach(agent => {
      if (agent) {
        agent.performance = Math.min(100, agent.performance + 5);
        agent.updatedAt = new Date().toISOString();
      }
    });

    return true;
  }

  // Validate agent performance and update metrics
  validatePerformance(agentId: string, metrics: { accuracy: number; speed: number; efficiency: number }): boolean {
    const agent = this.agents.get(agentId);
    if (!agent) return false;

    // Calculate overall performance score
    const performanceScore = (metrics.accuracy * 0.5 + metrics.speed * 0.3 + metrics.efficiency * 0.2);
    agent.performance = Math.round(performanceScore);
    agent.updatedAt = new Date().toISOString();

    // Update agent status based on performance
    if (performanceScore < 60) {
      agent.status = 'maintenance';
    } else if (performanceScore > 90) {
      agent.status = 'active';
    }

    return true;
  }

  // Get all active agents
  getActiveAgents(): MarketplaceAgent[] {
    return Array.from(this.agents.values()).filter(agent => agent.status === 'active');
  }

  // Get agent by ID
  getAgent(id: string): MarketplaceAgent | undefined {
    return this.agents.get(id);
  }

  // Get agents by type
  getAgentsByType(type: string): MarketplaceAgent[] {
    return Array.from(this.agents.values()).filter(agent => agent.type === type);
  }

  // Update agent revenue
  updateAgentRevenue(agentId: string, revenue: number): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.revenue += revenue;
      agent.requests += 1;
      agent.updatedAt = new Date().toISOString();
    }
  }

  private distributeToAgents(amount: number): void {
    const activeAgents = this.getActiveAgents();
    if (activeAgents.length === 0) return;

    const amountPerAgent = amount / activeAgents.length;
    activeAgents.forEach(agent => {
      agent.revenue += amountPerAgent;
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private initializeDefaultAgents(): void {
    const defaultTemplates: AgentTemplate[] = [
      {
        name: 'Fuel Optimizer',
        type: 'fuel-optimizer',
        description: 'Advanced AI agent that optimizes fuel consumption across your fleet using real-time data analysis and predictive algorithms.',
        capabilities: ['Real-time fuel monitoring', 'Route optimization', 'Driver behavior analysis', 'Predictive maintenance'],
        pricing: { basePrice: 99, commission: 15 },
        requirements: { minData: 100, updateFrequency: 'real-time' }
      },
      {
        name: 'Route Genius',
        type: 'route-genius',
        description: 'Intelligent routing system that calculates optimal paths considering traffic, weather, and delivery constraints.',
        capabilities: ['Dynamic route planning', 'Traffic analysis', 'Multi-stop optimization', 'Real-time rerouting'],
        pricing: { basePrice: 149, commission: 20 },
        requirements: { minData: 50, updateFrequency: 'hourly' }
      },
      {
        name: 'Weather Prophet',
        type: 'weather-prophet',
        description: 'Weather prediction and fleet adaptation system that helps optimize operations based on weather conditions.',
        capabilities: ['Weather forecasting', 'Risk assessment', 'Route adaptation', 'Maintenance scheduling'],
        pricing: { basePrice: 79, commission: 12 },
        requirements: { minData: 30, updateFrequency: 'daily' }
      }
    ];

    defaultTemplates.forEach(template => {
      this.registerAgent(template, 'fleetopia-core');
    });
  }
}

// Singleton instance
export const aiMarketplace = new AIMarketplace();
