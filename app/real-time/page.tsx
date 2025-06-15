"use client";

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import L from "leaflet";

// Import components
import { IntegrationStatusCard } from "@/components/integration-status-card";
import { LiveAlerts } from "@/components/live-alerts";
import { RouteCalculator } from "@/components/route-calculator";
import { Vehicle } from '@prisma/client';

// Re-defining the extended type here to solve the type mismatch
type VehicleWithGps = Vehicle & {
  lat: number;
  lng: number;
  driverName?: string;
  currentRoute?: string;
};

// Dynamically import the map component
const RealTimeVehicleMap = dynamic(() => import('@/components/real-time-vehicle-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
      <p className="text-gray-500">Loading Map...</p>
    </div>
  )
});

function RealTimePageContent() {
  const [vehicles, setVehicles] = useState<VehicleWithGps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [routeWaypoints, setRouteWaypoints] = useState<(string | L.LatLng)[]>([]);
  const [focusedVehicle, setFocusedVehicle] = useState<VehicleWithGps | null>(null);

  const searchParams = useSearchParams();
  const focusVehicleId = searchParams.get('focus');

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
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); 

    return () => clearInterval(interval);
  }, [focusVehicleId]);

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
                <p className="text-gray-500">Loading Vehicle Data...</p>
               </div>
            ) : (
              <RealTimeVehicleMap vehicles={vehicles} routeWaypoints={routeWaypoints} focusedVehicle={focusedVehicle} />
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <RouteCalculator onCalculate={setRouteWaypoints} />
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
    <Suspense fallback={<div>Loading...</div>}>
      <RealTimePageContent />
    </Suspense>
  );
} 