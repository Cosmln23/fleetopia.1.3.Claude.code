'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Fuel, Truck, AlertTriangle, Zap, Globe, Code, DollarSign } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Leaflet
const InteractiveMap = dynamic(() => import('@/components/interactive-map'), { 
  ssr: false,
  loading: () => (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardContent className="h-96 flex items-center justify-center">
        <div className="text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-slate-600 border-t-green-400 rounded-full animate-spin mx-auto mb-2" />
          <p>Loading Interactive Map...</p>
        </div>
      </CardContent>
    </Card>
  )
});

export default function FreeMapsPage() {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🆓 FREE Maps pentru FleetOpia
          </h1>
          <p className="text-xl text-slate-300">
            Alternative GRATUITE la Google Maps API
          </p>
          <Badge variant="outline" className="text-green-400 border-green-400 mt-4">
            <Zap className="w-4 h-4 mr-1" />
            100% FREE • No API Keys Required
          </Badge>
        </div>

        {/* Free Services Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-900/50 rounded-lg flex items-center justify-center mb-3">
                <Globe className="w-6 h-6 text-green-400" />
              </div>
              <CardTitle className="text-green-400">OpenStreetMap</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-300 text-sm mb-4">Hărți open-source</p>
              <Badge className="bg-green-500 text-white mb-2">FREE ∞</Badge>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Hărți detaliate</li>
                <li>• Update regulat</li>
                <li>• Fără limite</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-900/50 rounded-lg flex items-center justify-center mb-3">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
              <CardTitle className="text-blue-400">Nominatim</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-300 text-sm mb-4">Geocoding gratuit</p>
              <Badge className="bg-blue-500 text-white mb-2">FREE ∞</Badge>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Adrese → Coordonate</li>
                <li>• Căutare locații</li>
                <li>• API REST</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-900/50 rounded-lg flex items-center justify-center mb-3">
                <Navigation className="w-6 h-6 text-purple-400" />
              </div>
              <CardTitle className="text-purple-400">OSRM</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-300 text-sm mb-4">Routing engine</p>
              <Badge className="bg-purple-500 text-white mb-2">FREE ∞</Badge>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Calculare rute</li>
                <li>• Optimizare TSP</li>
                <li>• Matrix distanțe</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 opacity-50">
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-900/50 rounded-lg flex items-center justify-center mb-3">
                <DollarSign className="w-6 h-6 text-red-400" />
              </div>
              <CardTitle className="text-red-400">Google Maps</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-slate-300 text-sm mb-4">Paid service</p>
              <Badge className="bg-red-500 text-white mb-2">$$$</Badge>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• $7/1000 loads</li>
                <li>• Complex setup</li>
                <li>• API Keys needed</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Real Interactive Map */}
        <InteractiveMap />

        {/* Implementation Guide */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center">
              <Code className="w-5 h-5 mr-2 text-blue-400" />
              Implementation Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-3">1. Install Dependencies</h3>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <code className="text-green-400 text-sm">
                    npm install leaflet react-leaflet @types/leaflet
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-3">2. Basic Map Setup</h3>
                <div className="bg-slate-900/50 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-slate-300 text-sm whitespace-pre-wrap">
{`import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

<MapContainer center={[45.9432, 24.9668]} zoom={7}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; OpenStreetMap contributors'
  />
  <Marker position={[45.7489, 21.2087]}>
    <Popup>Vehicle Location</Popup>
  </Marker>
</MapContainer>`}
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-200 mb-3">3. Free APIs Integration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <h4 className="text-slate-200 font-medium mb-2">Geocoding (Nominatim)</h4>
                    <code className="text-green-400 text-xs block">
                      https://nominatim.openstreetmap.org/search?format=json&q=București
                    </code>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <h4 className="text-slate-200 font-medium mb-2">Routing (OSRM)</h4>
                    <code className="text-green-400 text-xs block">
                      http://router.project-osrm.org/route/v1/driving/21.2087,45.7489;26.1025,44.4268
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Comparison */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-yellow-400" />
              Cost Comparison: FREE vs Google Maps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-2 text-slate-200">Service</th>
                    <th className="text-left p-2 text-slate-200">Google Maps</th>
                    <th className="text-left p-2 text-slate-200">Free Alternative</th>
                    <th className="text-left p-2 text-slate-200">Monthly Savings*</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-700/50">
                    <td className="p-2">Map Loads (10,000)</td>
                    <td className="p-2 text-red-400">$70</td>
                    <td className="p-2 text-green-400">$0</td>
                    <td className="p-2 text-green-400 font-semibold">+$70</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="p-2">Geocoding (5,000 requests)</td>
                    <td className="p-2 text-red-400">$25</td>
                    <td className="p-2 text-green-400">$0</td>
                    <td className="p-2 text-green-400 font-semibold">+$25</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="p-2">Directions (3,000 requests)</td>
                    <td className="p-2 text-red-400">$15</td>
                    <td className="p-2 text-green-400">$0</td>
                    <td className="p-2 text-green-400 font-semibold">+$15</td>
                  </tr>
                  <tr className="bg-slate-700/30">
                    <td className="p-2 font-semibold">TOTAL</td>
                    <td className="p-2 text-red-400 font-bold">$110/month</td>
                    <td className="p-2 text-green-400 font-bold">$0/month</td>
                    <td className="p-2 text-green-400 font-bold text-lg">+$110/month</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-slate-500 mt-4">
                * Savings for typical fleet management usage. Actual savings may vary.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 