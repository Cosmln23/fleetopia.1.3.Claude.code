"use client";

import { useState } from 'react';
import { Vehicle } from '@prisma/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, MapPin, Activity, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SimulatorCardProps {
  vehicle: Vehicle;
}

// Helper to parse location from Prisma's JSON type
const parseLocation = (location: any) => {
  if (typeof location === 'object' && location !== null && 'lat' in location && 'lng' in location) {
    return { lat: Number(location.lat) || 0, lng: Number(location.lng) || 0 };
  }
  return { lat: 0, lng: 0 };
};

export function SimulatorCard({ vehicle }: SimulatorCardProps) {
  const { toast } = useToast();
  const initialLocation = parseLocation(vehicle.location);

  const [status, setStatus] = useState(vehicle.status);
  const [lat, setLat] = useState(initialLocation.lat.toString());
  const [lng, setLng] = useState(initialLocation.lng.toString());
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const updatedData = {
      status,
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
    };

    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update vehicle');
      }

      toast({
        title: "Update Successful",
        description: `${vehicle.name} has been updated.`,
        className: "bg-green-500 text-white",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="mr-2" />
            {vehicle.name}
          </CardTitle>
          <CardDescription>{vehicle.licensePlate}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`status-${vehicle.id}`} className="flex items-center"><Activity className="mr-2 h-4 w-4" />Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id={`status-${vehicle.id}`}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white border-gray-700">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center"><MapPin className="mr-2 h-4 w-4" />Location</Label>
            <div className="flex gap-2">
              <Input
                id={`lat-${vehicle.id}`}
                placeholder="Latitude"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                type="number"
                step="any"
                required
              />
              <Input
                id={`lng-${vehicle.id}`}
                placeholder="Longitude"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                type="number"
                step="any"
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 
