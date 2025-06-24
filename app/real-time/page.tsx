"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useJsApiLoader } from '@react-google-maps/api';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
  const [isDemo, setIsDemo] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  
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
        setHasError(false);
        const response = await fetch('/api/real-time/data');
        const data = await response.json();
        
        // Handle both successful and fallback responses
        const fetchedVehicles = data.vehicles || [];
        setVehicles(fetchedVehicles);
        setIsDemo(data.isDemo || false);
        setStatusMessage(data.message || '');
        
        // Show error message if there was an API error but we got fallback data
        if (data.error) {
          console.warn('API Warning:', data.error);
          setHasError(true);
        }

        if (focusVehicleId) {
          const vehicleToFocus = fetchedVehicles.find((v: VehicleWithGps) => v.id === focusVehicleId);
          if (vehicleToFocus) {
            setFocusedVehicle(vehicleToFocus);
          }
        }

      } catch (error) {
        console.error('Fetch error:', error);
        setHasError(true);
        setStatusMessage('Unable to load vehicle data. Please check your connection.');
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
      {/* Status Banner */}
      {(isDemo || hasError || statusMessage) && (
        <div className={`mb-4 p-3 rounded-lg border-0 ${
          hasError 
            ? 'bg-[--card] text-yellow-300' 
            : isDemo 
              ? 'bg-[--card] text-blue-300'
              : 'bg-[--card] text-green-300'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {hasError ? (
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : isDemo ? (
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">
                {hasError && 'Warning: '}{statusMessage}
                {isDemo && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-600/20 text-blue-300 border-0">
                    Demo Mode
                  </span>
                )}
              </p>
            </div>
            {isDemo && (
              <div className="ml-4">
                <Link href="/fleet-management">
                  <Button size="sm" variant="outline" className="text-xs border-0">
                    Add Vehicles
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="h-full w-full max-w-full mx-auto grid grid-cols-1 xl:grid-cols-8 gap-6 xl:gap-8">
        
        {/* --- Map Column --- */}
        <div className="xl:col-span-5 h-full w-full rounded-xl overflow-hidden bg-[--card] shadow-sm shadow-blue-500/20 wave-hover">
          {isLoading ? (
                          <div className="h-full w-full animate-pulse bg-[--card] flex flex-col items-center justify-center">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="text-muted-foreground text-lg">Loading Real-time Data...</p>
              <p className="text-muted-foreground text-sm mt-2">
                {isLoadingData ? 'Fetching vehicle data...' : 'Loading map...'}
              </p>
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
