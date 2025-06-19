'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  CheckCircle, 
  TrendingUp, 
  MapPin, 
  Fuel, 
  Euro,
  Clock,
  Shield,
  Target,
  X
} from 'lucide-react';

interface AIDecisionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  decision: {
    cargoTitle: string;
    recommendedVehicle: string;
    confidence: number;
    estimatedProfit: number;
    analysisFactors: {
      distance: number;
      fuelCost: number;
      tollCost: number;
      driverExperience: number;
      vehicleEfficiency: number;
      routeOptimality: number;
    };
    reasoning: string[];
    risks: string[];
  } | null;
}

export function AIDecisionPopup({ isOpen, onClose, decision }: AIDecisionPopupProps) {
  if (!decision) return null;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-500 bg-green-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-500 bg-red-100';
  };

  const getFactorIcon = (factor: string) => {
    switch (factor) {
      case 'distance': return <MapPin className="w-4 h-4" />;
      case 'fuelCost': return <Fuel className="w-4 h-4" />;
      case 'tollCost': return <Euro className="w-4 h-4" />;
      case 'driverExperience': return <Shield className="w-4 h-4" />;
      case 'vehicleEfficiency': return <TrendingUp className="w-4 h-4" />;
      case 'routeOptimality': return <Target className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const formatFactorName = (factor: string) => {
    switch (factor) {
      case 'distance': return 'Distance Optimization';
      case 'fuelCost': return 'Fuel Cost Analysis';
      case 'tollCost': return 'Toll Efficiency';
      case 'driverExperience': return 'Driver Experience';
      case 'vehicleEfficiency': return 'Vehicle Efficiency';
      case 'routeOptimality': return 'Route Optimality';
      default: return factor;
    }
  };

  const getFactorScore = (factor: string) => {
    return decision.analysisFactors[factor as keyof typeof decision.analysisFactors] || 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <DialogTitle className="text-xl text-white">
                  🧠 AI Decision Analysis
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  How the AI made this recommendation
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Decision Summary */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">Decision Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400">Recommended Vehicle</p>
                <p className="font-medium text-white">{decision.recommendedVehicle}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Estimated Profit</p>
                <p className="font-medium text-green-400">€{decision.estimatedProfit.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">AI Confidence</span>
                <Badge className={`${getConfidenceColor(decision.confidence)} font-medium`}>
                  {decision.confidence}%
                </Badge>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${decision.confidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* Analysis Factors */}
          <div>
            <h3 className="font-semibold text-white mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-400" />
              Key Analysis Factors
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(decision.analysisFactors).map((factor) => {
                const score = getFactorScore(factor);
                return (
                  <div key={factor} className="bg-slate-800/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getFactorIcon(factor)}
                        <span className="text-sm text-slate-300">{formatFactorName(factor)}</span>
                      </div>
                      <span className="text-sm font-medium text-white">{score}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          score >= 80 ? 'bg-green-500' : 
                          score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Reasoning */}
          <div>
            <h3 className="font-semibold text-white mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              Why This Decision
            </h3>
            <div className="space-y-2">
              {decision.reasoning.map((reason, index) => (
                <div key={index} className="flex items-start space-x-3 p-2 bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-300">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Risks & Considerations */}
          {decision.risks.length > 0 && (
            <div>
              <h3 className="font-semibold text-white mb-3 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-yellow-400" />
                Risks & Considerations
              </h3>
              <div className="space-y-2">
                {decision.risks.map((risk, index) => (
                  <div key={index} className="flex items-start space-x-3 p-2 bg-yellow-900/20 rounded-lg">
                    <Shield className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-300">{risk}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              <span>Analysis completed in 1.2s</span>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} size="sm">
                Close
              </Button>
              <Button className="bg-green-600 hover:bg-green-700" size="sm">
                Accept Recommendation
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
