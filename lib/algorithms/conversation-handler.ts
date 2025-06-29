/**
 * Conversation Handler
 * Intelligent processing of user queries and intent detection
 * Follows the user's specific plan for conversation processing (in English)
 */

import { matchingEngine, CargoVehicleMatch } from '@/lib/algorithms/matching-engine';
import { responseGenerator } from '@/lib/algorithms/response-generator';
import { marketplaceConnector } from '@/lib/connectors/marketplace-connector';
import { gpsFleetConnector } from '@/lib/connectors/gps-fleet-connector';
import { fleetManager } from '@/lib/algorithms/fleet-manager';

export interface ConversationResponse {
  intent: string;
  message: string;
  data?: any;
  suggestions?: any[];
  confidence: number;
  executionTime: number;
}

export interface UserIntent {
  type: string;
  entities: ExtractedEntities;
  confidence: number;
}

export interface ExtractedEntities {
  vehicleId?: string;
  cargoId?: string;
  location?: string;
  timeframe?: string;
  urgency?: string;
  vehicleType?: string;
}

class ConversationHandler {

  /**
   * Process user input as specified in user's plan
   */
  public async processUserInput(message: string): Promise<ConversationResponse> {
    const startTime = Date.now();
    
    try {
      console.log(`💬 Processing user input: "${message}"`);
      
      const intent = this.detectIntent(message);
      console.log(`🎯 Detected intent: ${intent.type} (confidence: ${intent.confidence}%)`);

      let response: ConversationResponse;

      switch (intent.type) {
        case 'get_suggestions':
          response = await this.getSuggestions(intent.entities);
          break;
        case 'vehicle_status':
          response = await this.getVehicleStatus(intent.entities);
          break;
        case 'cargo_details':
          response = await this.getCargoDetails(intent.entities);
          break;
        case 'route_optimization':
          response = await this.optimizeRoutes(intent.entities);
          break;
        case 'fleet_overview':
          response = await this.getFleetOverview(intent.entities);
          break;
        case 'urgent_cargo':
          response = await this.getUrgentCargo(intent.entities);
          break;
        case 'profit_analysis':
          response = await this.getProfitAnalysis(intent.entities);
          break;
        case 'daily_summary':
          response = await this.getDailySummary(intent.entities);
          break;
        default:
          response = await this.getDefaultResponse(message);
      }

      const executionTime = Date.now() - startTime;
      response.executionTime = executionTime;

      console.log(`✅ Response generated in ${executionTime}ms`);
      return response;

    } catch (error) {
      console.error('❌ Error processing user input:', error);
      
      return {
        intent: 'error',
        message: "I'm sorry, I encountered an error processing your request. Please try again or rephrase your question.",
        confidence: 0,
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Detect intent from user message as specified in user's plan
   */
  private detectIntent(message: string): UserIntent {
    const lowercaseMessage = message.toLowerCase();
    const entities = this.extractEntities(message);

    // Route suggestions patterns (from user's plan examples)
    if (this.matchesPatterns(lowercaseMessage, [
      'what routes', 'routes for today', 'suggestions', 'recommend',
      'find cargo', 'available cargo', 'what loads', 'any loads'
    ])) {
      return { type: 'get_suggestions', entities, confidence: 90 };
    }

    // Vehicle status patterns (from user's plan examples)
    if (this.matchesPatterns(lowercaseMessage, [
      'where is truck', 'vehicle location', 'truck status', 'where is vehicle',
      'truck', 'vehicle', 'driver status'
    ]) || entities.vehicleId) {
      return { type: 'vehicle_status', entities, confidence: 85 };
    }

    // Cargo details patterns
    if (this.matchesPatterns(lowercaseMessage, [
      'cargo details', 'load details', 'shipment info', 'cargo info',
      'tell me about cargo', 'load information'
    ]) || entities.cargoId) {
      return { type: 'cargo_details', entities, confidence: 85 };
    }

    // Route optimization patterns
    if (this.matchesPatterns(lowercaseMessage, [
      'optimize routes', 'best routes', 'optimize', 'efficiency',
      'improve routes', 'route planning'
    ])) {
      return { type: 'route_optimization', entities, confidence: 80 };
    }

    // Fleet overview patterns
    if (this.matchesPatterns(lowercaseMessage, [
      'fleet status', 'fleet overview', 'all vehicles', 'fleet summary',
      'how many trucks', 'vehicle count', 'fleet report'
    ])) {
      return { type: 'fleet_overview', entities, confidence: 85 };
    }

    // Urgent cargo patterns
    if (this.matchesPatterns(lowercaseMessage, [
      'urgent', 'emergency', 'asap', 'immediate', 'rush',
      'urgent cargo', 'urgent delivery', 'priority'
    ])) {
      return { type: 'urgent_cargo', entities, confidence: 90 };
    }

    // Profit analysis patterns
    if (this.matchesPatterns(lowercaseMessage, [
      'profit', 'money', 'revenue', 'earnings', 'financial',
      'profit analysis', 'how much money', 'profitability'
    ])) {
      return { type: 'profit_analysis', entities, confidence: 80 };
    }

    // Daily summary patterns
    if (this.matchesPatterns(lowercaseMessage, [
      'daily summary', 'today summary', 'daily report', 'how was today',
      'today stats', 'daily overview'
    ])) {
      return { type: 'daily_summary', entities, confidence: 85 };
    }

    return { type: 'general', entities, confidence: 50 };
  }

  /**
   * Extract entities from user message (vehicle IDs, cargo IDs, etc.)
   */
  private extractEntities(message: string): ExtractedEntities {
    const entities: ExtractedEntities = {};

    // Extract vehicle IDs (license plates like B-123-ABC, PH-456-DEF)
    const vehicleIdMatch = message.match(/([A-Z]{1,2}-\d{3}-[A-Z]{3})|([A-Z]{2}\d{4}[A-Z]{2})/gi);
    if (vehicleIdMatch) {
      entities.vehicleId = vehicleIdMatch[0];
    }

    // Extract cargo IDs (various formats)
    const cargoIdMatch = message.match(/(?:cargo|load|shipment)\s*[#:]?\s*([a-zA-Z0-9-]+)/gi);
    if (cargoIdMatch) {
      entities.cargoId = cargoIdMatch[0].replace(/(?:cargo|load|shipment)\s*[#:]?\s*/gi, '');
    }

    // Extract locations
    const locationMatch = message.match(/(?:from|to|in|at)\s+([a-zA-Z\s]+?)(?:\s|$|,|\.|!|\?)/gi);
    if (locationMatch) {
      entities.location = locationMatch[0].replace(/(?:from|to|in|at)\s+/gi, '').trim();
    }

    // Extract timeframes
    if (message.toLowerCase().includes('today')) entities.timeframe = 'today';
    else if (message.toLowerCase().includes('tomorrow')) entities.timeframe = 'tomorrow';
    else if (message.toLowerCase().includes('week')) entities.timeframe = 'week';

    // Extract urgency
    if (message.toLowerCase().includes('urgent')) entities.urgency = 'high';
    else if (message.toLowerCase().includes('asap')) entities.urgency = 'high';
    else if (message.toLowerCase().includes('rush')) entities.urgency = 'high';

    // Extract vehicle types
    if (message.toLowerCase().includes('truck')) entities.vehicleType = 'TRUCK';
    else if (message.toLowerCase().includes('van')) entities.vehicleType = 'VAN';
    else if (message.toLowerCase().includes('semi')) entities.vehicleType = 'SEMI';

    return entities;
  }

  // Intent handler methods

  private async getSuggestions(entities: ExtractedEntities): Promise<ConversationResponse> {
    console.log('🔍 Getting route suggestions...');
    
    const options = {
      urgencyOnly: entities.urgency === 'high',
      vehicleType: entities.vehicleType as any,
      maxDistance: entities.urgency === 'high' ? 150 : 100
    };

    const matches = await matchingEngine.findBestMatches(5, options);
    const responseData = responseGenerator.generateSuggestions(matches);

    return {
      intent: 'get_suggestions',
      message: responseData.message,
      data: responseData,
      suggestions: responseData.suggestions,
      confidence: 90
    };
  }

  private async getVehicleStatus(entities: ExtractedEntities): Promise<ConversationResponse> {
    console.log(`🚛 Getting vehicle status for: ${entities.vehicleId || 'all vehicles'}`);

    if (entities.vehicleId) {
      // Get specific vehicle status
      const vehicle = await gpsFleetConnector.getVehicleStatus(entities.vehicleId);
      
      if (!vehicle) {
        return {
          intent: 'vehicle_status',
          message: `I couldn't find vehicle ${entities.vehicleId}. Please check the license plate and try again.`,
          confidence: 70
        };
      }

      // Find nearby cargo for this vehicle
      const nearbyMatches = await matchingEngine.findMatchesForVehicle(vehicle.id, 3);
      const message = responseGenerator.generateVehicleStatusResponse(vehicle, nearbyMatches);

      return {
        intent: 'vehicle_status',
        message,
        data: { vehicle, nearbyMatches },
        confidence: 95
      };
    } else {
      // Get fleet overview if no specific vehicle
      return this.getFleetOverview(entities);
    }
  }

  private async getCargoDetails(entities: ExtractedEntities): Promise<ConversationResponse> {
    console.log(`📦 Getting cargo details for: ${entities.cargoId || 'recent cargo'}`);

    if (entities.cargoId) {
      const cargo = await marketplaceConnector.getCargoDetails(entities.cargoId);
      
      if (!cargo) {
        return {
          intent: 'cargo_details',
          message: `I couldn't find cargo ${entities.cargoId}. Please check the cargo ID and try again.`,
          confidence: 70
        };
      }

      let message = `**Cargo Details: ${cargo.fromCity} → ${cargo.toCity}**\n\n`;
      message += `📦 Weight: ${cargo.weight}kg\n`;
      message += `🏷️ Type: ${cargo.cargoType}\n`;
      message += `💰 Price: €${cargo.price}\n`;
      message += `📅 Loading Date: ${new Date(cargo.loadingDate).toLocaleDateString()}\n`;
      message += `🚚 Delivery Date: ${new Date(cargo.deliveryDate).toLocaleDateString()}\n`;
      message += `🔥 Urgency: ${cargo.urgency}\n`;
      message += `📍 Status: ${cargo.status}\n`;

      if (cargo.requirements && cargo.requirements.length > 0) {
        message += `⚠️ Requirements: ${cargo.requirements.join(', ')}\n`;
      }

      return {
        intent: 'cargo_details',
        message,
        data: cargo,
        confidence: 95
      };
    } else {
      // Get recent cargo if no specific ID
      const recentCargo = await marketplaceConnector.getAvailableCargo({ status: 'active' });
      const topCargo = recentCargo.slice(0, 5);
      
      let message = `**Recent Available Cargo:**\n\n`;
      topCargo.forEach((cargo, index) => {
        message += `${index + 1}. ${cargo.fromCity} → ${cargo.toCity} (${cargo.weight}kg, €${cargo.price})\n`;
      });

      return {
        intent: 'cargo_details',
        message,
        data: topCargo,
        confidence: 80
      };
    }
  }

  private async optimizeRoutes(entities: ExtractedEntities): Promise<ConversationResponse> {
    console.log('⚙️ Optimizing routes...');

    const matches = await matchingEngine.findBestMatches(10);
    const optimizedMessage = responseGenerator.generateProfitAnalysis(matches);

    return {
      intent: 'route_optimization',
      message: `🚀 **Route Optimization Results**\n\n${optimizedMessage}\n\n**Optimization completed!** I've analyzed all available routes and prioritized them by profitability and efficiency.`,
      data: matches,
      confidence: 85
    };
  }

  private async getFleetOverview(entities: ExtractedEntities): Promise<ConversationResponse> {
    console.log('🚛 Getting fleet overview...');

    const fleetStatus = await gpsFleetConnector.getFleetStatus();
    const availableVehicles = await fleetManager.getAvailableVehicles();
    
    let message = `**🚛 Fleet Overview**\n\n`;
    message += `📊 Total Vehicles: ${fleetStatus.totalVehicles}\n`;
    message += `✅ Active Vehicles: ${fleetStatus.activeVehicles}\n`;
    message += `💤 Idle Vehicles: ${fleetStatus.idleVehicles}\n`;
    message += `🚛 In Transit: ${fleetStatus.inTransitVehicles}\n`;
    message += `🔧 In Maintenance: ${fleetStatus.maintenanceVehicles}\n`;
    message += `📡 GPS Online: ${fleetStatus.onlineVehicles}\n`;
    message += `📈 Average Speed: ${fleetStatus.averageSpeed} km/h\n`;
    message += `📏 Total Distance Today: ${fleetStatus.totalDistance} km\n\n`;

    if (availableVehicles.length > 0) {
      message += `**Available for Assignment:**\n`;
      availableVehicles.slice(0, 5).forEach((vehicle, index) => {
        message += `${index + 1}. ${vehicle.name} (${vehicle.licensePlate}) - ${vehicle.status}\n`;
      });
    }

    return {
      intent: 'fleet_overview',
      message,
      data: { fleetStatus, availableVehicles },
      confidence: 90
    };
  }

  private async getUrgentCargo(entities: ExtractedEntities): Promise<ConversationResponse> {
    console.log('🚨 Getting urgent cargo...');

    const urgentMatches = await matchingEngine.findUrgentMatches();
    const message = responseGenerator.generateUrgentAlert(urgentMatches);

    return {
      intent: 'urgent_cargo',
      message,
      data: urgentMatches,
      confidence: 95
    };
  }

  private async getProfitAnalysis(entities: ExtractedEntities): Promise<ConversationResponse> {
    console.log('💰 Getting profit analysis...');

    const matches = await matchingEngine.findBestMatches(15);
    const message = responseGenerator.generateProfitAnalysis(matches);

    return {
      intent: 'profit_analysis',
      message,
      data: matches,
      confidence: 85
    };
  }

  private async getDailySummary(entities: ExtractedEntities): Promise<ConversationResponse> {
    console.log('📊 Getting daily summary...');

    const matches = await matchingEngine.findBestMatches(20);
    const completedRoutes = 8; // This would come from real data
    const message = responseGenerator.generateDailySummary(matches, completedRoutes);

    return {
      intent: 'daily_summary',
      message,
      data: { matches, completedRoutes },
      confidence: 90
    };
  }

  private async getDefaultResponse(message: string): Promise<ConversationResponse> {
    const helpMessage = `I'm your AI Fleet Dispatcher! I can help you with:

🚛 **Route Suggestions**: "What routes do you have for today?"
📍 **Vehicle Status**: "Where is truck B-123-ABC?"
📦 **Cargo Details**: "Tell me about cargo #12345"
⚙️ **Route Optimization**: "Optimize my routes"
📊 **Fleet Overview**: "Show me fleet status"
🚨 **Urgent Cargo**: "Any urgent deliveries?"
💰 **Profit Analysis**: "Show me profit analysis"
📈 **Daily Summary**: "Give me today's summary"

Try asking me something like: "What profitable routes are available?" or "Where is my truck B-123-ABC?"`;

    return {
      intent: 'help',
      message: helpMessage,
      confidence: 60
    };
  }

  // Helper methods

  private matchesPatterns(message: string, patterns: string[]): boolean {
    return patterns.some(pattern => 
      message.includes(pattern.toLowerCase())
    );
  }

  /**
   * Get conversation context for better responses
   */
  public getContextualHelp(recentIntents: string[]): string {
    const frequentIntent = this.getMostFrequentIntent(recentIntents);
    
    switch (frequentIntent) {
      case 'vehicle_status':
        return "I notice you're asking about vehicles frequently. Try: 'Fleet overview' for all vehicles or 'Where is truck [license-plate]' for specific ones.";
      case 'get_suggestions':
        return "Looking for more routes? Try: 'Urgent cargo only' or 'High profit routes' for more targeted suggestions.";
      case 'profit_analysis':
        return "For detailed financial insights, try: 'Daily profit summary' or 'Route profitability analysis'.";
      default:
        return "I'm here to help with fleet management. Ask me about routes, vehicles, cargo, or profits!";
    }
  }

  private getMostFrequentIntent(intents: string[]): string {
    if (intents.length === 0) return 'general';
    
    const counts: Record<string, number> = {};
    intents.forEach(intent => {
      counts[intent] = (counts[intent] || 0) + 1;
    });
    
    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
  }
}

// Export singleton instance
export const conversationHandler = new ConversationHandler();

// Export for external use
export default conversationHandler;