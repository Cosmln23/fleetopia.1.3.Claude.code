'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Fuel, Truck, AlertTriangle, Zap } from 'lucide-react';

// Dinamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface Vehicle {
  id: string;
  name: string;
  position: [number, number];
  status: 'active' | 'idle' | 'maintenance';
  speed: number;
  fuel: number;
  driver: string;
}

export function FreeMapComponent() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      name: 'Truck Alpha',
      position: [45.7489, 21.2087], // Timișoara
      status: 'active',
      speed: 65,
      fuel: 78,
      driver: 'Ion Popescu'
    },
    {
      id: '2',
      name: 'Van Beta',
      position: [44.4268, 26.1025], // București
      status: 'idle',
      speed: 0,
      fuel: 45,
      driver: 'Maria Ionescu'
    },
    {
      id: '3',
      name: 'Truck Gamma',
      position: [46.7712, 23.6236], // Cluj-Napoca
      status: 'active',
      speed: 52,
      fuel: 92,
      driver: 'Vasile Dumitrescu'
    },
    {
      id: '4',
      name: 'Van Delta',
      position: [44.1598, 28.6348], // Constanța
      status: 'maintenance',
      speed: 0,
      fuel: 23,
      driver: 'Elena Georgescu'
    }
  ]);

  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
    
    // Simulate real-time vehicle updates
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(vehicle => ({
        ...vehicle,
        position: [
          vehicle.position[0] + (Math.random() - 0.5) * 0.01,
          vehicle.position[1] + (Math.random() - 0.5) * 0.01
        ] as [number, number],
        speed: vehicle.status === 'active' ? 
          Math.max(0, vehicle.speed + (Math.random() - 0.5) * 10) : 0,
        fuel: Math.max(0, vehicle.fuel - Math.random() * 0.5)
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'maintenance': return 'bg-red-500';
      default: return 'bg-gray-500';
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

  if (!mapReady) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading FREE Map...</p>
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
              Fleet Live Tracking (FREE OpenStreetMap)
            </CardTitle>
            <Badge variant="outline" className="text-green-400 border-green-400">
              <Zap className="w-3 h-3 mr-1" />
              100% FREE
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-96 rounded-lg overflow-hidden border border-slate-700">
            <MapContainer
              center={[45.7489, 21.2087]}
              zoom={7}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              {/* FREE OpenStreetMap tiles */}
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {/* Vehicle markers */}
              {vehicles.map((vehicle) => (
                <Marker key={vehicle.id} position={vehicle.position}>
                  <Popup>
                    <div className="p-2 min-w-48">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800">{vehicle.name}</h3>
                        <Badge className={`text-white ${getStatusColor(vehicle.status)}`}>
                          {getStatusIcon(vehicle.status)}
                          <span className="ml-1 capitalize">{vehicle.status}</span>
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Navigation className="w-4 h-4 mr-2" />
                          Speed: {Math.round(vehicle.speed)} km/h
                        </div>
                        <div className="flex items-center">
                          <Fuel className="w-4 h-4 mr-2" />
                          Fuel: {Math.round(vehicle.fuel)}%
                        </div>
                        <div className="flex items-center">
                          <Truck className="w-4 h-4 mr-2" />
                          Driver: {vehicle.driver}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">Live Vehicle Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-white">{vehicle.name}</h3>
                  <Badge className={`text-white ${getStatusColor(vehicle.status)}`}>
                    {getStatusIcon(vehicle.status)}
                    <span className="ml-1 capitalize">{vehicle.status}</span>
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-slate-400">Speed</p>
                    <p className="text-white font-medium">{Math.round(vehicle.speed)} km/h</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Fuel</p>
                    <p className="text-white font-medium">{Math.round(vehicle.fuel)}%</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Driver</p>
                    <p className="text-white font-medium text-xs">{vehicle.driver}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alternative Services */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">🆓 Alternative FREE Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
              <h3 className="font-medium text-green-400 mb-2">OpenStreetMap</h3>
              <p className="text-sm text-gray-300 mb-3">Hărți gratuite, open-source</p>
              <Button variant="outline" size="sm" className="text-green-400 border-green-700">
                ✅ În folosință
              </Button>
            </div>
            
            <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
              <h3 className="font-medium text-blue-400 mb-2">Nominatim Geocoding</h3>
              <p className="text-sm text-gray-300 mb-3">Geocodare gratuită pentru adrese</p>
              <Button variant="outline" size="sm" className="text-blue-400 border-blue-700">
                Activează
              </Button>
            </div>
            
            <div className="p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
              <h3 className="font-medium text-purple-400 mb-2">OSRM Routing</h3>
              <p className="text-sm text-gray-300 mb-3">Calculare rute gratuite</p>
              <Button variant="outline" size="sm" className="text-purple-400 border-purple-700">
                Activează
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 