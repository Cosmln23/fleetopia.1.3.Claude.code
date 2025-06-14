'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Bot, Zap, TrendingUp, Shield, Clock, Star, 
  CheckCircle, Award, Cpu, Database, Network,
  Target, BarChart3, Route, Fuel, Users, Settings,
  Brain, ArrowRight, Calendar, MapPin, Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RouteOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuy?: () => void;
}

export function RouteOptimizerModal({ isOpen, onClose, onBuy }: RouteOptimizerModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    RouteOptimizer Pro
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">v4.0.0</Badge>
                  </h2>
                  <p className="text-gray-400">Advanced AI-Powered Fleet Route Optimization & FuelMaster AI</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-white">4.9</span>
                      <span className="text-xs text-gray-400">(1,847 reviews)</span>
                    </div>
                    <Badge variant="outline" className="text-xs">Verified AI</Badge>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Best Seller</Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">€299</div>
                  <div className="text-sm text-gray-400">/month</div>
                </div>
                <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5 bg-gray-800">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="integration">Integration</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Hero Section */}
                <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500/30">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white flex items-center gap-2">
                      <Zap className="w-6 h-6 text-yellow-400" />
                      Revolutionary AI Fleet Optimization
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-300">
                      Transform your fleet operations with our cutting-edge AI that delivers 20-55% cost savings 
                      and 97-99% optimization accuracy through advanced vehicle-specific intelligence.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <TrendingUp className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">20-55% Cost Savings</h3>
                        <p className="text-gray-400">Reduce operational costs through intelligent optimization</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Target className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">97-99% Accuracy</h3>
                        <p className="text-gray-400">Industry-leading precision in route optimization</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Brain className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">FuelMaster AI</h3>
                        <p className="text-gray-400">±2% fuel consumption accuracy with smart analytics</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* What Makes It Special */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">What Makes RouteOptimizer Pro Revolutionary?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white">Vehicle-Specific Intelligence</h4>
                            <p className="text-sm text-gray-400">Optimizes routes for each vehicle type: trucks, vans, electric vehicles, motorcycles</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white">Ultra-Precise Fuel Calculations</h4>
                            <p className="text-sm text-gray-400">±2% accuracy with load impact, maintenance factors, seasonal adjustments</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white">Driver Personalization Engine</h4>
                            <p className="text-sm text-gray-400">Learns individual driver behaviors and optimizes accordingly</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white">Historical Learning System</h4>
                            <p className="text-sm text-gray-400">Continuously improves through pattern recognition and past performance</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white">Real-Time Adaptation</h4>
                            <p className="text-sm text-gray-400">Adjusts to traffic, weather, and changing conditions instantly</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white">Comprehensive Fleet Analytics</h4>
                            <p className="text-sm text-gray-400">Deep insights into fleet performance, costs, and optimization opportunities</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* vs Traditional Transport */}
                <Card className="bg-gradient-to-r from-red-900/30 to-green-900/30 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">RouteOptimizer Pro vs Traditional Transport Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-red-400 mb-3">❌ Traditional Systems</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li>• Manual route planning</li>
                          <li>• Generic fuel estimates (±15-20% error)</li>
                          <li>• No driver behavior consideration</li>
                          <li>• Static optimization rules</li>
                          <li>• Limited vehicle-specific optimization</li>
                          <li>• Reactive maintenance scheduling</li>
                          <li>• Basic cost tracking</li>
                          <li>• No learning from past routes</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-400 mb-3">✅ RouteOptimizer Pro</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li>• AI-powered intelligent route planning</li>
                          <li>• Ultra-precise fuel predictions (±2% accuracy)</li>
                          <li>• Individual driver personalization</li>
                          <li>• Adaptive ML algorithms</li>
                          <li>• Complete vehicle-specific optimization</li>
                          <li>• Predictive maintenance integration</li>
                          <li>• Comprehensive cost optimization</li>
                          <li>• Continuous learning and improvement</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* FuelMaster AI */}
                  <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Fuel className="w-5 h-5 text-blue-400" />
                        FuelMaster AI Engine
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">±2% Accuracy</Badge>
                        <p className="text-sm text-gray-300">Ultra-precise fuel consumption calculations</p>
                      </div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Load impact analysis (0.8x to 1.5x multiplier)</li>
                        <li>• Maintenance condition factors</li>
                        <li>• Seasonal adjustments (winter/summer)</li>
                        <li>• Real-time traffic impact</li>
                        <li>• Strategic refuel stop planning</li>
                        <li>• Cost optimization algorithms</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Vehicle Intelligence */}
                  <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Truck className="w-5 h-5 text-green-400" />
                        Vehicle-Specific Intelligence
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Multi-Vehicle</Badge>
                        <p className="text-sm text-gray-300">Specialized optimization for every vehicle type</p>
                      </div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Electric vehicles: Range & charging optimization</li>
                        <li>• Trucks: Weight restrictions & delivery windows</li>
                        <li>• Vans: Urban efficiency & cargo optimization</li>
                        <li>• Motorcycles: Lane-specific routing</li>
                        <li>• Complete technical specifications tracking</li>
                        <li>• Real-time vehicle status monitoring</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Driver Personalization */}
                  <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Users className="w-5 h-5 text-purple-400" />
                        Driver Personalization
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">AI Learning</Badge>
                        <p className="text-sm text-gray-300">Individual driver behavior adaptation</p>
                      </div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Personal driving pattern recognition</li>
                        <li>• Coaching insights and recommendations</li>
                        <li>• Performance comparison analytics</li>
                        <li>• Satisfaction tracking</li>
                        <li>• Custom optimization preferences</li>
                        <li>• Continuous behavioral learning</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Historical Learning */}
                  <Card className="bg-gradient-to-br from-orange-900/50 to-red-900/50 border-orange-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Database className="w-5 h-5 text-orange-400" />
                        Historical Learning System
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Pattern Recognition</Badge>
                        <p className="text-sm text-gray-300">Learns from every route for better optimization</p>
                      </div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Route similarity matching</li>
                        <li>• Performance pattern analysis</li>
                        <li>• Continuous accuracy improvement</li>
                        <li>• Seasonal adjustment learning</li>
                        <li>• Traffic pattern recognition</li>
                        <li>• Success rate optimization</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Advanced Features */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">Advanced AI Capabilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <Brain className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                        <h4 className="font-semibold text-white mb-2">Neural Networks</h4>
                        <p className="text-sm text-gray-400">TensorFlow.js powered predictions with continuous learning</p>
                      </div>
                      <div className="text-center">
                        <Network className="w-12 h-12 text-green-400 mx-auto mb-3" />
                        <h4 className="font-semibold text-white mb-2">Real-Time Processing</h4>
                        <p className="text-sm text-gray-400">Instant adaptation to changing conditions and traffic</p>
                      </div>
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                        <h4 className="font-semibold text-white mb-2">Predictive Analytics</h4>
                        <p className="text-sm text-gray-400">Forecast optimization opportunities and maintenance needs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Route Optimization Accuracy</span>
                          <span className="text-green-400 font-semibold">97-99%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-green-400 h-2 rounded-full" style={{ width: '98%' }}></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Fuel Prediction Accuracy</span>
                          <span className="text-blue-400 font-semibold">±2%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-400 h-2 rounded-full" style={{ width: '98%' }}></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Response Time</span>
                          <span className="text-yellow-400 font-semibold">&lt;200ms</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '95%' }}></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">System Reliability</span>
                          <span className="text-purple-400 font-semibold">99.9%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-purple-400 h-2 rounded-full" style={{ width: '99%' }}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Business Impact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center py-4">
                        <div className="text-4xl font-bold text-green-400 mb-2">20-55%</div>
                        <div className="text-gray-400">Cost Savings</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-400">15-35%</div>
                          <div className="text-xs text-gray-400">Fuel Reduction</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-400">10-25%</div>
                          <div className="text-xs text-gray-400">Route Efficiency</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-yellow-400">5-20%</div>
                          <div className="text-xs text-gray-400">Time Savings</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-400">3-6mo</div>
                          <div className="text-xs text-gray-400">ROI Period</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Industry Benchmarks */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Industry Benchmarks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold text-white mb-3">Accuracy Comparison</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">RouteOptimizer Pro</span>
                            <span className="text-green-400 font-semibold">97-99%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Industry Average</span>
                            <span className="text-gray-400">75-85%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Traditional Systems</span>
                            <span className="text-red-400">60-70%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-3">Fuel Accuracy</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">RouteOptimizer Pro</span>
                            <span className="text-green-400 font-semibold">±2%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Industry Average</span>
                            <span className="text-gray-400">±10-15%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Traditional Systems</span>
                            <span className="text-red-400">±15-25%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-3">Cost Savings</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">RouteOptimizer Pro</span>
                            <span className="text-green-400 font-semibold">20-55%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Industry Average</span>
                            <span className="text-gray-400">10-20%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Traditional Systems</span>
                            <span className="text-red-400">5-10%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Integration Tab */}
              <TabsContent value="integration" className="space-y-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">API Requirements & Integrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-white mb-3">Required APIs</h4>
                        <div className="space-y-2">
                          <Badge variant="outline" className="mr-2 mb-2">Google Maps API</Badge>
                          <Badge variant="outline" className="mr-2 mb-2">Traffic Data API</Badge>
                          <Badge variant="outline" className="mr-2 mb-2">Weather API</Badge>
                          <Badge variant="outline" className="mr-2 mb-2">Fuel Price API</Badge>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-3">Optional Integrations</h4>
                        <div className="space-y-2">
                          <Badge variant="secondary" className="mr-2 mb-2">Vehicle Diagnostics</Badge>
                          <Badge variant="secondary" className="mr-2 mb-2">Maintenance Systems</Badge>
                          <Badge variant="secondary" className="mr-2 mb-2">Fleet Management</Badge>
                          <Badge variant="secondary" className="mr-2 mb-2">ERP Systems</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Technical Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-white mb-2">System Requirements</h4>
                          <ul className="text-sm text-gray-400 space-y-1">
                            <li>• Node.js 18+ or compatible runtime</li>
                            <li>• 2GB RAM minimum (4GB recommended)</li>
                            <li>• 1GB storage space</li>
                            <li>• Internet connection for API calls</li>
                            <li>• Modern web browser support</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-2">Supported Platforms</h4>
                          <ul className="text-sm text-gray-400 space-y-1">
                            <li>• Web Applications (React, Vue, Angular)</li>
                            <li>• Mobile Apps (React Native, Flutter)</li>
                            <li>• Desktop Applications (Electron)</li>
                            <li>• Server-side Node.js applications</li>
                            <li>• RESTful API endpoints</li>
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-white mb-2">AI Framework</h4>
                          <ul className="text-sm text-gray-400 space-y-1">
                            <li>• TensorFlow.js for ML processing</li>
                            <li>• Custom neural network models</li>
                            <li>• Real-time prediction engine</li>
                            <li>• Historical data analysis</li>
                            <li>• Pattern recognition algorithms</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-white mb-2">Security Features</h4>
                          <ul className="text-sm text-gray-400 space-y-1">
                            <li>• End-to-end encryption</li>
                            <li>• API key authentication</li>
                            <li>• Data privacy compliance</li>
                            <li>• Secure data transmission</li>
                            <li>• Access control management</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Starter</CardTitle>
                      <CardDescription>Perfect for small fleets</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white mb-4">€199<span className="text-lg text-gray-400">/month</span></div>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li>• Up to 10 vehicles</li>
                        <li>• Basic route optimization</li>
                        <li>• FuelMaster AI included</li>
                        <li>• Email support</li>
                        <li>• Standard API access</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/30 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-white">Professional</CardTitle>
                      <CardDescription>Advanced fleet management</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white mb-4">€299<span className="text-lg text-gray-400">/month</span></div>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li>• Up to 50 vehicles</li>
                        <li>• Full AI optimization suite</li>
                        <li>• Driver personalization</li>
                        <li>• Historical learning</li>
                        <li>• Priority support</li>
                        <li>• Advanced analytics</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Enterprise</CardTitle>
                      <CardDescription>Large scale operations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white mb-4">€499<span className="text-lg text-gray-400">/month</span></div>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li>• Unlimited vehicles</li>
                        <li>• Custom AI models</li>
                        <li>• White-label options</li>
                        <li>• Dedicated support</li>
                        <li>• Custom integrations</li>
                        <li>• SLA guarantee</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-green-900/20 border-green-500/30">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-400" />
                      ROI Guarantee
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">
                      We guarantee a positive return on investment within 6 months or receive a full refund. 
                      Our AI typically pays for itself within 3-4 months through cost savings.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-400">3-4 months</div>
                        <div className="text-sm text-gray-400">Typical payback period</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-400">20-55%</div>
                        <div className="text-sm text-gray-400">Annual cost savings</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-400">6 months</div>
                        <div className="text-sm text-gray-400">ROI guarantee period</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-700">
              <div className="flex items-center space-x-4">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  ✓ 30-day free trial
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  ✓ No setup fees
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  ✓ Cancel anytime
                </Badge>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Learn More
                </Button>
                <Button 
                  onClick={onBuy}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 