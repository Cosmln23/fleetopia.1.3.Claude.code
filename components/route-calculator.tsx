"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Trash2, Route } from "lucide-react";
import { useState } from "react";

interface RouteCalculatorProps {
  onCalculate: (waypoints: string[]) => void;
}

export function RouteCalculator({ onCalculate }: RouteCalculatorProps) {
  const [waypoints, setWaypoints] = useState<string[]>(["", ""]);

  const handleWaypointChange = (index: number, value: string) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index] = value;
    setWaypoints(newWaypoints);
  };

  const addWaypoint = () => {
    setWaypoints([...waypoints, ""]);
  };

  const removeWaypoint = (index: number) => {
    const newWaypoints = waypoints.filter((_, i) => i !== index);
    setWaypoints(newWaypoints);
  };
  
  const handleCalculate = () => {
    // Filter out empty waypoints before calculating
    const nonEmptyWaypoints = waypoints.filter(wp => wp.trim() !== "");
    if (nonEmptyWaypoints.length >= 2) {
      onCalculate(nonEmptyWaypoints);
    } else {
      // Maybe show an error to the user
      console.log("Please enter at least two points to calculate a route.");
    }
  };

  const clearAll = () => {
    setWaypoints(["", ""]);
    onCalculate([]); // Clear the route on the map
  };

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
                <Input
                  placeholder={index === 0 ? "Start Point" : index === waypoints.length - 1 ? "End Point" : `Stop ${index}`}
                  value={waypoint}
                  onChange={(e) => handleWaypointChange(index, e.target.value)}
                  className="pl-8"
                />
                <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              {waypoints.length > 2 && (
                <Button variant="ghost" size="icon" onClick={() => removeWaypoint(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
           <Button variant="outline" size="sm" className="w-full" onClick={addWaypoint}>
              <Plus className="mr-2 h-4 w-4" />
              Add Stop
            </Button>
          <div className="flex justify-between items-center gap-2">
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={clearAll}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
            </Button>
            <Button className="w-full" onClick={handleCalculate}>Calculate Route</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 