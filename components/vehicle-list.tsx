'use client';

import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Truck, Users } from 'lucide-react';
import { Vehicle } from '@/types';

interface VehicleListProps {
  vehicles: Vehicle[];
  onVehicleClick: (vehicle: Vehicle) => void;
}

// Memoized status class function to prevent re-creation on every render
const getStatusClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'idle':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'maintenance':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

const VehicleList = React.memo(function VehicleList({ vehicles, onVehicleClick }: VehicleListProps) {
  // Memoize the click handler to prevent re-renders
  const handleVehicleClick = useCallback((vehicle: Vehicle) => {
    onVehicleClick(vehicle);
  }, [onVehicleClick]);

  // Memoize the vehicles count for the header
  const vehicleCount = useMemo(() => vehicles.length, [vehicles.length]);

  return (
    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 h-full overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4 text-slate-200">
        Vehicle Fleet ({vehicleCount})
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {vehicles.map((vehicle, index) => (
          <motion.div
            key={vehicle.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-[--card] border-0 hover:bg-gradient-to-r hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-white">{vehicle.name}</CardTitle>
                    <CardDescription className="text-slate-400">{vehicle.licensePlate}</CardDescription>
                  </div>
                  <Badge className={`text-xs ${getStatusClass(vehicle.status)}`}>
                    {vehicle.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-slate-500" />
                    <span>{vehicle.driverName}</span>
                  </div>
                   <div className="flex items-center">
                    <Truck className="w-4 h-4 mr-2 text-slate-500" />
                    <span>{vehicle.type}</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={() => handleVehicleClick(vehicle)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
});

export { VehicleList }; 
