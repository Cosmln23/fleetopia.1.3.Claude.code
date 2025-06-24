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
import { Truck, User, MapPin, Settings, Navigation, Satellite } from 'lucide-react';
import { API_PROVIDERS } from '@/lib/universal-api-bridge';

// Re-using the Vehicle type from the management page
// A centralized types file would be a good refactor for later
import type { Vehicle } from '../app/fleet-management/page';

interface AddVehicleFormProps {
  onFormSubmit: () => void;
  vehicle?: Vehicle | null;
}

interface FormData extends Partial<Vehicle> {
  locationType?: string;
  manualLocationAddress?: string;
  fuelConsumption?: number;
  gpsProvider?: string;
  gpsEnabled?: boolean;
}

export function AddVehicleForm({ onFormSubmit, vehicle }: AddVehicleFormProps) {
  const [formData, setFormData] = useState<FormData>({
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
    fuelConsumption: 30.0,
    gpsProvider: '',
    gpsEnabled: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!vehicle;

  useEffect(() => {
    if (isEditMode && vehicle) {
      setFormData({
        ...vehicle,
        lat: vehicle.lat ?? 0,
        lng: vehicle.lng ?? 0,
        locationType: 'MANUAL_COORDS',
        manualLocationAddress: '',
        fuelConsumption: vehicle.fuelConsumption ?? 30.0,
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
        fuelConsumption: 30.0,
        gpsProvider: '',
        gpsEnabled: false,
      });
    }
  }, [vehicle, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'lat' || name === 'lng' || name === 'fuelConsumption') {
      const numericValue = parseFloat(value);
      if (value === '' || !isNaN(numericValue)) {
        setFormData((prev: FormData) => ({ ...prev, [name]: value === '' ? '' : numericValue }));
      }
    } else {
      setFormData((prev: FormData) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: FormData) => ({ ...prev, [name]: value }));
  };
  
  const handleLocationTypeChange = (value: string) => {
    setFormData(prev => {
      const newState: FormData = { ...prev, locationType: value };
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

    const apiEndpoint = isEditMode ? `/api/vehicles/${vehicle.id}` : '/api/vehicles';
    const httpMethod = isEditMode ? 'PUT' : 'POST';
    const successMessage = isEditMode ? 'Vehicle updated successfully!' : 'Vehicle added successfully!';
    const errorMessage = isEditMode ? 'Failed to update vehicle' : 'Failed to create vehicle';

    try {
      // Sanitize data before sending
      const vehicleData = {
        name: formData.name,
        type: formData.type,
        licensePlate: formData.licensePlate,
        driverName: formData.driverName,
        status: formData.status,
        lat: parseFloat(String(formData.lat)) || 0,
        lng: parseFloat(String(formData.lng)) || 0,
        fuelConsumption: parseFloat(String(formData.fuelConsumption)) || 30.0,
        gpsProvider: formData.gpsProvider || null,
        gpsEnabled: Boolean(formData.gpsEnabled),
      };

      const response = await fetch(apiEndpoint, {
        method: httpMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorMessage);
      }

      toast.success(successMessage);
      onFormSubmit();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <DialogHeader className="space-y-2 pb-4">
        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
            <Truck className="w-5 h-5 text-blue-400" />
          </div>
          {isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}
        </DialogTitle>
        <DialogDescription className="text-slate-400 text-base">
          {isEditMode 
            ? 'Update the details for this vehicle in your fleet.' 
            : 'Fill in the details below to add a new vehicle to your fleet.'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vehicle Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-700">
            <Truck className="w-4 h-4 text-blue-400" />
            <h3 className="text-base font-semibold text-white">Vehicle Information</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-300">Vehicle Name *</Label>
              <Input 
                id="name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="h-11 text-white"
                placeholder="e.g., Fleet Truck #001"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="licensePlate" className="text-sm font-medium text-slate-300">License Plate *</Label>
              <Input 
                id="licensePlate" 
                name="licensePlate" 
                value={formData.licensePlate} 
                onChange={handleChange} 
                className="h-11 text-white"
                placeholder="e.g., ABC-123"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium text-slate-300">Vehicle Type</Label>
              <Select name="type" onValueChange={(value) => handleSelectChange('type', value)} defaultValue={formData.type}>
                <SelectTrigger className="h-11 text-white">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Truck">Truck</SelectItem>
                  <SelectItem value="Van">Van</SelectItem>
                  <SelectItem value="Car">Car</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-slate-300">Status</Label>
              <Select name="status" onValueChange={(value) => handleSelectChange('status', value)} defaultValue={formData.status}>
                <SelectTrigger className="h-11 text-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idle">Idle</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="loading">Loading</SelectItem>
                  <SelectItem value="unloading">Unloading</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="out_of_service">Out of Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fuelConsumption" className="text-sm font-medium text-slate-300">Fuel Consumption (L/100km)</Label>
              <Input 
                id="fuelConsumption" 
                name="fuelConsumption" 
                type="number"
                value={formData.fuelConsumption || ''} 
                onChange={handleChange} 
                className="h-11 text-white"
                placeholder="e.g., 30"
              />
            </div>
          </div>
        </div>

        {/* Driver Information Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-700">
            <User className="w-4 h-4 text-green-400" />
            <h3 className="text-base font-semibold text-white">Driver Information</h3>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="driverName" className="text-sm font-medium text-slate-300">Driver Name *</Label>
            <Input 
              id="driverName" 
              name="driverName" 
              value={formData.driverName} 
              onChange={handleChange} 
              className="h-11 text-white"
              placeholder="e.g., John Smith"
            />
          </div>
        </div>

        {/* GPS Integration Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-700">
            <Satellite className="w-4 h-4 text-orange-400" />
            <h3 className="text-base font-semibold text-white">GPS Integration</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
              <div className="flex items-center space-x-3">
                <Navigation className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-sm font-medium text-slate-200">Enable GPS Tracking</p>
                  <p className="text-xs text-slate-400">Real-time location tracking for this vehicle</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.gpsEnabled || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, gpsEnabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
              </label>
            </div>
            
            {formData.gpsEnabled && (
              <div className="space-y-2">
                <Label htmlFor="gpsProvider" className="text-sm font-medium text-slate-300">GPS Provider *</Label>
                <Select 
                  name="gpsProvider" 
                  onValueChange={(value) => handleSelectChange('gpsProvider', value)} 
                  defaultValue={formData.gpsProvider}
                >
                  <SelectTrigger className="h-11 text-white">
                    <SelectValue placeholder="Select GPS provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="universal_gps">
                      <div className="flex items-center space-x-2">
                        <span>Universal GPS Connector</span>
                        <span className="text-xs text-green-400">(Works with ANY GPS API)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Location Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-slate-700">
            <MapPin className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-semibold text-white">Location Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="locationType" className="text-sm font-medium text-slate-300">Location Method</Label>
              <Select name="locationType" onValueChange={handleLocationTypeChange} defaultValue={formData.locationType}>
                <SelectTrigger className="h-11 text-white">
                  <SelectValue placeholder="Select location method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL_COORDS">Manual Coordinates</SelectItem>
                  <SelectItem value="MANUAL_ADDRESS">Manual Address</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.locationType === 'MANUAL_COORDS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lat" className="text-sm font-medium text-slate-300">Latitude</Label>
                  <Input 
                    id="lat" 
                    name="lat" 
                    type="number" 
                    step="any"
                    value={formData.lat ?? ''} 
                    onChange={handleChange} 
                    className="h-11 text-white"
                    placeholder="e.g., 44.4268"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lng" className="text-sm font-medium text-slate-300">Longitude</Label>
                  <Input 
                    id="lng" 
                    name="lng" 
                    type="number" 
                    step="any"
                    value={formData.lng ?? ''} 
                    onChange={handleChange} 
                    className="h-11 text-white"
                    placeholder="e.g., 26.1025"
                  />
                </div>
              </div>
            )}

            {formData.locationType === 'MANUAL_ADDRESS' && (
              <div className="space-y-2">
                <Label htmlFor="manualLocationAddress" className="text-sm font-medium text-slate-300">Address</Label>
                <Input 
                  id="manualLocationAddress" 
                  name="manualLocationAddress" 
                  value={formData.manualLocationAddress ?? ''} 
                  onChange={handleChange} 
                  className="h-11 text-white"
                  placeholder="e.g., Bucharest, Romania"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex gap-3 pt-4 border-t border-slate-700">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="px-6 border-slate-600 text-slate-300 hover:bg-slate-700">
              Cancel
            </Button>
          </DialogClose>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting 
              ? (isEditMode ? 'Saving...' : 'Adding...')
              : (isEditMode ? 'Save Changes' : 'Add Vehicle')}
          </Button>
        </DialogFooter>
      </form>
    </div>
  );
} 
