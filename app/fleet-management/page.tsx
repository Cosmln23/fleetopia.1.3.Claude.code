'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogTrigger,
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
  ToggleRight
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AddVehicleForm } from '@/components/add-vehicle-form';
import Link from 'next/link';
import { toast } from 'sonner';

interface Vehicle {
  id: string;
  name: string;
  type: string;
  licensePlate: string;
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  driverName: string;
  currentRoute: string; // Assuming this is a string representation for now
  lat: number;
  lng: number;
}

export default function FleetManagementPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fleetStats, setFleetStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    idleVehicles: 0,
    maintenanceVehicles: 0,
  });

  const [isAddVehicleOpen, setAddVehicleOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const fetchVehicleData = async () => {
    try {
      const response = await fetch('/api/real-time/data');
      if (!response.ok) {
        throw new Error('Failed to fetch vehicle data');
      }
      const data = await response.json();
      setVehicles(data.vehicles || []);
      updateFleetStats(data.vehicles || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleData(); // Fetch initial data
    const interval = setInterval(fetchVehicleData, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const updateFleetStats = (vehicles: Vehicle[]) => {
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
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'maintenance': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'In Transit';
      case 'idle': return 'Available';
      case 'maintenance': return 'Maintenance';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const handleStatusChange = async (vehicleId: string, status: string) => {
    const promise = fetch(`/api/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(response => {
      if (!response.ok) {
        throw new Error('Failed to update status.');
      }
      return response.json();
    });

    toast.promise(promise, {
      loading: 'Updating status...',
      success: (data) => {
        fetchVehicleData(); // Refresh data to show changes
        return `Vehicle status updated to ${status}.`;
      },
      error: 'Error updating status.',
    });
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setEditModalOpen(true);
  };

  const handleDelete = (vehicleId: string) => {
    const promise = () => new Promise(async (resolve, reject) => {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        resolve({ success: true });
      } else {
        reject({ error: true });
      }
    });

    toast.warning('Are you sure you want to delete this vehicle?', {
      classNames: {
        toast: 'bg-slate-900 border-2 border-red-500/50 text-white',
        actionButton: 'bg-red-700 hover:bg-red-800 text-white',
        cancelButton: 'bg-slate-700 hover:bg-slate-800 text-white',
      },
      action: {
        label: 'Delete',
        onClick: () => {
          toast.promise(promise(), {
            loading: 'Deleting vehicle...',
            success: () => {
              fetchVehicleData();
              return 'Vehicle deleted successfully.';
            },
            error: 'Failed to delete vehicle.',
          });
        },
      },
      cancel: {
        label: 'Cancel',
      },
    });
  };

  const onFormSubmit = () => {
    fetchVehicleData();
    setAddVehicleOpen(false);
    setEditModalOpen(false);
    setEditingVehicle(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        
        {/* Header */}
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
              <Dialog open={isAddVehicleOpen} onOpenChange={setAddVehicleOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Vehicle
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-slate-700 text-white">
                  <AddVehicleForm onVehicleAdded={onFormSubmit} />
                </DialogContent>
              </Dialog>

              <Badge variant="outline" className="text-green-400 border-green-400">
                <Activity className="w-4 h-4 mr-2" />
                {fleetStats.activeVehicles} Active
              </Badge>
              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                <Users className="w-4 h-4 mr-2" />
                {fleetStats.idleVehicles} Idle
              </Badge>
               <Badge variant="outline" className="text-slate-400 border-slate-400">
                <TrendingUp className="w-4 h-4 mr-2" />
                {fleetStats.totalVehicles} Total
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Fleet Overview Stats */}
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

        {/* Main Dashboard */}
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

            {/* Overview Tab */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {vehicles.map((vehicle, index) => (
                    <motion.div
                      key={vehicle.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="h-full"
                    >
                      <Card className="bg-slate-800/60 border-slate-700 h-full flex flex-col">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg text-white">{vehicle.name}</CardTitle>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-slate-300">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleEdit(vehicle)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(vehicle.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-700" />
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <ToggleRight className="mr-2 h-4 w-4" />
                                    <span>Change Status</span>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent className="bg-slate-800 border-slate-700 text-slate-300">
                                    <DropdownMenuItem onClick={() => handleStatusChange(vehicle.id, 'active')}>Active</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(vehicle.id, 'idle')}>Idle</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(vehicle.id, 'maintenance')}>Maintenance</DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <CardDescription className="text-slate-400">{vehicle.licensePlate} • {vehicle.type}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400">
                                <Users className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium text-white">{vehicle.driverName}</p>
                                <p className="text-sm text-slate-400">Driver</p>
                              </div>
                            </div>
                             <Badge className={`px-2 py-1 text-xs ${getStatusColor(vehicle.status)}`}>
                                {getStatusText(vehicle.status)}
                              </Badge>
                          </div>

                          <div className="space-y-3 pt-2">
                            <div>
                              <p className="text-slate-400 text-sm">Current Route</p>
                              <p className="text-white truncate font-medium">{vehicle.currentRoute || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 text-sm">Last Known Location</p>
                              <p className="text-white truncate font-medium">{`Lat: ${vehicle.lat.toFixed(4)}, Lng: ${vehicle.lng.toFixed(4)}`}</p>
                            </div>
                          </div>
                        </CardContent>
                        <div className="p-4 pt-0">
                          <Link href={`/real-time?focus=${vehicle.id}`} passHref>
                            <Button variant="outline" className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300">
                              <MapPin className="w-4 h-4 mr-2" />
                              Show on Map
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Routes Tab */}
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

            {/* Analytics Tab */}
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

            {/* Maintenance Tab */}
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

        {/* Edit Vehicle Dialog */}
        <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <AddVehicleForm 
              onVehicleAdded={onFormSubmit}
              initialData={editingVehicle}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
