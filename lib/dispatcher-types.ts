export interface DispatcherSuggestion {
  id: string;
  cargoOfferId: string;
  vehicleId: string;
  vehicleName: string;
  vehicleLicensePlate: string;
  title: string;
  estimatedProfit: number;
  estimatedDistance: number;
  estimatedDuration: number;
  confidence: number;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DispatcherAnalysis {
  availableVehicles: number;
  newOffers: number;
  todayProfit: number;
  suggestions: DispatcherSuggestion[];
  alerts: string[];
}