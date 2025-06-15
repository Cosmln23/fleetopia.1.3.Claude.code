'use client';

import React, { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { Vehicle, VehicleStatus } from '@prisma/client';

// Define the extended vehicle type, which includes GPS coordinates
export type VehicleWithGps = Vehicle & {
  lat: number;
  lng: number;
  driverName?: string;
  currentRoute?: string;
};

// Define the props for our MapView component
interface MapViewProps {
  isLoaded: boolean; // Receive loading state from parent
  vehicles: VehicleWithGps[];
  focusedVehicle: VehicleWithGps | null;
  // Route waypoints can be complex, for now we handle LatLng objects
  routeWaypoints?: google.maps.LatLngLiteral[]; 
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

const isActiveStatus = (status: VehicleStatus): boolean => {
    return status === VehicleStatus.in_transit || 
           status === VehicleStatus.loading || 
           status === VehicleStatus.unloading;
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


function MapView({ isLoaded, vehicles, focusedVehicle, routeWaypoints }: MapViewProps) {
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithGps | null>(null);

  useEffect(() => {
    if (focusedVehicle && map) {
      // Pan to the focused vehicle, zoom in, and select it
      map.panTo({ lat: focusedVehicle.lat, lng: focusedVehicle.lng });
      map.setZoom(14);
      setSelectedVehicle(focusedVehicle);
    }
  }, [focusedVehicle, map]);
  
  // When a new vehicle is selected (or focused), close the previously selected one
  useEffect(() => {
    if (selectedVehicle) {
       // logic to handle selection change if needed
    }
  }, [selectedVehicle]);


  const onLoad = React.useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance);
  }, []);

  const onUnmount = React.useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return <div className="h-[600px] w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center"><p>Loading Map...</p></div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={5}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        styles: [ // Adding some modern map styling
            {
                "featureType": "poi",
                "stylers": [{ "visibility": "off" }]
            },
            {
                "featureType": "road",
                "elementType": "labels.icon",
                "stylers": [{  "visibility": "off" }]
            },
            {
                 "featureType": "transit",
                 "stylers": [{ "visibility": "off" }]
            }
        ]
      }}
    >
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
          <div className="p-2">
            <h3 className="font-bold text-lg">{selectedVehicle.name}</h3>
            <p>Status: <span className={`font-semibold ${isActiveStatus(selectedVehicle.status) ? 'text-green-600' : 'text-gray-500'}`}>{selectedVehicle.status}</span></p>
            <p>Driver: {selectedVehicle.driverName || 'N/A'}</p>
          </div>
        </InfoWindow>
      )}
      
      {/* Render the route polyline if waypoints are provided */}
      {routeWaypoints && routeWaypoints.length > 0 && (
          <Polyline
              path={routeWaypoints}
              options={{
                  strokeColor: '#FF0000',
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
              }}
          />
      )}
    </GoogleMap>
  );
}

export default React.memo(MapView); 