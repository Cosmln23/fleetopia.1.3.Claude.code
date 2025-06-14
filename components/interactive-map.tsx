'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Fuel, Truck, AlertTriangle, Zap, RefreshCw } from 'lucide-react';

// Dynamic import to avoid SSR issues with Leaflet
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import('react-leaflet').then((mod) => mod.Polyline), { ssr: false });

interface Vehicle {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  status: 'active' | 'idle' | 'maintenance';
  speed: number;
  fuel: number;
  driver: string;
  route?: { lat: number; lng: number }[];
}

export default function InteractiveMap() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      name: 'Truck Alpha',
      position: { lat: 45.7489, lng: 21.2087 }, // Timișoara
      status: 'active',
      speed: 65,
      fuel: 78,
      driver: 'Ion Popescu',
      route: [
        { lat: 45.7489, lng: 21.2087 },
        { lat: 45.7489, lng: 21.3087 },
        { lat: 45.7589, lng: 21.3087 }
      ]
    },
    {
      id: '2',
      name: 'Van Beta',
      position: { lat: 44.4268, lng: 26.1025 }, // București
      status: 'idle',
      speed: 0,
      fuel: 45,
      driver: 'Maria Ionescu'
    },
    {
      id: '3',
      name: 'Truck Gamma',
      position: { lat: 46.7712, lng: 23.6236 }, // Cluj-Napoca
      status: 'active',
      speed: 52,
      fuel: 92,
      driver: 'Vasile Dumitrescu',
      route: [
        { lat: 46.7712, lng: 23.6236 },
        { lat: 46.7812, lng: 23.6336 },
        { lat: 46.7912, lng: 23.6436 }
      ]
    },
    {
      id: '4',
      name: 'Van Delta',
      position: { lat: 44.1598, lng: 28.6348 }, // Constanța
      status: 'maintenance',
      speed: 0,
      fuel: 23,
      driver: 'Elena Georgescu'
    }
  ]);

  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    setIsMapReady(true);
    
    // Simulate real-time vehicle updates
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(vehicle => ({
        ...vehicle,
        position: {
          lat: vehicle.position.lat + (Math.random() - 0.5) * 0.001,
          lng: vehicle.position.lng + (Math.random() - 0.5) * 0.001
        },
        speed: vehicle.status === 'active' ? 
          Math.max(0, Math.min(80, vehicle.speed + (Math.random() - 0.5) * 10)) : 0,
        fuel: Math.max(0, vehicle.fuel - Math.random() * 0.1)
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'idle': return 'text-yellow-400';
      case 'maintenance': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Truck className="w-4 h-4" />;
      case 'idle': return <MapPin className="w-4 h-4" />;
      case 'maintenance': return <AlertTriangle className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const centerPosition: [number, number] = [45.9432, 24.9668]; // Romania center

  if (!isMapReady) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="h-96 flex items-center justify-center">
          <div className="text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p>Loading Interactive Map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Map Card */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-200 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-green-400" />
              Real-Time Fleet Tracking
            </CardTitle>
            <Badge variant="outline" className="text-green-400 border-green-400">
              <Zap className="w-3 h-3 mr-1" />
              OpenStreetMap Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96 rounded-lg overflow-hidden border border-slate-700">
            <MapContainer
              center={centerPosition}
              zoom={7}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {vehicles.map((vehicle) => (
                <React.Fragment key={vehicle.id}>
                  <Marker position={[vehicle.position.lat, vehicle.position.lng]}>
                    <Popup>
                      <div className="text-slate-900 min-w-[200px]">
                        <div className="font-bold text-lg mb-2">{vehicle.name}</div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center justify-between">
                            <span>Status:</span>
                            <Badge 
                              variant="outline" 
                              className={`${getStatusColor(vehicle.status)} border-current`}
                            >
                              {getStatusIcon(vehicle.status)}
                              <span className="ml-1 capitalize">{vehicle.status}</span>
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Speed:</span>
                            <span className="font-medium">{Math.round(vehicle.speed)} km/h</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Fuel:</span>
                            <span className="font-medium">{Math.round(vehicle.fuel)}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Driver:</span>
                            <span className="font-medium">{vehicle.driver}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Position:</span>
                            <span className="font-mono text-xs">
                              {vehicle.position.lat.toFixed(4)}, {vehicle.position.lng.toFixed(4)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                  
                  {/* Show route if vehicle has one */}
                  {vehicle.route && (
                    <Polyline 
                      positions={vehicle.route.map(pos => [pos.lat, pos.lng] as [number, number])}
                      color={vehicle.status === 'active' ? '#22c55e' : '#94a3b8'}
                      weight={3}
                      opacity={0.7}
                    />
                  )}
                </React.Fragment>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id} className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-200">{vehicle.name}</h3>
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(vehicle.status)} border-current`}
                >
                  {getStatusIcon(vehicle.status)}
                  <span className="ml-1 capitalize">{vehicle.status}</span>
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Speed:</span>
                  <span className="text-slate-200">{Math.round(vehicle.speed)} km/h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Fuel:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          vehicle.fuel > 50 ? 'bg-green-500' : 
                          vehicle.fuel > 25 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${vehicle.fuel}%` }}
                      />
                    </div>
                    <span className="text-slate-200">{Math.round(vehicle.fuel)}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Driver:</span>
                  <span className="text-slate-200">{vehicle.driver}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Map Features */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">Map Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <MapPin className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-200 mb-1">Real-time Tracking</h3>
              <p className="text-slate-400">Live vehicle positions updated every 3 seconds</p>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <Navigation className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-200 mb-1">Route Visualization</h3>
              <p className="text-slate-400">Active routes displayed on map</p>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-lg">
              <Fuel className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-200 mb-1">Vehicle Details</h3>
              <p className="text-slate-400">Click markers for detailed information</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 