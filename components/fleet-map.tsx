'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { Vehicle } from '@/app/fleet-management/page';

// Fix for default icon issue with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface FleetMapProps {
  vehicles: Vehicle[];
  onVehicleClick: (vehicle: Vehicle) => void;
  focusedVehicle: Vehicle | null;
}

const MapFocusController = ({ vehicle }: { vehicle: Vehicle | null }) => {
  const map = useMap();
  useEffect(() => {
    if (vehicle && vehicle.lat && vehicle.lng && typeof vehicle.lat === 'number' && typeof vehicle.lng === 'number') {
      map.flyTo([vehicle.lat, vehicle.lng], 15, {
        animate: true,
        duration: 1,
      });
    }
  }, [vehicle, map]);

  return null;
};

export function FleetMap({ vehicles, onVehicleClick, focusedVehicle }: FleetMapProps) {
  const defaultPosition: [number, number] = [46.770439, 23.591423]; // Default to Cluj-Napoca

  // Filter vehicles that have valid coordinates
  const vehiclesWithCoordinates = vehicles.filter(vehicle => 
    vehicle.lat && vehicle.lng && 
    typeof vehicle.lat === 'number' && 
    typeof vehicle.lng === 'number'
  );

  return (
    <MapContainer center={defaultPosition} zoom={7} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapFocusController vehicle={focusedVehicle} />
      {vehiclesWithCoordinates.map(vehicle => (
        <Marker 
          key={vehicle.id} 
          position={[vehicle.lat as number, vehicle.lng as number]}
          eventHandlers={{
            click: () => {
              onVehicleClick(vehicle);
            },
          }}
        >
          <Popup>
            <strong>{vehicle.name}</strong><br />
            {vehicle.licensePlate} <br />
            Status: {vehicle.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
} 
