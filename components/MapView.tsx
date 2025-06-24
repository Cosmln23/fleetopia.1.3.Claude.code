'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { GoogleMap, Marker, InfoWindow, useGoogleMap, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { Vehicle, VehicleStatus } from '@/types';
import { ROUTE_COLORS } from "@/lib/constants";

// Define the missing GpsData type
interface GpsData {
    latitude: number;
    longitude: number;
    speed: number;
    timestamp: string;
}

// Define the extended vehicle type, which includes GPS coordinates
export type VehicleWithGps = Vehicle & {
  lat: number;
  lng: number;
  driverName?: string;
  currentRoute?: string;
  gpsData: GpsData | null;
};

// Define the props for our MapView component
interface MapViewProps {
  isLoaded: boolean;
  vehicles: VehicleWithGps[];
  focusedVehicle: VehicleWithGps | null;
  directions: google.maps.DirectionsResult | null;
  onMapLoad: (map: google.maps.Map | null) => void;
  selectedRouteIndex: number;
  routeColors: string[]; // Expect the color palette
  coloredLegs: any[]; // Or a more specific type if you have one
}

const containerStyle = {
  width: '100%',
  height: '600px', // Set a fixed height for consistency
  borderRadius: '0.5rem',
};

const defaultCenter = {
  lat: 48.8566, // Paris
  lng: 2.3522
};

const isActiveStatus = (status: VehicleStatus) => {
  return [
    VehicleStatus.in_transit,
    VehicleStatus.en_route,
    VehicleStatus.assigned,
    VehicleStatus.loading,
    VehicleStatus.unloading,
  ].includes(status);
};

// Custom icon paths for different vehicle statuses
const getVehicleIcon = (status: VehicleStatus) => {
    const iconColor = isActiveStatus(status) ? '00C49F' : 'A0A0A0'; // Green for active, Gray for idle
    return {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: `#${iconColor}`,
        fillOpacity: 1,
        strokeColor: 'white',
        strokeWeight: 2,
    };
};

// This new internal component will house all logic that needs access to the map instance.
// It is rendered *inside* GoogleMap, so useGoogleMap() will work correctly here.
function MapEffects({
  directions,
  focusedVehicle,
  setSelectedVehicle,
}: {
  directions: google.maps.DirectionsResult | null;
  focusedVehicle: VehicleWithGps | null;
  setSelectedVehicle: React.Dispatch<React.SetStateAction<VehicleWithGps | null>>;
}) {
  const map = useGoogleMap();

  // Effect to fit the map to the calculated route's bounds
  useEffect(() => {
    if (map && directions && directions.routes && directions.routes.length > 0) {
      const bounds = directions.routes[0].bounds;
      if (bounds) {
        map.fitBounds(bounds, 50);
      }
    }
  }, [directions, map]);

  // Effect to pan to a focused vehicle
  useEffect(() => {
    if (focusedVehicle && map) {
      map.panTo({ lat: focusedVehicle.lat, lng: focusedVehicle.lng });
      map.setZoom(14);
      setSelectedVehicle(focusedVehicle);
    }
  }, [focusedVehicle, map, setSelectedVehicle]);

  // This effect ensures that when the route data is cleared, the polylines are removed.
  useEffect(() => {
    // This is a placeholder to ensure the component re-renders when directions change.
    // The actual clearing logic is handled by the conditional rendering below.
  }, [directions]);

  return null;
}

function MapView({ isLoaded, vehicles, focusedVehicle, directions, onMapLoad, selectedRouteIndex, routeColors, coloredLegs }: MapViewProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithGps | null>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => onMapLoad(mapInstance), [onMapLoad]);
  const onUnmount = useCallback(() => onMapLoad(null), [onMapLoad]);

  // Extract the currently selected route from the response
  const selectedRoute = directions?.routes[selectedRouteIndex];

  const renderPolylines = () => {
    if (!directions) return null;

    return coloredLegs.map((leg, index) => {
      const path = leg.steps.flatMap((step: any) => step.path);
      return (
        <Polyline
          key={index}
          path={path}
          options={{
            strokeColor: ROUTE_COLORS[index],
            strokeOpacity: 0.8,
            strokeWeight: 6,
            geodesic: true,
          }}
        />
      );
    });
  };

  if (!isLoaded) {
    return <div className="h-[600px] w-full animate-pulse rounded-lg bg-[--card] border-0 flex items-center justify-center"><p className="text-[--muted-foreground]">Loading Map...</p></div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={defaultCenter}
      zoom={5}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{ 
        streetViewControl: false,
        fullscreenControl: false,
        mapTypeControl: true, // Re-enable the native map type control
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          position: google.maps.ControlPosition.LEFT_TOP,
        },
      }}
    >
      <MapEffects
        directions={directions}
        focusedVehicle={focusedVehicle}
        setSelectedVehicle={setSelectedVehicle}
      />
      
      {/* Render vehicle markers */}
      {vehicles.map((vehicle) => (
        <Marker
          key={vehicle.id}
          position={{ lat: vehicle.lat, lng: vehicle.lng }}
          icon={getVehicleIcon(vehicle.status)}
          onClick={() => setSelectedVehicle(vehicle)}
        />
      ))}

      {/* Render InfoWindow for the selected vehicle */}
      {selectedVehicle && (
        <InfoWindow
          position={{ lat: selectedVehicle.lat, lng: selectedVehicle.lng }}
          onCloseClick={() => setSelectedVehicle(null)}
        >
          <div className="p-2 bg-[--card] rounded-lg border-0">
            <h3 className="font-bold text-lg text-[--card-foreground]">
              {selectedVehicle.name} ({selectedVehicle.type})
            </h3>
            <p className="text-[--muted-foreground]">
              License: {selectedVehicle.licensePlate}
            </p>
            <p className={`text-sm font-semibold ${
              isActiveStatus(selectedVehicle.status)
                ? 'text-green-400'
                : 'text-yellow-400'
            }`}>
              Status: {selectedVehicle.status.replace('_', ' ')}
            </p>
            {selectedVehicle.driverName && (
              <p className="text-[--muted-foreground]">
                Driver: {selectedVehicle.driverName}
              </p>
            )}
          </div>
        </InfoWindow>
      )}
      
      {renderPolylines()}
    </GoogleMap>
  );
}

export default React.memo(MapView);
