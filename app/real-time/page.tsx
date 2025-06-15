"use client";

import { motion } from 'framer-motion';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useJsApiLoader } from '@react-google-maps/api';

// Import our new MapView and its types
import MapView, { VehicleWithGps } from '@/components/MapView';

// Import other components
import { IntegrationStatusCard } from "@/components/integration-status-card";
import { LiveAlerts } from "@/components/live-alerts";
import { RouteCalculator } from "@/components/route-calculator";

// Centralize library loading
const libraries: "places"[] = ["places"];

function RealTimePageContent() {
  const [vehicles, setVehicles] = useState<VehicleWithGps[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [routeWaypoints, setRouteWaypoints] = useState<google.maps.LatLngLiteral[]>([]);
  const [focusedVehicle, setFocusedVehicle] = useState<VehicleWithGps | null>(null);

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
    <main className="flex-1 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content: Map */}
          <div className="lg:col-span-2">
            {isLoading ? (
               <div className="h-[600px] w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                <p className="text-gray-500">Loading Vehicle Data & Map...</p>
               </div>
            ) : (
              <MapView 
                isLoaded={isMapScriptLoaded}
                vehicles={vehicles} 
                routeWaypoints={routeWaypoints} 
                focusedVehicle={focusedVehicle} 
              />
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <RouteCalculator isLoaded={isMapScriptLoaded} onCalculate={setRouteWaypoints} />
            <IntegrationStatusCard />
            <LiveAlerts />
          </aside>
        </div>
      </motion.div>
    </main>
  );
}

export default function RealTimePage() {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><p>Loading Page...</p></div>}>
      <RealTimePageContent />
    </Suspense>
  );
} 