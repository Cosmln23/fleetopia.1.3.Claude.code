"use client";

import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import { useMap } from "react-leaflet";
import { useEffect, useRef } from "react";

// In L.Routing.control, waypoints are L.Routing.Waypoint objects, which have a latLng property.
// However, the geocoder service works with strings, so we pass strings to the component.
// The component will then create L.latLng placeholders which the geocoder will populate.

interface RoutingMachineProps {
  waypoints: string[];
}

const RoutingMachine: React.FC<RoutingMachineProps> = ({ waypoints }) => {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (!map || waypoints.length < 2) {
       // If there's an existing control, remove it when waypoints are cleared
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      return;
    };

    const leafletWaypoints = waypoints.map(wp => {
      // Create a waypoint with a placeholder latLng and the name for the geocoder
      const waypoint = new L.Routing.Waypoint(L.latLng(0,0), wp, {});
      return waypoint;
    });

    // Remove the old control if it exists
    if (routingControlRef.current) {
      // If the control exists, just update the waypoints to avoid re-creating it
      routingControlRef.current.setWaypoints(leafletWaypoints);
      return;
    }

    const routingControl = L.Routing.control({
      waypoints: leafletWaypoints,
      routeWhileDragging: false, // More performant
      geocoder: (L as any).Control.Geocoder.nominatim(),
      lineOptions: {
        styles: [{ color: '#6366f1', opacity: 0.8, weight: 6 }],
        extendToWaypoints: true,
        missingRouteTolerance: 100
      },
      show: false, // Do not show the default instructions panel
      addWaypoints: false, // Do not allow adding waypoints by clicking on the map
      fitSelectedRoutes: 'smart',
      // We can customize the marker icons later if needed
    }).addTo(map);

    routingControlRef.current = routingControl;

    // Cleanup function to remove the control when the component unmounts
    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, waypoints]);

  return null; // This component does not render anything itself
};

export default RoutingMachine; 