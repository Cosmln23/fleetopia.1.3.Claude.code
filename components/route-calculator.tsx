"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Trash2, Route, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { Autocomplete } from "@react-google-maps/api";

interface RouteCalculatorProps {
  isLoaded: boolean;
  onCalculate: (waypoints: google.maps.LatLngLiteral[]) => void;
}

// We need to load the places library to use geocoding
const libraries: "places"[] = ["places"];

export function RouteCalculator({ isLoaded, onCalculate }: RouteCalculatorProps) {
  const [waypoints, setWaypoints] = useState<string[]>(["", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use refs to store autocomplete instances
  const autocompleteRefs = useRef<google.maps.places.Autocomplete[]>([]);

  const handleWaypointChange = (index: number, value: string) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index] = value;
    setWaypoints(newWaypoints);
  };

  const handlePlaceSelect = (index: number) => {
    if (autocompleteRefs.current[index]) {
      const place = autocompleteRefs.current[index].getPlace();
      if (place && place.formatted_address) {
        handleWaypointChange(index, place.formatted_address);
      }
    }
  };

  const addWaypoint = () => {
    setWaypoints([...waypoints, ""]);
  };

  const removeWaypoint = (index: number) => {
    // Also remove the corresponding ref
    autocompleteRefs.current.splice(index, 1);
    const newWaypoints = waypoints.filter((_, i) => i !== index);
    setWaypoints(newWaypoints);
  };
  
  const handleCalculate = async () => {
    const nonEmptyWaypoints = waypoints.filter(wp => wp.trim() !== "");
    if (nonEmptyWaypoints.length < 2 || !isLoaded) {
      setError("Please enter at least two points to calculate a route.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const geocoder = new window.google.maps.Geocoder();
      const geocodedWaypointsPromises = nonEmptyWaypoints.map(address =>
        geocoder.geocode({ address }).then(result => ({ result, address }))
      );

      const geocoderResults = await Promise.all(geocodedWaypointsPromises);
      
      const coordinates = geocoderResults.map(({ result, address }) => {
        if (result.results[0]) {
          const location = result.results[0].geometry.location;
          return { lat: location.lat(), lng: location.lng() };
        }
        throw new Error(`Could not find coordinates for: "${address}"`);
      });

      onCalculate(coordinates);

    } catch (e) {
      console.error("Geocoding failed", e);
      setError(e instanceof Error ? e.message : "Failed to geocode addresses.");
      onCalculate([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setWaypoints(["", ""]);
    onCalculate([]);
    setError(null);
  };

  if (!isLoaded) {
    return (
        <Card>
            <CardHeader><CardTitle>Route Planner</CardTitle></CardHeader>
            <CardContent><p>Loading route planner...</p></CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Route className="mr-2 h-5 w-5" />
          Route Planner
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {waypoints.map((waypoint, index) => (
            <div key={index} className="flex items-center space-x-2">
                <div className="relative flex-grow">
                 <Autocomplete
                    onLoad={(autocomplete) => {
                      autocompleteRefs.current[index] = autocomplete;
                    }}
                    onPlaceChanged={() => handlePlaceSelect(index)}
                    // Restrict suggestions to addresses, but across all of Europe/World
                    options={{
                        types: ["address"],
                    }}
                  >
                    <Input
                      placeholder={index === 0 ? "Start Point" : index === waypoints.length - 1 ? "End Point" : `Stop ${index}`}
                      value={waypoint}
                      onChange={(e) => handleWaypointChange(index, e.target.value)}
                      className="pl-8"
                      disabled={isLoading}
                    />
                  </Autocomplete>
                  <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              {waypoints.length > 2 && (
                <Button variant="ghost" size="icon" onClick={() => removeWaypoint(index)} disabled={isLoading}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>
        
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <div className="mt-4 space-y-2">
           <Button variant="outline" size="sm" className="w-full" onClick={addWaypoint} disabled={isLoading}>
              <Plus className="mr-2 h-4 w-4" />
              Add Stop
            </Button>
          <div className="flex justify-between items-center gap-2">
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={clearAll} disabled={isLoading}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
            </Button>
            <Button className="w-full" onClick={handleCalculate} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Calculate Route
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 