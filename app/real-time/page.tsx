"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useJsApiLoader } from '@react-google-maps/api';

// Import our new MapView and its types
import MapView, { VehicleWithGps } from '@/components/MapView';

// Import other components
import TripPlanner from "@/components/TripPlanner";

// Centralize library loading
const libraries: ("places")[] = ["places"];

const ROUTE_COLORS = ['#FF5733', '#3375FF', '#33FF57', '#F333FF', '#FFC300'];

interface CustomLeg extends google.maps.DirectionsLeg {
  color: string;
}

function RealTimePageContent() {
  const [vehicles, setVehicles] = useState<VehicleWithGps[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [coloredLegs, setColoredLegs] = useState<CustomLeg[]>([]);
  const [focusedVehicle, setFocusedVehicle] = useState<VehicleWithGps | null>(null);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  
  const handleRouteCalculation = (
    result: google.maps.DirectionsResult | null,
    legs: google.maps.DirectionsLeg[]
    ) => {
    setDirectionsResponse(result);
    if (result && legs) {
      const newColoredLegs = legs.map((leg, index) => ({
        ...leg,
        color: ROUTE_COLORS[index % ROUTE_COLORS.length]
      }));
      setColoredLegs(newColoredLegs);
    } else {
      setColoredLegs([]);
    }
  };
  
  const searchParams = useSearchParams();
  const focusVehicleId = searchParams.get('focus');

  // Centralized Google Maps API script loader
  const { isLoaded: isMapScriptLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script', // A single ID for the entire page
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/real-time/data');
        if (!response.ok) {
          throw new Error('Failed to fetch real-time data');
        }
        const data = await response.json();
        const fetchedVehicles = data.vehicles || [];
        setVehicles(fetchedVehicles);

        if (focusVehicleId) {
          const vehicleToFocus = fetchedVehicles.find((v: VehicleWithGps) => v.id === focusVehicleId);
          if (vehicleToFocus) {
            setFocusedVehicle(vehicleToFocus);
          }
        }

      } catch (error) {
        console.error(error);
        setVehicles([]);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); 

    return () => clearInterval(interval);
  }, [focusVehicleId]);

  if (loadError) {
    return <div className="h-screen w-full flex items-center justify-center text-red-500"><p>Error loading Google Maps script. Please check the API key.</p></div>
  }

  const isLoading = isLoadingData || !isMapScriptLoaded;

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 bg-background text-foreground h-screen">
      <div className="h-full w-full max-w-full mx-auto grid grid-cols-1 xl:grid-cols-8 gap-6 xl:gap-8">
        
        {/* --- Map Column --- */}
        <div className="xl:col-span-5 h-full w-full rounded-xl overflow-hidden shadow-lg">
          {isLoading ? (
            <div className="h-full w-full animate-pulse bg-card flex items-center justify-center">
              <p className="text-muted-foreground">Loading Map...</p>
            </div>
          ) : (
            <MapView 
              key={JSON.stringify(directionsResponse)}
              isLoaded={isMapScriptLoaded}
              vehicles={vehicles} 
              directions={directionsResponse} 
              focusedVehicle={focusedVehicle}
              onMapLoad={() => {}}
              coloredLegs={coloredLegs}
              selectedRouteIndex={selectedRouteIndex}
              routeColors={ROUTE_COLORS}
            />
          )}
        </div>

        {/* --- Control Panel Column --- */}
        <aside className="xl:col-span-3 h-full">
            <TripPlanner
              isScriptLoaded={isMapScriptLoaded}
              onRouteCalculated={handleRouteCalculation}
            />
        </aside>

      </div>
    </div>
  );
}

export default function RealTimePage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><p>Loading Page...</p></div>}>
      <RealTimePageContent />
    </Suspense>
  );
} 