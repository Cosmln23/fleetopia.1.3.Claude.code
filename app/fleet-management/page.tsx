'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Fuel, 
  Clock, 
  Route,
  AlertTriangle,
  CheckCircle,
  Activity,
  TrendingUp,
  Users,
  Settings,
  Eye,
  Zap,
  PlusCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  ToggleRight,
  FileText,
  Package,
  RefreshCw
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AddVehicleForm } from '@/components/add-vehicle-form';
import Link from 'next/link';
import { toast as sonnerToast } from 'sonner';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@clerk/nextjs';
import { useDispatcherContext } from '@/contexts/dispatcher-context';

interface CargoOffer {
  id: string;
  title: string;
  fromLocation: string;
  toLocation: string;
  fromPostalCode?: string;
  toPostalCode?: string;
  distance: number | null;
  weight: number;
  volume: number | null;
  cargoType: string;
  loadingDate: string;
  deliveryDate: string;
  price: number;
  priceType: string;
  companyName: string;
  companyRating: number | null;
  requirements: string[];
  truckType: string | null;
  status: string;
  urgency: string;
  createdAt: string;
  fromAddress: string;
  toAddress: string;
  fromCountry: string;
  toCountry: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: string;
  licensePlate: string;
  status: 'active' | 'idle' | 'maintenance' | 'offline' | 'assigned';
  driverName: string;
  currentRoute: string; // Assuming this is a string representation for now
  lat?: number | '';
  lng?: number | '';
  manualLocationAddress?: string;
  fuelConsumption?: number;
}

interface CargoDetails extends CargoOffer {
  // we can extend this if needed
}

