"use client";

import { useState } from 'react';
import { Vehicle, VehicleStatus } from '@prisma/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, MapPin, Activity, Save } from "lucide-react";
import { toast } from "sonner";

interface SimulatorCardProps {
  vehicle: Vehicle;
}

// Helper to get coordinates from Vehicle lat/lng properties
const getInitialCoordinates = (vehicle: Vehicle) => {
  return { 
    lat: vehicle.lat || 0, 
    lng: vehicle.lng || 0 
  };
};

export function SimulatorCard({ vehicle }: SimulatorCardProps) {

  const initialLocation = getInitialCoordinates(vehicle);

  const [status, setStatus] = useState<VehicleStatus>(vehicle.status);
  const [lat, setLat] = useState(initialLocation.lat.toString());
  const [lng, setLng] = useState(initialLocation.lng.toString());
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusChange = (value: string) => {
    setStatus(value as VehicleStatus);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const updatedData = {
      status,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
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

      toast.success(`✅ ${vehicle.name} has been updated.`);
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
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
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger id={`status-${vehicle.id}`}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white border-gray-700">
                <SelectItem value="idle">Idle</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="en_route">En Route</SelectItem>
                <SelectItem value="loading">Loading</SelectItem>
                <SelectItem value="unloading">Unloading</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="out_of_service">Out of Service</SelectItem>
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
