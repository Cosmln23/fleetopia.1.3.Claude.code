'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  X, 
  Star, 
  Bot, 
  CheckCircle, 
  TrendingUp, 
  Target, 
  Brain, 
  Zap,
  Clock,
  DollarSign,
  Shield,
  Bell,
  Leaf,
  BarChart3,
  Users,
  Package,
  Truck,
  MapPin,
  Calendar,
  Smartphone
} from 'lucide-react';

interface DeliveryPredictorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuy: () => void;
}

export function DeliveryPredictorModal({ isOpen, onClose, onBuy }: DeliveryPredictorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
        <DialogHeader className="sr-only">
          <h2>DeliveryPredictor Details</h2>
        </DialogHeader>
        
        <div className="relative">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    DeliveryPredictor
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">v1.5.2</Badge>
                  </h2>
                  <p className="text-gray-400">ML-powered delivery time predictions and dynamic pricing optimization</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-white">4.7</span>
                      <span className="text-xs text-gray-400">(567 reviews)</span>
                    </div>
                    <Badge variant="outline" className="text-xs">Verified AI</Badge>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Delivery Expert</Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">€149<span className="text-lg text-gray-400">/month</span></p>
                  <p className="text-sm text-gray-400">€9,600 total revenue</p>
                </div>
                <Button onClick={onBuy} size="lg" className="bg-green-600 hover:bg-green-700">
                  Buy Now
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
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
                <Card className="bg-gradient-to-r from-green-900/50 to-blue-900/50 border-green-500/30">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white flex items-center gap-2">
                      <Package className="w-6 h-6 text-green-400" />
                      Revolutionary Delivery Intelligence Platform
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-300">
                      Transform your delivery operations with advanced ML predictions, dynamic pricing optimization, 
                      and intelligent scheduling that delivers 89.3% accuracy and 30-50% revenue growth.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <TrendingUp className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">89.3% Accuracy</h3>
                        <p className="text-gray-400">Industry-leading delivery time predictions</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <DollarSign className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">30-50% Revenue</h3>
                        <p className="text-gray-400">Increased revenue through dynamic pricing</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Brain className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Smart AI Engine</h3>
                        <p className="text-gray-400">Advanced ML algorithms with continuous learning</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* What Makes It Revolutionary */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">What Makes DeliveryPredictor Revolutionary?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white">Dynamic Delivery Pricing</h4>
                            <p className="text-sm text-gray-400">Real-time surge pricing cu demand-supply balancing și customer willingness-to-pay analysis</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white">ML-Powered Predictions</h4>
                            <p className="text-sm text-gray-400">Advanced machine learning cu weather, traffic, și historical data analysis</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white">Customer Segmentation</h4>
                            <p className="text-sm text-gray-400">Intelligent customer behavior analysis pentru personalized pricing strategies</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white">Smart Scheduling</h4>
                            <p className="text-sm text-gray-400">Automated optimal time slot recommendations cu capacity optimization</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white">Real-Time Notifications</h4>
                            <p className="text-sm text-gray-400">Proactive customer communication cu delivery status updates</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white">Sustainability Tracking</h4>
                            <p className="text-sm text-gray-400">Carbon footprint monitoring cu eco-friendly delivery options</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* vs Traditional Delivery Management */}
                <Card className="bg-gradient-to-r from-red-900/30 to-green-900/30 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">DeliveryPredictor vs Traditional Delivery Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-red-400 mb-3">❌ Traditional Systems</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li>• Manual time estimation (±25-40% error)</li>
                          <li>• Fixed pricing models</li>
                          <li>• No demand prediction</li>
                          <li>• Basic scheduling tools</li>
                          <li>• Limited customer insights</li>
                          <li>• Reactive delivery management</li>
                          <li>• No revenue optimization</li>
                          <li>• Manual notification systems</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-400 mb-3">✅ DeliveryPredictor</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li>• ML-powered time predictions (±11% accuracy)</li>
                          <li>• Dynamic surge pricing optimization</li>
                          <li>• Demand forecasting și inventory optimization</li>
                          <li>• Intelligent scheduling automation</li>
                          <li>• Advanced customer segmentation</li>
                          <li>• Proactive delivery optimization</li>
                          <li>• 30-50% revenue optimization</li>
                          <li>• Smart automated notifications</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Dynamic Pricing Engine */}
                  <Card className="bg-gradient-to-br from-green-900/50 to-blue-900/50 border-green-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        Dynamic Pricing Engine
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">30-50% Revenue Growth</Badge>
                        <p className="text-sm text-gray-300">Real-time surge pricing cu advanced demand analysis</p>
                      </div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Surge multiplier range: 1.0x - 3.5x</li>
                        <li>• Customer willingness-to-pay analysis</li>
                        <li>• Competitive pricing intelligence</li>
                        <li>• A/B testing framework (4 segments)</li>
                        <li>• Revenue optimization algorithms</li>
                        <li>• Real-time market positioning</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* ML Prediction System */}
                  <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Brain className="w-5 h-5 text-blue-400" />
                        ML Prediction System
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">89.3% Accuracy</Badge>
                        <p className="text-sm text-gray-300">Advanced machine learning pentru delivery predictions</p>
                      </div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Weather impact analysis</li>
                        <li>• Traffic pattern recognition</li>
                        <li>• Historical data learning</li>
                        <li>• Route complexity assessment</li>
                        <li>• Package handling time estimation</li>
                        <li>• Continuous model improvement</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Smart Scheduling */}
                  <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Calendar className="w-5 h-5 text-purple-400" />
                        Smart Scheduling Engine
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Automated Optimization</Badge>
                        <p className="text-sm text-gray-300">Intelligent time slot recommendations</p>
                      </div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Demand forecasting integration</li>
                        <li>• Capacity optimization algorithms</li>
                        <li>• Customer preference learning</li>
                        <li>• Resource allocation balancing</li>
                        <li>• Peak time management</li>
                        <li>• Inventory synchronization</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Customer Intelligence */}
                  <Card className="bg-gradient-to-br from-orange-900/50 to-red-900/50 border-orange-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Users className="w-5 h-5 text-orange-400" />
                        Customer Intelligence
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Advanced Segmentation</Badge>
                        <p className="text-sm text-gray-300">Deep customer behavior analysis</p>
                      </div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• VIP, regular, budget, new segments</li>
                        <li>• Price elasticity calculations</li>
                        <li>• Purchase pattern recognition</li>
                        <li>• Loyalty program integration</li>
                        <li>• Personalized pricing strategies</li>
                        <li>• Churn prediction modeling</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Smart Notifications */}
                  <Card className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 border-cyan-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Bell className="w-5 h-5 text-cyan-400" />
                        Smart Notification System
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Proactive Communication</Badge>
                        <p className="text-sm text-gray-300">Automated customer și driver notifications</p>
                      </div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Real-time delivery tracking</li>
                        <li>• Proactive delay notifications</li>
                        <li>• SMS, email, push integration</li>
                        <li>• Driver coaching alerts</li>
                        <li>• Customer satisfaction tracking</li>
                        <li>• Personalized communication timing</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Sustainability Tracking */}
                  <Card className="bg-gradient-to-br from-green-900/50 to-teal-900/50 border-green-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Leaf className="w-5 h-5 text-green-400" />
                        Sustainability Module
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Eco-Friendly</Badge>
                        <p className="text-sm text-gray-300">Carbon footprint monitoring și optimization</p>
                      </div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Real-time carbon tracking</li>
                        <li>• Electric vehicle prioritization</li>
                        <li>• Bike delivery recommendations</li>
                        <li>• Consolidated delivery optimization</li>
                        <li>• Green delivery scoring</li>
                        <li>• Sustainability reporting</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
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
                          <span className="text-gray-400">Delivery Time Accuracy</span>
                          <span className="text-green-400 font-semibold">89.3%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-green-400 h-2 rounded-full" style={{ width: '89%' }}></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Revenue Optimization</span>
                          <span className="text-blue-400 font-semibold">+30-50%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Customer Satisfaction</span>
                          <span className="text-purple-400 font-semibold">94.1%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-purple-400 h-2 rounded-full" style={{ width: '94%' }}></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Response Time</span>
                          <span className="text-yellow-400 font-semibold">220ms</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Business Impact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Revenue Growth</span>
                          <span className="text-green-400 font-semibold">€9,600</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Total Downloads</span>
                          <span className="text-blue-400 font-semibold">567</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Active Users</span>
                          <span className="text-purple-400 font-semibold">1,234</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Customer Rating</span>
                          <span className="text-yellow-400 font-semibold">4.7/5</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Competitive Analysis */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Competitive Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold text-white mb-3">Prediction Accuracy</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">DeliveryPredictor</span>
                            <span className="text-green-400 font-semibold">89.3%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Industry Average</span>
                            <span className="text-gray-400">65-75%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Traditional Systems</span>
                            <span className="text-red-400">45-60%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-3">Revenue Optimization</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">DeliveryPredictor</span>
                            <span className="text-green-400 font-semibold">+30-50%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Industry Average</span>
                            <span className="text-gray-400">+5-15%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Fixed Pricing</span>
                            <span className="text-red-400">0%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-3">Response Time</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">DeliveryPredictor</span>
                            <span className="text-green-400 font-semibold">220ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Industry Average</span>
                            <span className="text-gray-400">500-800ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Legacy Systems</span>
                            <span className="text-red-400">1-3s</span>
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
                    <CardTitle className="text-white">Required Integrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-white">Essential APIs</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <div>
                              <p className="font-medium text-white">Weather API</p>
                              <p className="text-sm text-gray-400">Real-time weather impact analysis</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <div>
                              <p className="font-medium text-white">Calendar Integration</p>
                              <p className="text-sm text-gray-400">Smart scheduling coordination</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <div>
                              <p className="font-medium text-white">Maps & Traffic</p>
                              <p className="text-sm text-gray-400">Route optimization și traffic analysis</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-semibold text-white">Optional Enhancements</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                            <Target className="w-5 h-5 text-blue-400" />
                            <div>
                              <p className="font-medium text-white">SMS Gateway</p>
                              <p className="text-sm text-gray-400">Real-time customer notifications</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                            <Target className="w-5 h-5 text-blue-400" />
                            <div>
                              <p className="font-medium text-white">Payment Processing</p>
                              <p className="text-sm text-gray-400">Dynamic pricing transactions</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                            <Target className="w-5 h-5 text-blue-400" />
                            <div>
                              <p className="font-medium text-white">CRM Integration</p>
                              <p className="text-sm text-gray-400">Customer behavior tracking</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Setup Guide */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Setup Guide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <h4 className="font-semibold text-white">Install DeliveryPredictor</h4>
                          <p className="text-gray-400">One-click installation din FleetMind marketplace</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                          <h4 className="font-semibold text-white">Configure API Keys</h4>
                          <p className="text-gray-400">Add Weather API și Calendar integration credentials</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                          <h4 className="font-semibold text-white">Initialize ML Models</h4>
                          <p className="text-gray-400">Automatic model training cu historical data</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                        <div>
                          <h4 className="font-semibold text-white">Start Predicting</h4>
                          <p className="text-gray-400">Begin receiving intelligent delivery predictions</p>
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
                      <CardDescription>Perfect for small delivery operations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white mb-4">€79<span className="text-lg text-gray-400">/month</span></div>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li>• Up to 100 predictions/day</li>
                        <li>• Basic ML predictions</li>
                        <li>• Email support</li>
                        <li>• Standard API access</li>
                        <li>• Basic analytics</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-900/50 to-blue-900/50 border-green-500 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-500 text-white">Most Popular</Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-white">Professional</CardTitle>
                      <CardDescription>Ideal pentru medium delivery fleets</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white mb-4">€149<span className="text-lg text-gray-400">/month</span></div>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li>• Up to 1,000 predictions/day</li>
                        <li>• Advanced ML cu dynamic pricing</li>
                        <li>• Smart scheduling optimization</li>
                        <li>• Customer segmentation</li>
                        <li>• Priority support</li>
                        <li>• Advanced analytics dashboard</li>
                        <li>• A/B testing framework</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Enterprise</CardTitle>
                      <CardDescription>Pentru large-scale delivery operations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white mb-4">€299<span className="text-lg text-gray-400">/month</span></div>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li>• Unlimited predictions</li>
                        <li>• Custom ML model training</li>
                        <li>• White-label solutions</li>
                        <li>• Dedicated account manager</li>
                        <li>• 24/7 premium support</li>
                        <li>• Custom integrations</li>
                        <li>• Advanced reporting suite</li>
                        <li>• SLA guarantees</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* ROI Calculator */}
                <Card className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-500/30">
                  <CardHeader>
                    <CardTitle className="text-white">Return on Investment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400 mb-2">30-50%</div>
                        <p className="text-gray-400">Revenue increase prin dynamic pricing</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400 mb-2">25%</div>
                        <p className="text-gray-400">Delivery time accuracy improvement</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400 mb-2">€9,600</div>
                        <p className="text-gray-400">Average monthly revenue generated</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 