export default function FleetManagementPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { refreshAnalysis } = useDispatcherContext();
  
  // Start with ZERO vehicles and no loading/error state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fleetStats, setFleetStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    idleVehicles: 0,
    maintenanceVehicles: 0,
  });

  const [isAddVehicleOpen, setAddVehicleOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleForDetails, setVehicleForDetails] = useState<Vehicle | null>(null);
  const [cargoDetails, setCargoDetails] = useState<CargoOffer | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  const { toast } = useToast();

  // The ONLY function that fetches data
  const fetchVehicleData = useCallback(async () => {
    if (!isSignedIn || !user?.id) {
        toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
        return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/vehicles');
      if (!response.ok) {
        throw new Error('Server responded with an error.');
      }
      const data = await response.json();
      setVehicles(data.vehicles || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setVehicles([]); // On error, reset to zero
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, user?.id, toast]);

  // This useEffect ONLY reacts to changes in the vehicles list to update stats.
  // It does NOT fetch data.
  useEffect(() => {
    const total = vehicles.length;
    const active = vehicles.filter(v => v.status === 'active').length;
    const idle = vehicles.filter(v => v.status === 'idle').length;
    const maintenance = vehicles.filter(v => v.status === 'maintenance').length;
    setFleetStats({
      totalVehicles: total,
      activeVehicles: active,
      idleVehicles: idle,
      maintenanceVehicles: maintenance,
    });
  }, [vehicles]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'maintenance': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      case 'assigned': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'In Transit';
      case 'idle': return 'Available';
      case 'maintenance': return 'Maintenance';
      case 'offline': return 'Offline';
      case 'assigned': return 'Assigned';
      default: return 'Unknown';
    }
  };

  const handleStatusChange = async (vehicleId: string, status: string) => {
    const promise = fetch(`/api/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(async response => {
      if (!response.ok) {
        throw new Error('Failed to update status.');
      }
      
      try {
        await fetch('/api/vehicles/available', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vehicleId }),
        });
      } catch (error) {
        console.log('Vehicle was not in marketplace or failed to remove');
      }
      
      return response.json();
    });

    sonnerToast.promise(promise, {
      loading: 'Updating status...',
      success: (data: any) => {
        fetchVehicleData();
        return `Vehicle status updated to ${status}.`;
      },
      error: 'Error updating status.',
    });
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
  };

  const handleDelete = async (vehicleId: string) => {
    const originalVehicles = [...vehicles];
    setVehicles(vehicles.filter(v => v.id !== vehicleId)); // Optimistic update

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Failed to delete vehicle on the server.');
      }
      toast({ title: "Success", description: "Vehicle deleted successfully." });
      refreshAnalysis(); // Flip the switch
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete vehicle.", variant: "destructive" });
      setVehicles(originalVehicles); // Revert on error
    }
  };
  
  const onFormSubmit = () => {
    setAddVehicleOpen(false);
    setEditingVehicle(null);
    fetchVehicleData(); // Fetch data AFTER adding/editing a vehicle
    refreshAnalysis(); // Flip the switch
  };

  const handleCloseEdit = () => {
    setEditingVehicle(null);
  };

  const handleOpenDetails = async (vehicle: Vehicle) => {
    if (vehicle.status !== 'assigned' && vehicle.status !== 'active') {
      toast({
        title: "No Details Available",
        description: "Cargo details are only available for assigned or active vehicles.",
      });
      return;
    }

    setVehicleForDetails(vehicle);
    setIsDetailsLoading(true);
    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}/details`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to fetch details');
      }
      const data = await response.json();
      setCargoDetails(data);
    } catch (error: any) {
      toast({
        title: "Error fetching details",
        description: error.message,
        variant: "destructive"
      });
      setVehicleForDetails(null);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setVehicleForDetails(null);
    setCargoDetails(null);
  };
  
  const handlePostAsAvailable = async (vehicle: Vehicle) => {
    try {
      const response = await fetch('/api/vehicles/available', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          currentLocation: vehicle.manualLocationAddress || 'Current Location',
          availableRoute: 'Available for any destination',
          pricePerKm: 1.5
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to post vehicle as available');
      }

      const result = await response.json();
      
      toast({
        title: "Success!",
        description: `${vehicle.name} has been posted to Find Transport marketplace!`,
      });
      
      fetchVehicleData();
      
      console.log('Vehicle posted as available:', result);
    } catch (error) {
      console.error('Error posting vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to post vehicle to marketplace.",
        variant: "destructive",
      });
    }
  };

  const VehicleCard = ({ vehicle, onStatusChange, onDelete, onEdit, onViewDetails, onPostAsAvailable, index }: { vehicle: Vehicle, onStatusChange: (id: string, status: string) => void, onDelete: (id: string) => void, onEdit: (vehicle: Vehicle) => void, onViewDetails: (vehicle: Vehicle) => void, onPostAsAvailable: (vehicle: Vehicle) => void, index: number }) => {
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isPostedToMarketplace, setIsPostedToMarketplace] = useState(false);

    useEffect(() => {
      const checkMarketplaceStatus = async () => {
        try {
          const response = await fetch('/api/vehicles/available');
          if (response.ok) {
            const availableVehicles = await response.json();
            const isPosted = availableVehicles.some((av: any) => av.vehicleId === vehicle.id);
            setIsPostedToMarketplace(isPosted);
          }
        } catch (error) {
          console.error('Error checking marketplace status:', error);
        }
      };
      
      checkMarketplaceStatus();
    }, [vehicle.id, vehicle.status]);

    return (
      <motion.div
        key={vehicle.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="h-full"
      >
        <Card className="bg-slate-800/70 border-slate-600 hover:border-blue-500 transition-all duration-300 min-h-[320px] relative">
          {isPostedToMarketplace && (
            <div className="absolute top-2 left-2 right-2 z-10">
              <div className="flex items-center justify-center space-x-1 bg-blue-600/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">Posted to Find Transport</span>
              </div>
            </div>
          )}
          
          <div className="p-4 pb-3 pt-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{vehicle.name}</h3>
                  <p className="text-slate-400 text-sm">{vehicle.licensePlate} • {vehicle.type}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge className={`px-3 py-1.5 text-sm font-medium ${getStatusColor(vehicle.status)}`}>
                  {getStatusText(vehicle.status)}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-700">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-slate-300">
                    <DropdownMenuItem onClick={() => onEdit(vehicle)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Vehicle
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onPostAsAvailable(vehicle)} className="text-blue-400">
                      <Package className="mr-2 h-4 w-4" />
                      Post as Available
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <ToggleRight className="mr-2 h-4 w-4" />
                        Change Status
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="bg-slate-900 border-slate-700 text-white">
                        <DropdownMenuItem onClick={() => onStatusChange(vehicle.id, 'idle')}>Idle</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange(vehicle.id, 'active')}>Active</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange(vehicle.id, 'maintenance')}>Maintenance</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onStatusChange(vehicle.id, 'assigned')}>Assigned</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator className="bg-slate-700" />
                    <DropdownMenuItem onClick={() => onDelete(vehicle.id)} className="text-red-400">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Vehicle
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-t border-slate-700/50">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-white">{vehicle.driverName}</p>
                <p className="text-slate-400">Assigned Driver</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 space-y-3 flex-1">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Route className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-400 text-sm font-medium">Current Route</span>
                </div>
                <p className="text-white font-medium">{vehicle.currentRoute || 'No active route'}</p>
              </div>
              
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <span className="text-slate-400 text-sm font-medium">Location</span>
                </div>
                <p className="text-white font-medium text-sm">
                  {typeof vehicle.lat === 'number' && typeof vehicle.lng === 'number' 
                    ? `${vehicle.lat.toFixed(4)}, ${vehicle.lng.toFixed(4)}`
                    : 'Location not available'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 pt-3 border-t border-slate-700/50">
            <div className="flex justify-between">
              <Link href={`/real-time?focus=${vehicle.id}`} passHref>
                <Button variant="outline" size="sm" className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10">
                  <MapPin className="mr-2 h-4 w-4" />
                  Track Live
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="text-slate-400 border-slate-600 hover:bg-slate-700" onClick={() => onViewDetails(vehicle)}>
                <FileText className="mr-2 h-4 w-4" />
                Details
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>;
  }

  if (!isSignedIn) {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <p className="mb-4">Please sign in to manage your fleet.</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Fleet Management
              </h1>
              <p className="text-slate-400 text-lg">
                Real-time tracking and optimization of your entire fleet
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={fetchVehicleData} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Loading...' : 'Refresh Data'}
              </Button>
              <Dialog open={isAddVehicleOpen || !!editingVehicle} onOpenChange={(isOpen) => {
                  if (!isOpen) {
                      setAddVehicleOpen(false);
                      setEditingVehicle(null);
                  }
              }}>
                <DialogTrigger asChild>
                  <Button onClick={() => setAddVehicleOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Vehicle
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add a New Vehicle'}</DialogTitle>
                    <DialogDescription>
                      {editingVehicle ? 'Update the details of your vehicle.' : 'Fill in the details to add a new vehicle to your fleet.'}
                    </DialogDescription>
                  </DialogHeader>
                  <AddVehicleForm vehicle={editingVehicle} onFormSubmit={onFormSubmit} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Vehicles</CardTitle>
              <Truck className="h-5 w-5 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{fleetStats.totalVehicles}</div>
              <p className="text-xs text-slate-500">across all fleets</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Active Vehicles</CardTitle>
              <Activity className="h-5 w-5 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{fleetStats.activeVehicles}</div>
              <p className="text-xs text-slate-500">{((fleetStats.activeVehicles / fleetStats.totalVehicles) * 100 || 0).toFixed(1)}% of fleet</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Idle Vehicles</CardTitle>
              <Users className="h-5 w-5 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{fleetStats.idleVehicles}</div>
              <p className="text-xs text-slate-500">ready for dispatch</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">In Maintenance</CardTitle>
              <Settings className="h-5 w-5 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{fleetStats.maintenanceVehicles}</div>
              <p className="text-xs text-slate-500">currently in service</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="routes">Route Optimization</TabsTrigger>
              <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {isLoading && (
                <div className="text-center py-12 text-slate-400">
                  <p>Loading fleet data...</p>
                </div>
              )}
              {error && (
                <div className="text-center py-12 text-red-400">
                  <p>Error: {error}</p>
                </div>
              )}
              {!isLoading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                  {vehicles.map((vehicle, index) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                      onViewDetails={handleOpenDetails}
                      onPostAsAvailable={handlePostAsAvailable}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="routes">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-200">Route Optimization</CardTitle>
                  <CardDescription>AI-powered route planning and optimization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-16">
                    <Route className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">Route Optimization Engine</h3>
                    <p className="text-slate-400 mb-6">
                      Advanced AI algorithms optimize routes for fuel efficiency and delivery times
                    </p>
                    <Button>
                      <Zap className="w-4 h-4 mr-2" />
                      Start Optimization
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Fleet Utilization</span>
                      <span className="text-green-400 font-bold">85.9%</span>
                    </div>
                    <Progress value={85.9} className="h-3" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Average Speed</span>
                      <span className="text-blue-400 font-bold">67 km/h</span>
                    </div>
                    <Progress value={67} className="h-3" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Customer Satisfaction</span>
                      <span className="text-purple-400 font-bold">4.8/5.0</span>
                    </div>
                    <Progress value={96} className="h-3" />
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-200">Cost Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-400">€2,340</p>
                        <p className="text-sm text-slate-400">Fuel Savings</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-400">€1,890</p>
                        <p className="text-sm text-slate-400">Route Optimization</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-400">€945</p>
                        <p className="text-sm text-slate-400">Maintenance Savings</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-400">€5,175</p>
                        <p className="text-sm text-slate-400">Total Savings</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="maintenance">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-200">Maintenance Schedule</CardTitle>
                  <CardDescription>Predictive maintenance and service planning</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-16">
                    <Settings className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-300 mb-2">Maintenance Dashboard</h3>
                    <p className="text-slate-400 mb-6">
                      AI-powered predictive maintenance keeps your fleet running smoothly
                    </p>
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      View Maintenance Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        <Dialog open={!!editingVehicle} onOpenChange={(isOpen) => !isOpen && handleCloseEdit()}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md max-h-[80vh] overflow-y-auto">
            <AddVehicleForm 
              onVehicleAdded={onFormSubmit}
              initialData={editingVehicle}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={!!vehicleForDetails} onOpenChange={(isOpen) => !isOpen && handleCloseDetails()}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Cargo Details for {vehicleForDetails?.name}</DialogTitle>
              <DialogDescription>
                Now transporting: {cargoDetails?.title}
              </DialogDescription>
            </DialogHeader>
            {isDetailsLoading ? (
              <div className="py-8 text-center">Loading details...</div>
            ) : cargoDetails ? (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>From:</strong> {cargoDetails.fromAddress}, {cargoDetails.fromCountry} ({cargoDetails.fromPostalCode})</div>
                  <div><strong>To:</strong> {cargoDetails.toAddress}, {cargoDetails.toCountry} ({cargoDetails.toPostalCode})</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Weight:</strong> {cargoDetails.weight} kg</div>
                  <div><strong>Volume:</strong> {cargoDetails.volume} m³</div>
                </div>
                <div><strong>Cargo Type:</strong> {cargoDetails.cargoType}</div>
                <div><strong>Company:</strong> {cargoDetails.companyName}</div>
                <div><strong>Price:</strong> {cargoDetails.price} {cargoDetails.priceType}</div>
              </div>
            ) : (
              <div className="py-8 text-center">No cargo information available.</div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
