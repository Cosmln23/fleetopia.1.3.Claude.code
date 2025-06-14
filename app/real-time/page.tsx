"use client";

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
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

export default function RealTimePage() {
  const [vehicles, setVehicles] = useState<VehicleWithGps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [routeWaypoints, setRouteWaypoints] = useState<(string | L.LatLng)[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/real-time/data');
        if (!response.ok) {
          throw new Error('Failed to fetch real-time data');
        }
        const data = await response.json();
        setVehicles(data.vehicles || []);
      } catch (error) {
        console.error(error);
        setVehicles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); // Refresh data every 15 seconds

    return () => clearInterval(interval);
  }, []);

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
              <RealTimeVehicleMap vehicles={vehicles} routeWaypoints={routeWaypoints} />
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