'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, MapPin, Navigation, Truck, RefreshCw } from 'lucide-react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { toast } from 'sonner';

interface Vehicle {
  id: string;
  name: string;
  type: string;
  licensePlate: string;
  driverName: string;
  status: string;
  lat: number;
  lng: number;
  gpsProvider?: string;
  gpsEnabled?: boolean;
}

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '12px'
};

const defaultCenter = {
  lat: 44.4268,
  lng: 26.1025
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'all',
      stylers: [{ saturation: -20 }]
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [{ color: '#374151' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry.fill',
      stylers: [{ color: '#1e293b' }]
    }
  ]
};

export default function FreeMapsPage() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places']
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [filterGpsOnly, setFilterGpsOnly] = useState(false);

  useEffect(() => {
    fetchVehicles();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchVehicles();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchVehicles = async () => {
    try {
      // Try to get real-time tracking data first
      const trackingResponse = await fetch('/api/vehicles/tracking');
      if (trackingResponse.ok) {
        const trackingData = await trackingResponse.json();
        if (trackingData.success && trackingData.data.vehicles.length > 0) {
          // Convert tracking data to vehicle format
          const trackingVehicles = trackingData.data.vehicles.map((loc: any) => ({
            id: loc.vehicleId,
            name: `Vehicle ${loc.vehicleId}`,
            lat: loc.latitude,
            lng: loc.longitude,
            status: loc.status,
            gpsEnabled: true,
            gpsProvider: 'active'
          }));
          setVehicles(trackingVehicles);
          setLoading(false);
          return;
        }
      }

      // Fallback to regular vehicle API
      const response = await fetch('/api/vehicles');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setVehicles(data.data.vehicles || data);
        } else {
          setVehicles(data);
        }
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const getVisibleVehicles = () => {
    let filtered = vehicles.filter(v => v.lat && v.lng);
    if (filterGpsOnly) {
      filtered = filtered.filter(v => v.gpsEnabled && v.gpsProvider);
    }
    return filtered;
  };

  const getVehicleIcon = (vehicle: Vehicle) => {
    const colors = {
      idle: '#64748b',
      in_transit: '#22c55e',
      loading: '#f59e0b',
      unloading: '#ef4444',
      maintenance: '#8b5cf6',
      assigned: '#3b82f6',
      out_of_service: '#6b7280'
    };
    return colors[vehicle.status as keyof typeof colors] || '#64748b';
  };

  const centerOnVehicle = (vehicle: Vehicle) => {
    setMapCenter({ lat: vehicle.lat, lng: vehicle.lng });
    setSelectedVehicle(vehicle);
  };

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="bg-[--card]">
            <CardContent className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-red-900/50 rounded-lg flex items-center justify-center mb-6">
                <MapPin className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-200 mb-4">
                Maps Loading Error
              </h3>
              <p className="text-slate-300 mb-6 max-w-md mx-auto">
                Failed to load Google Maps. Please check your API key configuration.
              </p>
              <Badge variant="outline" className="text-red-400 border-red-400">
                Google Maps API Key Required
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🗺️ Fleet Live Maps
            </h1>
            <p className="text-xl text-slate-300">
              Loading Google Maps...
            </p>
          </div>
          <Card className="bg-[--card]">
            <CardContent className="text-center py-12">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-300">Initializing maps...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const visibleVehicles = getVisibleVehicles();

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🗺️ Fleet Live Maps
          </h1>
          <p className="text-xl text-slate-300">
            Real-time vehicle tracking with Google Maps integration
          </p>
        </div>

        {/* Controls */}
        <Card className="bg-[--card]">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center justify-between">
              <div className="flex items-center">
                <Navigation className="w-5 h-5 mr-2 text-blue-400" />
                Map Controls
              </div>
              <Badge variant="outline" className="text-green-400 border-green-400">
                {visibleVehicles.length} vehicles visible
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-slate-300">Filter:</label>
                <Select 
                  value={filterGpsOnly ? 'gps-only' : 'all'} 
                  onValueChange={(value) => setFilterGpsOnly(value === 'gps-only')}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vehicles</SelectItem>
                    <SelectItem value="gps-only">GPS-Enabled Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                onClick={fetchVehicles}
                variant="outline"
                size="sm"
                className="text-slate-300 border-slate-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </Button>
              
              <Button
                onClick={() => setMapCenter(defaultCenter)}
                variant="outline"
                size="sm"
                className="text-slate-300 border-slate-600"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Reset View
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="bg-[--card]">
          <CardContent className="p-6">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={10}
              options={mapOptions}
            >
              {visibleVehicles.map((vehicle) => (
                <Marker
                  key={vehicle.id}
                  position={{ lat: vehicle.lat, lng: vehicle.lng }}
                  onClick={() => setSelectedVehicle(vehicle)}
                  icon={{
                    path: 'M29.395,0H17.636c-3.117,0-5.643,3.467-5.643,6.584v34.804c0,3.116,2.526,5.644,5.643,5.644h11.759c3.116,0,5.644-2.527,5.644-5.644V6.584C35.037,3.467,32.511,0,29.395,0z M34.05,14.188v11.665l-2.729,0.351v-4.806L34.05,14.188z M32.618,10.773c-1.016,3.9-2.219,8.51-2.219,8.51H16.631s-1.203-4.61-2.219-8.51C14.412,10.773,23.293,7.755,32.618,10.773z M15.741,21.284v4.806l-2.73-0.351V14.188L15.741,21.284z M13.011,37.94V27.579l2.73,0.343v8.196L13.011,37.94z M14.568,40.886l2.218-3.336h13.424l2.219,3.336H14.568z M31.321,35.805v-7.872l2.729-0.343v10.361L31.321,35.805z',
                    fillColor: getVehicleIcon(vehicle),
                    fillOpacity: 0.8,
                    strokeColor: '#ffffff',
                    strokeWeight: 1,
                    scale: 0.8
                  }}
                />
              ))}
              
              {selectedVehicle && (
                <InfoWindow
                  position={{ lat: selectedVehicle.lat, lng: selectedVehicle.lng }}
                  onCloseClick={() => setSelectedVehicle(null)}
                >
                  <div className="p-2 min-w-48">
                    <div className="flex items-center mb-2">
                      <Truck className="w-4 h-4 mr-2 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">{selectedVehicle.name}</h3>
                    </div>
                    <div className="space-y-1 text-sm text-gray-700">
                      <p><strong>License:</strong> {selectedVehicle.licensePlate}</p>
                      <p><strong>Driver:</strong> {selectedVehicle.driverName}</p>
                      <p><strong>Status:</strong> 
                        <Badge 
                          variant="outline" 
                          className="ml-1 text-xs"
                          style={{ color: getVehicleIcon(selectedVehicle) }}
                        >
                          {selectedVehicle.status.replace('_', ' ')}
                        </Badge>
                      </p>
                      {selectedVehicle.gpsProvider && (
                        <p><strong>GPS:</strong> {selectedVehicle.gpsProvider}</p>
                      )}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </CardContent>
        </Card>

        {/* Vehicle List */}
        <Card className="bg-[--card]">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-green-400" />
              Fleet Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-2" />
                <p className="text-slate-300">Loading fleet data...</p>
              </div>
            ) : visibleVehicles.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 mb-2">
                  No vehicles with GPS coordinates found
                </p>
                <p className="text-slate-400 text-sm">
                  Add vehicles in Fleet Management with GPS data to see them on the map
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleVehicles.map((vehicle) => (
                  <div 
                    key={vehicle.id}
                    className="p-4 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer transition-colors"
                    onClick={() => centerOnVehicle(vehicle)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-200">{vehicle.name}</h4>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                        style={{ color: getVehicleIcon(vehicle) }}
                      >
                        {vehicle.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-1">{vehicle.licensePlate}</p>
                    <p className="text-sm text-slate-400 mb-2">{vehicle.driverName}</p>
                    {vehicle.gpsProvider && (
                      <div className="flex items-center text-xs text-green-400">
                        <Navigation className="w-3 h-3 mr-1" />
                        GPS: {vehicle.gpsProvider}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
