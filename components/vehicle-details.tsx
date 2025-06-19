'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MapPin, User, Truck as TruckIcon, LocateFixed } from 'lucide-react';
import { Vehicle, VehicleStatus } from '@/types';

interface VehicleDetailsProps {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onShowOnMap: (vehicle: Vehicle) => void;
}

const getStatusClass = (status: VehicleStatus) => {
  switch (status) {
    case VehicleStatus.idle:
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case VehicleStatus.in_transit:
    case VehicleStatus.en_route:
    case VehicleStatus.assigned:
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case VehicleStatus.loading:
    case VehicleStatus.unloading:
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case VehicleStatus.maintenance:
    case VehicleStatus.out_of_service:
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

export function VehicleDetails({ vehicle, isOpen, onClose, onShowOnMap }: VehicleDetailsProps) {
  if (!vehicle) return null;

  const handleShowOnMapClick = () => {
    if (vehicle) {
      onShowOnMap(vehicle);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            {vehicle.name}
            <Badge className={`ml-3 text-sm ${getStatusClass(vehicle.status)}`}>
              {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
            </Badge>
          </DialogTitle>
          <DialogDescription>{vehicle.licensePlate}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
            <h3 className="font-semibold text-lg text-slate-300">Vehicle Information</h3>
            <div className="flex items-center">
              <TruckIcon className="w-5 h-5 mr-3 text-slate-400" />
              <span>Type: <strong>{vehicle.type}</strong></span>
            </div>
            <div className="flex items-center">
              <User className="w-5 h-5 mr-3 text-slate-400" />
              <span>Driver: <strong>{vehicle.driverName}</strong></span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-3 text-slate-400" />
              <span>Route: <strong>{vehicle.currentRoute || 'N/A'}</strong></span>
            </div>
             <div className="mt-6 pt-4 border-t border-slate-700 flex space-x-3">
                <Button variant="outline"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
                <Button variant="destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
                <Button variant="secondary" onClick={handleShowOnMapClick}>
                  <LocateFixed className="w-4 h-4 mr-2" /> View on Map
                </Button>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
} 
