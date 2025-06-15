'use client';

import React, { useState, useEffect, useCallback } from "react";
import { MapIcon, Route, X, ArrowUp, ArrowDown } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ROUTE_COLORS } from "@/lib/constants";

interface TripPlannerProps {
  onRouteCalculated: (
    directions: google.maps.DirectionsResult | null,
    legs: google.maps.DirectionsLeg[]
  ) => void;
  isScriptLoaded: boolean;
}

interface Stop {
  id: string;
  value: string;
}

interface LegInfo {
  start_address: string;
  end_address: string;
  distance: string;
  duration: string;
}

interface TotalSummary {
    distance: string;
    duration: string;
}

const TripPlanner: React.FC<TripPlannerProps> = ({
  onRouteCalculated,
  isScriptLoaded,
}) => {
  const [stops, setStops] = useState<Stop[]>([
    { id: "start", value: "" },
    { id: "end", value: "" },
  ]);
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const [legDetails, setLegDetails] = useState<LegInfo[]>([]);
  const [totalSummary, setTotalSummary] = useState<TotalSummary | null>(null);
  const [autocompleteService, setAutocompleteService] =
    useState<google.maps.places.AutocompleteService | null>(null);

  useEffect(() => {
    if (isScriptLoaded && window.google && window.google.maps) {
      setAutocompleteService(new window.google.maps.places.AutocompleteService());
    }
  }, [isScriptLoaded]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    stopId: string
  ) => {
    const value = e.target.value;
    const newStops = stops.map((s) => (s.id === stopId ? { ...s, value } : s));
    setStops(newStops);
    setActiveInput(stopId);

    if (value.length > 2 && autocompleteService) {
      autocompleteService.getPlacePredictions(
        { input: value },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            setSuggestions(predictions || []);
          }
        }
      );
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (
    prediction: google.maps.places.AutocompletePrediction,
    stopId: string
  ) => {
    const newStops = stops.map((s) =>
      s.id === stopId ? { ...s, value: prediction.description } : s
    );
    setStops(newStops);
    setSuggestions([]);
    setActiveInput(null);
  };
  
  const addStop = () => {
    if (stops.length >= 7) {
      toast.warning("Maximum number of stops reached (7).");
      return;
    }
    const newStop: Stop = { id: uuidv4(), value: "" };
    const newStops = [...stops];
    newStops.splice(stops.length - 1, 0, newStop);
    setStops(newStops);
  };

  const removeStop = (stopId: string) => {
    if (stops.length <= 2) return;
    const newStops = stops.filter((s) => s.id !== stopId);
    setStops(newStops);
    recalculateRoute(newStops);
  };

  const moveStop = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === stops.length - 1)) {
        return; // Cannot move first item up or last item down
    }
    const newStops = [...stops];
    const item = newStops.splice(index, 1)[0];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    newStops.splice(newIndex, 0, item);
    setStops(newStops);
    recalculateRoute(newStops);
  };

  const calculateRoute = async () => {
    recalculateRoute(stops);
  };

  const recalculateRoute = useCallback(async (currentStops: Stop[]) => {
    if (currentStops.some((stop) => stop.value === "")) {
        // If we are clearing, we still want to update the map
        onRouteCalculated(null, []);
        setLegDetails([]);
        setTotalSummary(null);
        return;
    }
    if (currentStops.length < 2) return;

    const directionsService = new google.maps.DirectionsService();
    const origin = currentStops[0].value;
    const destination = currentStops[currentStops.length - 1].value;
    const waypoints = currentStops
      .slice(1, -1)
      .map((stop) => ({ location: stop.value, stopover: true }));

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const route = result.routes[0];
          let totalDistance = 0;
          let totalDuration = 0;

          route.legs.forEach(leg => {
              totalDistance += leg.distance?.value || 0;
              totalDuration += leg.duration?.value || 0;
          });

          setTotalSummary({
              distance: `${(totalDistance / 1000).toFixed(0)} km`,
              duration: `${Math.floor(totalDuration / 86400)}d ${Math.round((totalDuration % 86400) / 3600)}h`
          });
          
          // Correctly map over ALL legs from the response
          const allLegs = route.legs.map(leg => ({
            start_address: leg.start_address,
            end_address: leg.end_address,
            distance: leg.distance?.text || 'N/A',
            duration: leg.duration?.text || 'N/A',
          }));
          setLegDetails(allLegs);

          onRouteCalculated(result, route.legs);
        } else {
          onRouteCalculated(null, []);
          setLegDetails([]);
          setTotalSummary(null);
        }
      }
    );
  }, [onRouteCalculated]);

  const clearAll = () => {
    const clearedStops = [{ id: "start", value: "" }, { id: "end", value: "" }];
    setStops(clearedStops);
    setLegDetails([]);
    setTotalSummary(null);
    onRouteCalculated(null, []);
  };

  const getStopLabel = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, ...
  };
  
  const getLegLabel = (index: number) => `${getStopLabel(index)} → ${getStopLabel(index + 1)}`;

  if (!isScriptLoaded) {
    return (
        <Card>
            <CardHeader><CardTitle>Loading Planner...</CardTitle></CardHeader>
        </Card>
    )
  }

  return (
    <Card className="bg-[--card] text-[--card-foreground] shadow-lg border-0">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <MapIcon className="mr-3 h-6 w-6 text-[--accent]" />
          Trip Planner
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {stops.map((stop, index) => (
            <div key={stop.id} className="relative group">
              <div className="flex items-center space-x-2">
                <span 
                  className="font-bold text-lg w-6 text-center"
                  style={{ color: ROUTE_COLORS[index] }}
                >
                  {getStopLabel(index)}
                </span>
                <Input
                  type="text"
                  placeholder={`Stop ${getStopLabel(index)}`}
                  value={stop.value}
                  onChange={(e) => handleInputChange(e, stop.id)}
                  onFocus={() => setActiveInput(stop.id)}
                  className="flex-grow border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <div className="flex space-x-0">
                    <Button variant="ghost" size="icon" onClick={() => moveStop(index, 'up')} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => moveStop(index, 'down')} disabled={index === stops.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                    </Button>
                    {stops.length > 2 && (
                        <Button variant="ghost" size="icon" onClick={() => removeStop(stop.id)} className="text-red-500">
                            <X className="h-4 w-4"/>
                        </Button>
                    )}
                </div>
              </div>
              {activeInput === stop.id && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-[--popover] text-[--popover-foreground] rounded-md shadow-lg max-h-60 overflow-y-auto ml-8">
                  {suggestions.map((s) => (
                    <div
                      key={s.place_id}
                      onClick={() => handleSuggestionClick(s, stop.id)}
                      className="px-4 py-2 cursor-pointer hover:bg-[--accent-hover]"
                    >
                      {s.description}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-4">
            <Button onClick={addStop} disabled={stops.length >= 7}>
              Add Stop
            </Button>
            <div className="space-x-2">
                <Button onClick={calculateRoute} className="bg-blue-600 hover:bg-blue-700">
                    <Route className="mr-2 h-4 w-4" /> Calculate
                </Button>
                <Button onClick={clearAll} variant="destructive">Clear All</Button>
            </div>
        </div>

        {legDetails.length > 0 && (
          <>
            <Separator className="my-4" />
            <h3 className="text-lg font-semibold mb-2">Trip Summary</h3>
            
            <div className="flex justify-between font-bold text-md mb-3">
              <span>Total</span>
              <span>{totalSummary?.distance} ({totalSummary?.duration})</span>
            </div>
            
            <ScrollArea className="h-40">
              {legDetails.map((leg, index) => (
                <div key={index} className="mb-3 p-2 rounded-md bg-[--secondary]/50">
                  <p 
                    className="font-bold"
                    style={{ color: ROUTE_COLORS[index] }}
                  >
                    {getLegLabel(index)}: {leg.start_address}
                  </p>
                  <p className="text-sm text-[--muted-foreground] -mt-1">{leg.end_address}</p>
                  <div className="flex justify-between text-sm mt-1">
                    <span>{leg.distance}</span>
                    <span>{leg.duration}</span>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TripPlanner; 