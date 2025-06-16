'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Re-using the Vehicle type from the management page
// A centralized types file would be a good refactor for later
import type { Vehicle } from '../app/fleet-management/page';

interface AddVehicleFormProps {
  onVehicleAdded: () => void;
  initialData?: Vehicle | null;
}

export function AddVehicleForm({ onVehicleAdded, initialData }: AddVehicleFormProps) {
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    name: '',
    type: 'Truck',
    licensePlate: '',
    driverName: '',
    status: 'idle',
    currentRoute: '',
    locationType: 'MANUAL_COORDS',
    manualLocationAddress: '',
    lat: 0,
    lng: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isEditMode && initialData) {
      setFormData({
        ...initialData,
        lat: initialData.lat ?? 0,
        lng: initialData.lng ?? 0,
        manualLocationAddress: initialData.manualLocationAddress ?? '',
      });
    } else {
      // Reset to default for a new vehicle form
      setFormData({
        name: '',
        type: 'Truck',
        licensePlate: '',
        driverName: '',
        status: 'idle',
        currentRoute: '',
        locationType: 'MANUAL_COORDS',
        manualLocationAddress: '',
        lat: 0,
        lng: 0,
      });
    }
  }, [initialData, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'lat' || name === 'lng') {
      const numericValue = parseFloat(value);
      if (value === '' || !isNaN(numericValue)) {
        setFormData((prev: Partial<Vehicle>) => ({ ...prev, [name]: value === '' ? '' : numericValue }));
      }
    } else {
      setFormData((prev: Partial<Vehicle>) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: Partial<Vehicle>) => ({ ...prev, [name]: value }));
  };
  
  const handleLocationTypeChange = (value: string) => {
    setFormData(prev => {
      const newState: Partial<Vehicle> = { ...prev, locationType: value as any };
      // Clear out the other location type's data to avoid confusion
      if (value === 'MANUAL_COORDS') {
        newState.manualLocationAddress = '';
      } else if (value === 'MANUAL_ADDRESS') {
        newState.lat = 0;
        newState.lng = 0;
      }
      return newState;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!formData.name || !formData.licensePlate || !formData.driverName) {
      toast.error('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    const apiEndpoint = isEditMode ? `/api/vehicles/${initialData.id}` : '/api/vehicles';
    const httpMethod = isEditMode ? 'PUT' : 'POST';
    const successMessage = isEditMode ? 'Vehicle updated successfully!' : 'Vehicle added successfully!';
    const errorMessage = isEditMode ? 'Failed to update vehicle' : 'Failed to create vehicle';

    try {
      const response = await fetch(apiEndpoint, {
        method: httpMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorMessage);
      }

      toast.success(successMessage);
      onVehicleAdded();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
        <DialogDescription>
          {isEditMode 
            ? 'Update the details for this vehicle.' 
            : 'Fill in the details below to add a new vehicle to your fleet.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3 bg-slate-800 border-slate-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="licensePlate" className="text-right">License Plate</Label>
            <Input id="licensePlate" name="licensePlate" value={formData.licensePlate} onChange={handleChange} className="col-span-3 bg-slate-800 border-slate-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="driverName" className="text-right">Driver</Label>
            <Input id="driverName" name="driverName" value={formData.driverName} onChange={handleChange} className="col-span-3 bg-slate-800 border-slate-600" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">Type</Label>
            <Select name="type" onValueChange={(value) => handleSelectChange('type', value)} defaultValue={formData.type}>
                <SelectTrigger className="col-span-3 bg-slate-800 border-slate-600">
                    <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    <SelectItem value="Truck">Truck</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                    <SelectItem value="Car">Car</SelectItem>
                </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <Select name="status" onValueChange={(value) => handleSelectChange('status', value)} defaultValue={formData.status}>
                <SelectTrigger className="col-span-3 bg-slate-800 border-slate-600">
                    <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    <SelectItem value="idle">Idle</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="border-t border-slate-700 my-2 col-span-4"></div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="locationType" className="text-right">Location Method</Label>
            <Select name="locationType" onValueChange={handleLocationTypeChange} defaultValue={formData.locationType}>
                <SelectTrigger className="col-span-3 bg-slate-800 border-slate-600">
                    <SelectValue placeholder="Select location method" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    <SelectItem value="MANUAL_COORDS">Manual Coordinates</SelectItem>
                    <SelectItem value="MANUAL_ADDRESS">Manual Address</SelectItem>
                    {/* <SelectItem value="GPS_API" disabled>GPS API (Coming Soon)</SelectItem> */}
                </SelectContent>
            </Select>
          </div>

          {formData.locationType === 'MANUAL_COORDS' && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lat" className="text-right">Latitude</Label>
                  <Input id="lat" name="lat" type="number" value={formData.lat ?? ''} onChange={handleChange} className="col-span-3 bg-slate-800 border-slate-600" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lng" className="text-right">Longitude</Label>
                  <Input id="lng" name="lng" type="number" value={formData.lng ?? ''} onChange={handleChange} className="col-span-3 bg-slate-800 border-slate-600" />
              </div>
            </>
          )}

          {formData.locationType === 'MANUAL_ADDRESS' && (
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="manualLocationAddress" className="text-right">Address</Label>
                  <Input id="manualLocationAddress" name="manualLocationAddress" value={formData.manualLocationAddress ?? ''} onChange={handleChange} className="col-span-3 bg-slate-800 border-slate-600" placeholder="e.g., Bucharest, Romania"/>
              </div>
          )}

        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? (isEditMode ? 'Saving...' : 'Adding...')
              : (isEditMode ? 'Save Changes' : 'Add Vehicle')}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
} 