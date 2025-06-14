'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Vehicle } from '@prisma/client';
import RoutingMachine from './routing-machine';

// This is a temporary type definition until we can get a centralized one.
// It helps ensure the map component knows about the extra properties.
type VehicleWithGps = Vehicle & {
  lat: number;
  lng: number;
  driverName?: string;
  currentRoute?: string;
};

interface RealTimeVehicleMapProps {
  vehicles: VehicleWithGps[];
  routeWaypoints: (string | L.LatLng)[];
}

const createCustomIcon = (status: string) => {
  const color = status === 'active' ? '#22c55e' :
                status === 'idle' ? '#eab308' :
                status === 'maintenance' ? '#ef4444' : '#6b7280';

  if (typeof window !== 'undefined') {
    const L = require('leaflet');
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
            <circle cx="17" cy="18" r="2"/>
            <circle cx="7" cy="18" r="2"/>
          </svg>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  }
  return null;
};

const RealTimeVehicleMap: React.FC<RealTimeVehicleMapProps> = ({ vehicles, routeWaypoints }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markers = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        center: [51.505, 10.5],
        zoom: 6,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(mapInstance.current);
    }
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    if (vehicles && Array.isArray(vehicles)) {
      vehicles.forEach(vehicle => {
        if (typeof vehicle.lat !== 'number' || typeof vehicle.lng !== 'number') {
          console.warn('Skipping vehicle with invalid coordinates:', vehicle);
          return;
        }
        
        const icon = createCustomIcon(vehicle.status);
        const marker = L.marker([vehicle.lat, vehicle.lng], { icon }).addTo(mapInstance.current!);
        marker.bindPopup(
          `<div class="text-sm">
            <p class="font-bold">${vehicle.licensePlate}</p>
            <p>Driver: ${vehicle.driverName || 'N/A'}</p>
            <p>Route: ${vehicle.currentRoute || 'N/A'}</p>
            <p>Status: <span class="capitalize">${vehicle.status}</span></p>
          </div>`
        );
        markers.current.push(marker);
      });
    }

  }, [vehicles]);

  return (
    <div ref={mapRef} style={{ height: '600px', width: '100%' }} className="bg-slate-800 rounded-lg relative z-0">
      {routeWaypoints && routeWaypoints.length > 0 && <RoutingMachine waypoints={routeWaypoints} />}
    </div>
  );
};

export default RealTimeVehicleMap; 