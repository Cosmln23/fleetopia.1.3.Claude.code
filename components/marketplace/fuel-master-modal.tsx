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

interface FuelMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuy?: () => void;
}

export function FuelMasterModal({ isOpen, onClose, onBuy }: FuelMasterModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
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
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 h-full w-full max-w-6xl bg-gray-900 shadow-2xl overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Fuel className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    FuelMaster AI
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">v1.8.3</Badge>
                  </h2>
                  <p className="text-gray-400">Complete fuel optimization ecosystem with 3 advanced AI engines</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-white">4.8</span>
                      <span className="text-xs text-gray-400">(834 reviews)</span>
                    </div>
                    <Badge variant="outline" className="text-xs">Verified AI</Badge>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Analytics Expert</Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">€199</div>
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
                <TabsTrigger value="systems">AI Systems</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="integration">Integration</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Hero Section */}
                <Card className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 border-blue-500/30">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white flex items-center gap-2">
                      <Fuel className="w-6 h-6 text-cyan-400" />
                      Complete Fuel Optimization Ecosystem
                    </CardTitle>
                    <CardDescription className="text-lg text-gray-300">
                      Transform your fuel management with our 3 advanced AI engines delivering 25-45% combined savings 
                      through predictive analytics, dynamic pricing, and micro-optimization techniques.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Brain className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Predictive AI</h3>
                        <p className="text-gray-400">7-day forecasting cu 95%+ accuracy</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <TrendingUp className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Dynamic Pricing</h3>
                        <p className="text-gray-400">Real-time cost optimization</p>
                      </div>
                      <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Zap className="w-8 h-8 text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Micro-Optimization</h3>
                        <p className="text-gray-400">Driving behavior coaching</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* What Makes It Special */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">Ce face FuelMaster AI revoluționar?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white">3 AI Engines Integration</h4>
                            <p className="text-sm text-gray-400">Predictive, Dynamic Pricing și Micro-Optimization lucreaza împreună</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white">±2% Fuel Accuracy</h4>
                            <p className="text-sm text-gray-400">Ultra-precise calculations cu load impact, weather și maintenance factors</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white">Real-Time Market Analysis</h4>
                            <p className="text-sm text-gray-400">Continuous market tracking pentru optimal fuel purchasing</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white">Driver Behavior Coaching</h4>
                            <p className="text-sm text-gray-400">Real-time feedback pentru fuel efficiency improvement</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white">Vehicle-Specific Optimization</h4>
                            <p className="text-sm text-gray-400">Tailored algorithms pentru fiecare tip de vehicul</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                          <div>
                            <h4 className="font-semibold text-white">TensorFlow Neural Networks</h4>
                            <p className="text-sm text-gray-400">Advanced ML models cu continuous learning</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comparison */}
                <Card className="bg-gradient-to-r from-red-900/30 to-green-900/30 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">FuelMaster AI vs Traditional Fuel Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-red-400 mb-3">❌ Traditional Systems</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li>• Manual fuel monitoring</li>
                          <li>• Generic consumption estimates (±15-25% error)</li>
                          <li>• No predictive capabilities</li>
                          <li>• Basic cost tracking</li>
                          <li>• No driver behavior analysis</li>
                          <li>• Reactive fuel purchasing</li>
                          <li>• Limited optimization</li>
                          <li>• No market trend analysis</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-400 mb-3">✅ FuelMaster AI</h4>
                        <ul className="space-y-2 text-sm text-gray-400">
                          <li>• Automated predictive fuel monitoring</li>
                          <li>• Ultra-precise consumption predictions (±2% accuracy)</li>
                          <li>• 7-day forecasting cu TensorFlow</li>
                          <li>• Real-time cost optimization</li>
                          <li>• Advanced driver coaching system</li>
                          <li>• Strategic fuel purchasing automation</li>
                          <li>• 25-45% combined fuel savings</li>
                          <li>• Continuous market trend analysis</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Systems Tab */}
              <TabsContent value="systems" className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  
                  {/* System 1: Predictive Fuel AI */}
                  <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Brain className="w-5 h-5 text-purple-400" />
                        PROMPT 1: Predictive Fuel Consumption AI
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">95%+ Accuracy</Badge>
                        <p className="text-sm text-gray-300">7-day fuel consumption forecasting cu TensorFlow neural networks</p>
                      </div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Weather forecast integration pentru impact predictions</li>
                        <li>• Traffic pattern forecasting cu historical data</li>
                        <li>• Driver behavior trend analysis</li>
                        <li>• Vehicle degradation curve modeling</li>
                        <li>• Seasonal fuel formula impact analysis</li>
                        <li>• Supply chain disruption prediction</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* System 2: Dynamic Fuel Pricing */}
                  <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        PROMPT 2: Dynamic Fuel Pricing Optimizer
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">15-25% Savings</Badge>
                        <p className="text-sm text-gray-300">Real-time market price tracking și strategic purchasing optimization</p>
                      </div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• Multi-supplier price comparison și negotiation</li>
                        <li>• Market trend analysis cu predictive models</li>
                        <li>• Strategic fuel purchasing automation</li>
                        <li>• Geographic price optimization</li>
                        <li>• Bulk purchase timing optimization</li>
                        <li>• Contract negotiation insights</li>
                      </ul>
                    </CardContent>
                  </Card>

                  {/* System 3: Micro-Optimization Engine */}
                  <Card className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        PROMPT 3: Micro-Optimization Fuel Engine
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">8-12% Improvement</Badge>
                        <p className="text-sm text-gray-300">Real-time driving behavior analysis și intelligent coaching</p>
                      </div>
                      <ul className="text-sm text-gray-400 space-y-1">
                        <li>• IoT integration pentru real-time data collection</li>
                        <li>• Granular fuel efficiency recommendations</li>
                        <li>• Real-time driver coaching cu immediate feedback</li>
                        <li>• Regenerative braking maximization</li>
                        <li>• Idle time minimization algorithms</li>
                        <li>• Vehicle-specific micro-optimization</li>
                      </ul>
                    </CardContent>
                  </Card>

                </div>

                {/* Combined Impact */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">🎯 Combined AI Systems Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-3xl font-bold text-green-400 mb-2">25-45%</div>
                        <div className="text-sm text-gray-400">Total Fuel Savings</div>
                        <div className="text-xs text-gray-500 mt-1">All 3 systems combined</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-blue-400 mb-2">±2%</div>
                        <div className="text-sm text-gray-400">Prediction Accuracy</div>
                        <div className="text-xs text-gray-500 mt-1">Industry-leading precision</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-purple-400 mb-2">3-6</div>
                        <div className="text-sm text-gray-400">ROI Timeline (months)</div>
                        <div className="text-xs text-gray-500 mt-1">Positive return guaranteed</div>
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
                          <span className="text-gray-400">Fuel Prediction Accuracy</span>
                          <span className="text-green-400 font-semibold">±2%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-green-400 h-2 rounded-full" style={{ width: '98%' }}></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Cost Optimization</span>
                          <span className="text-blue-400 font-semibold">25-45%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Driver Coaching Effectiveness</span>
                          <span className="text-purple-400 font-semibold">92%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-purple-400 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">System Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Response Time</span>
                          <span className="text-green-400 font-semibold">&lt;50ms</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-green-400 h-2 rounded-full" style={{ width: '95%' }}></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Reliability</span>
                          <span className="text-blue-400 font-semibold">99.9%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-400 h-2 rounded-full" style={{ width: '99%' }}></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Security</span>
                          <span className="text-purple-400 font-semibold">92%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-purple-400 h-2 rounded-full" style={{ width: '92%' }}></div>
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
                        <h4 className="font-semibold text-white mb-3">Fuel Accuracy</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">FuelMaster AI</span>
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
                            <span className="text-sm text-gray-400">FuelMaster AI</span>
                            <span className="text-green-400 font-semibold">25-45%</span>
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
                      <div>
                        <h4 className="font-semibold text-white mb-3">Implementation Speed</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">FuelMaster AI</span>
                            <span className="text-green-400 font-semibold">2-4 weeks</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Industry Average</span>
                            <span className="text-gray-400">3-6 months</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-400">Traditional Systems</span>
                            <span className="text-red-400">6-12 months</span>
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
                      <div>
                        <h4 className="font-semibold text-white mb-3">Core APIs</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                            <span className="text-gray-300">Fuel Price API</span>
                            <Badge className="bg-green-500/20 text-green-400">Required</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                            <span className="text-gray-300">Vehicle Diagnostics</span>
                            <Badge className="bg-green-500/20 text-green-400">Required</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                            <span className="text-gray-300">Weather API</span>
                            <Badge className="bg-blue-500/20 text-blue-400">Recommended</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                            <span className="text-gray-300">IoT Sensors</span>
                            <Badge className="bg-purple-500/20 text-purple-400">Optional</Badge>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-3">Platform Compatibility</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                            <span className="text-gray-300">Fleet Management Systems</span>
                            <Badge className="bg-green-500/20 text-green-400">✓ Compatible</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                            <span className="text-gray-300">Telematics Platforms</span>
                            <Badge className="bg-green-500/20 text-green-400">✓ Compatible</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                            <span className="text-gray-300">ERP Systems</span>
                            <Badge className="bg-blue-500/20 text-blue-400">✓ Integrable</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-700/50 rounded">
                            <span className="text-gray-300">Mobile Apps</span>
                            <Badge className="bg-green-500/20 text-green-400">✓ Ready</Badge>
                          </div>
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
                      <CardDescription>Perfect pentru flote mici</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white mb-4">€199<span className="text-lg text-gray-400">/month</span></div>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li>• Up to 10 vehicles</li>
                        <li>• Predictive Fuel AI included</li>
                        <li>• Basic Dynamic Pricing</li>
                        <li>• Email support</li>
                        <li>• Standard API access</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-900/20 border-blue-500/30 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-white">Professional</CardTitle>
                      <CardDescription>Complete AI optimization suite</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-white mb-4">€299<span className="text-lg text-gray-400">/month</span></div>
                      <ul className="space-y-2 text-sm text-gray-400">
                        <li>• Up to 50 vehicles</li>
                        <li>• All 3 AI Systems included</li>
                        <li>• Advanced Micro-Optimization</li>
                        <li>• Real-time driver coaching</li>
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
                        <li>• Custom AI model training</li>
                        <li>• White-label options</li>
                        <li>• Dedicated support team</li>
                        <li>• Custom integrations</li>
                        <li>• SLA guarantee</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* ROI Guarantee */}
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
                      Our AI typically pays for itself within 3-4 months through combined fuel savings.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-green-400">3-4 months</div>
                        <div className="text-sm text-gray-400">Typical payback period</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-400">25-45%</div>
                        <div className="text-sm text-gray-400">Annual fuel savings</div>
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
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white px-8"
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