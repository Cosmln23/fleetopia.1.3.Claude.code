'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader, Truck, AlertTriangle } from 'lucide-react';
import { CargoOffer, Vehicle } from '@/types'; // Assuming types are in @/types

interface AssignOfferDialogProps {
  offer: CargoOffer | null;
  onClose: () => void;
  onAssign: (vehicleId: string) => void;
}

export function AssignOfferDialog({ offer, onClose, onAssign }: AssignOfferDialogProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (offer) {
      const fetchAvailableVehicles = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch('/api/vehicles?status=idle');
          if (!response.ok) {
            throw new Error('Could not fetch available vehicles.');
          }
          const data = await response.json();
          setVehicles(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
          setLoading(false);
        }
      };
      
      fetchAvailableVehicles();
    }
  }, [offer]);

  const handleConfirm = async () => {
    if (!selectedVehicle) return;
    setIsAssigning(true);
    await onAssign(selectedVehicle);
    setIsAssigning(false);
  };

  if (!offer) return null;
  
  const renderVehicleList = () => {
    if (loading) {
      return (
        <div className="flex items-center p-3 rounded-lg bg-slate-800">
          <Loader className="w-5 h-5 mr-3 animate-spin" />
          <span>Loading available vehicles...</span>
        </div>
      );
    }
    
    if (error) {
       return (
        <div className="flex items-center p-3 rounded-lg bg-red-900/50 text-red-400">
          <AlertTriangle className="w-5 h-5 mr-3" />
          <span>Error: {error}</span>
        </div>
      );
    }
    
    if (vehicles.length === 0) {
       return (
        <div className="flex items-center p-3 rounded-lg bg-slate-800 text-slate-400">
          <AlertTriangle className="w-5 h-5 mr-3" />
          <span>No idle vehicles available for dispatch.</span>
        </div>
      );
    }
    
    return vehicles.map((vehicle) => (
       <button 
        key={vehicle.id}
        onClick={() => setSelectedVehicle(vehicle.id)}
        className={`w-full text-left flex items-center p-3 rounded-lg bg-slate-800 hover:bg-slate-700 border-2 transition-colors ${selectedVehicle === vehicle.id ? 'border-blue-500 bg-slate-700' : 'border-transparent'}`}
       >
          <Truck className="w-5 h-5 mr-3 text-green-400"/>
          <div>
              <p className="font-semibold">{vehicle.name} ({vehicle.licensePlate})</p>
              <p className="text-sm text-slate-400">Driver: {vehicle.driverName}</p>
          </div>
       </button>
    ));
  };

  return (
    <Dialog open={!!offer} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Assign Offer to Vehicle</DialogTitle>
          <DialogDescription>
            Select an available vehicle to assign to the offer: "{offer.title}".
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <h4 className="font-semibold mb-3">Available Vehicles (Idle)</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
             {renderVehicleList()}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            className="bg-blue-600 hover:bg-blue-700 w-40" 
            onClick={handleConfirm}
            disabled={!selectedVehicle || loading || isAssigning}
            >
            {isAssigning ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Assignment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 