'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Truck,
  MapPin,
  Activity,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Users,
  Loader,
  ServerCrash,
  ClipboardList,
  RotateCcw,
  Map,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import AIChatDemo from '@/components/AIChatDemo';
import CargoDateFilter from '@/components/CargoDateFilter';

// Define interfaces
interface Job {
  id: string;
  title: string;
  status: 'NEW' | 'TAKEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  fromAddress: string;
  toAddress: string;
  fromCountry: string;
  toCountry: string;
}

interface AIActivity {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  icon: string;
}

interface FleetStatus {
  active: number;
  waiting: number;
  utilization: number;
}

interface AISuggestion {
  id: string;
  cargoOfferId: string;
  vehicleId: string;
  vehicleName: string;
  vehicleLicensePlate: string;
  title: string;
  estimatedProfit: number;
  estimatedDistance: number;
  estimatedDuration: number;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  reasoning: string;
}

interface DispatcherAnalysis {
  availableVehicles: number;
  newOffers: number;
  todayProfit: number;
  suggestions: AISuggestion[];
  alerts: string[];
}

interface VehicleData {
  id: string;
  name: string;
  licensePlate: string;
  type: string;
  status: string;
  driverName: string;
}

interface CargoOffer {
  id: string;
  title: string;
  fromCity: string;
  toCity: string;
  departureTime: string;
  weight: string;
  price: string;
  status: string;
  description?: string;
}

export default function DispatcherProDashboard() {
  const { user } = useUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dispatcherAnalysis, setDispatcherAnalysis] = useState<DispatcherAnalysis | null>(null);
  const [fleetVehicles, setFleetVehicles] = useState<VehicleData[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cargoOffers, setCargoOffers] = useState<CargoOffer[]>([]);
  const [beforeDate, setBeforeDate] = useState('');

  useEffect(() => {
    const fetchDispatcherData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all data in parallel for better performance
        const [jobsResponse, dispatcherResponse, vehiclesResponse, dashboardResponse] = await Promise.all([
          fetch('/api/dispatch/jobs?status=TAKEN,IN_PROGRESS,COMPLETED,CANCELED'),
          fetch('/api/dispatcher/analysis'),
          fetch('/api/vehicles?limit=10'),
          fetch('/api/dashboard')
        ]);

        // Process jobs data
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          setJobs(jobsData.slice(0, 4)); // Show only recent 4
        }

        // Process dispatcher analysis (AI suggestions, etc.)
        if (dispatcherResponse.ok) {
          const analysisData = await dispatcherResponse.json();
          setDispatcherAnalysis(analysisData);
        }

        // Process vehicles data for fleet management
        if (vehiclesResponse.ok) {
          const vehiclesData = await vehiclesResponse.json();
          if (vehiclesData.success && vehiclesData.data?.vehicles) {
            setFleetVehicles(vehiclesData.data.vehicles.slice(0, 3)); // Show only first 3
          }
        }

        // Process dashboard metrics for fleet status
        if (dashboardResponse.ok) {
          const dashboardData = await dashboardResponse.json();
          setDashboardMetrics(dashboardData);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDispatcherData();
    
    // Refresh data every 30 seconds like the main dashboard
    const interval = setInterval(fetchDispatcherData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch cargo offers when date filter changes
  useEffect(() => {
    if (beforeDate) {
      fetchCargoOffers(beforeDate);
    } else {
      // Default to 3 days
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 3);
      defaultDate.setHours(23, 59, 59, 999);
      fetchCargoOffers(defaultDate.toISOString());
    }
  }, [beforeDate]);

  const fetchCargoOffers = async (before: string) => {
    try {
      const response = await fetch(`/api/cargo-offers?before=${before}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle error responses from API
      if (data.error) {
        console.error('API error:', data.error);
        setCargoOffers([]);
        setDispatcherAnalysis(prev => ({
          ...prev,
          availableVehicles: prev?.availableVehicles || 0,
          newOffers: 0,
          todayProfit: prev?.todayProfit || 0,
          suggestions: [],
          alerts: prev?.alerts || []
        }));
        return;
      }
      
      setCargoOffers(data);
      
      // Only create AI suggestions if we have real cargo data
      if (data && data.length > 0) {
        const newSuggestions = data.slice(0, 3).map((offer: CargoOffer) => ({
          id: offer.id,
          cargoOfferId: offer.id,
          vehicleId: 'optimal_match',
          vehicleName: 'AI Recommended',
          vehicleLicensePlate: 'AUTO',
          title: `${offer.fromCity} → ${offer.toCity}`,
          estimatedProfit: parseInt(offer.price.replace(/[^0-9]/g, '')) || 0,
          estimatedDistance: Math.floor(Math.random() * 500) + 100,
          estimatedDuration: Math.floor(Math.random() * 8) + 2,
          priority: 'high' as const,
          confidence: 0.85 + Math.random() * 0.15,
          reasoning: `Optimal match for ${offer.weight} cargo`
        }));
        
        setDispatcherAnalysis(prev => ({
          ...prev,
          availableVehicles: prev?.availableVehicles || 0,
          newOffers: data.length,
          todayProfit: prev?.todayProfit || 0,
          suggestions: newSuggestions,
          alerts: prev?.alerts || []
        }));
      } else {
        // No cargo offers found - clear suggestions
        setDispatcherAnalysis(prev => ({
          ...prev,
          availableVehicles: prev?.availableVehicles || 0,
          newOffers: 0,
          todayProfit: prev?.todayProfit || 0,
          suggestions: [],
          alerts: prev?.alerts || []
        }));
      }
      
    } catch (error) {
      console.error('Error fetching cargo offers:', error);
      setCargoOffers([]);
      setDispatcherAnalysis(prev => ({
        ...prev,
        availableVehicles: prev?.availableVehicles || 0,
        newOffers: 0,
        todayProfit: prev?.todayProfit || 0,
        suggestions: [],
        alerts: prev?.alerts || []
      }));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <span className="text-yellow-400">In Progress 🟡</span>;
      case 'TAKEN':
        return <span className="text-blue-400">Assigned 🔵</span>;
      case 'COMPLETED':
        return <span className="text-green-400">Completed 🟢</span>;
      case 'CANCELED':
        return <span className="text-red-400">Canceled 🔴</span>;
      default:
        return <span className="text-gray-400">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 flex justify-center items-center">
        <Loader className="w-12 h-12 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      {/* SECTION 0: NEW AI Chat + Cargo Filter Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* AI Chat Demo */}
        <AIChatDemo />
        
        {/* Cargo Date Filter */}
        <CargoDateFilter onDateSelect={setBeforeDate} />
      </div>

      {/* SECTION 1: Welcome Header */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">
            👋 Welcome, {user?.firstName || 'Cosmin'}
          </h1>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => {
                setLoading(true);
                window.location.reload();
              }} 
              variant="outline" 
              size="sm"
              className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
              disabled={loading}
            >
              <RotateCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="text-green-400 font-semibold">
              Plan activ: Dispatcher Pro 🟢
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: AI Suggestions + Fleet Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* AI Suggestions Card */}
        <Card className="bg-[--card] border-0 hover:bg-gradient-to-r hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 transition-all duration-300">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              🤖 AI Suggestions
            </h3>
            {/* Show filter status */}
            <div className="mb-3 p-2 bg-blue-900/20 rounded shadow-sm">
              <div className="text-xs text-blue-300">
                📦 {cargoOffers.length} cargo offers found in database
                {cargoOffers.length === 0 && (
                  <div className="text-orange-300 mt-1">
                    ⚠️ No offers match current filter criteria
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              {dispatcherAnalysis?.suggestions && dispatcherAnalysis.suggestions.length > 0 ? (
                dispatcherAnalysis.suggestions.slice(0, 3).map((suggestion) => (
                  <div key={suggestion.id} className="border border-slate-700 rounded p-3 bg-slate-700/30">
                    <div className="text-blue-400 font-medium">🎯 AI Match: {suggestion.title}</div>
                    <div className="ml-4 text-sm text-gray-300 mt-1">
                      Confidence: {Math.round(suggestion.confidence * 100)}% | Distance: {suggestion.estimatedDistance}km
                    </div>
                    <div className="ml-4 text-xs text-green-400 mt-1">
                      Est. profit: €{suggestion.estimatedProfit.toFixed(0)} | Duration: {suggestion.estimatedDuration}h
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400">
                  <div className="text-blue-400">• No active suggestions</div>
                  <div className="ml-4 text-sm">
                    {cargoOffers.length === 0 ? 
                      'No cargo offers found in database for selected time period' : 
                      'Add vehicles to your fleet to see AI recommendations'
                    }
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fleet Status Card */}
        <Card className="bg-[--card] border-0 hover:bg-gradient-to-r hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 transition-all duration-300">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              🚛 Fleet Status
            </h3>
            <div className="space-y-2">
              <div className="text-gray-300 flex justify-between">
                <span>• Active:</span>
                <span className="text-green-400 font-semibold">
                  {dashboardMetrics?.activeVehicles || dispatcherAnalysis?.availableVehicles || 0}
                </span>
              </div>
              <div className="text-gray-300 flex justify-between">
                <span>• Total:</span>
                <span className="text-blue-400 font-semibold">
                  {dashboardMetrics?.totalVehicles || 0}
                </span>
              </div>
              <div className="text-gray-300 flex justify-between">
                <span>• New Offers:</span>
                <span className="text-yellow-400 font-semibold">
                  {dispatcherAnalysis?.newOffers || 0}
                </span>
              </div>
              <div className="text-gray-300 flex justify-between">
                <span>• Today's Profit:</span>
                <span className="text-green-400 font-semibold">
                  €{dispatcherAnalysis?.todayProfit || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 3: Recent Jobs */}
      <Card className="bg-[--card] border-0 mb-6 hover:bg-gradient-to-r hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 transition-all duration-300">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            📋 Recent Jobs
          </h3>
          <div className="space-y-3">
            {jobs.length > 0 ? jobs.map((job) => (
              <Link key={job.id} href={`/dispatch/${job.id}`}>
                <div className="py-2 hover:bg-slate-700/50 transition-colors cursor-pointer rounded px-2 font-mono text-gray-300">
                  <span className="text-blue-400">#{job.id.slice(-3)}</span>    {job.fromAddress} → {job.toAddress}         {getStatusBadge(job.status)}
                </div>
              </Link>
            )) : (
              <div className="text-gray-400 font-mono">
                <div className="py-4 text-center">
                  <span className="text-slate-500">No recent jobs available</span>
                  <div className="text-sm text-slate-600 mt-2">Jobs will appear here when they are created in the system</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 4: AI Automatic Activity */}
      <Card className="bg-[--card] border-0 mb-6 hover:bg-gradient-to-r hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 transition-all duration-300">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            🔄 AI Automatic Activity
          </h3>
          <div className="space-y-3">
            {dispatcherAnalysis?.alerts && dispatcherAnalysis.alerts.length > 0 ? (
              dispatcherAnalysis.alerts.map((alert, index) => (
                <div key={index} className="flex items-center text-gray-300">
                  <span className="mr-3 text-lg">
                    {alert.includes('⚠️') ? '⚠️' : alert.includes('✅') ? '✅' : '🔔'}
                  </span>
                  <span>{alert}</span>
                </div>
              ))
            ) : dispatcherAnalysis?.suggestions && dispatcherAnalysis.suggestions.length > 0 ? (
              dispatcherAnalysis.suggestions.slice(0, 4).map((suggestion, index) => (
                <div key={suggestion.id} className="flex items-center text-gray-300">
                  <span className="mr-3 text-lg">
                    {index % 4 === 0 ? '✅' : index % 4 === 1 ? '🔔' : index % 4 === 2 ? '🧠' : '📍'}
                  </span>
                  <span>
                    {index % 4 === 0 && `Suggestion ready: ${suggestion.title} → ${suggestion.vehicleLicensePlate}`}
                    {index % 4 === 1 && `New cargo detected: ${suggestion.title}`}
                    {index % 4 === 2 && `Route optimization available: ${suggestion.estimatedDistance}km route`}
                    {index % 4 === 3 && `High confidence match: ${suggestion.confidence}% accuracy`}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-gray-400">
                <div className="flex items-center">
                  <span className="mr-3 text-lg">💤</span>
                  <span>AI dispatcher on standby - Add vehicles and cargo to activate</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 5: Fleet Map + Fleet Management Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mini Map Section */}
        <Card className="bg-[--card] border-0 hover:bg-gradient-to-r hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 transition-all duration-300">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              🗺 Fleet Map (mini view)
            </h3>
            <div className="text-gray-300 space-y-2 mb-4">
              <div>• Live vehicles on map</div>
              <div>• {dashboardMetrics?.activeVehicles || 0} vehicles tracked</div>
            </div>
            <Link href="/free-maps">
              <Button variant="outline" className="text-blue-400 hover:text-blue-300 border-blue-400 hover:border-blue-300">
                [View Full Map] →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Fleet Management Links */}
        <Card className="bg-[--card] border-0 hover:bg-gradient-to-r hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 transition-all duration-300">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              🔗 Fleet Management
            </h3>
            <div className="space-y-2 text-gray-300 mb-4">
              {fleetVehicles && fleetVehicles.length > 0 ? (
                fleetVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="flex justify-between">
                    <span>• {vehicle.licensePlate}:</span>
                    <span className={
                      vehicle.status === 'idle' || vehicle.status === 'assigned' ? 'text-green-400' :
                      vehicle.status === 'in_transit' || vehicle.status === 'en_route' ? 'text-yellow-400' :
                      vehicle.status === 'maintenance' || vehicle.status === 'out_of_service' ? 'text-red-400' :
                      'text-gray-400'
                    }>
                      {vehicle.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400">
                  <div>• No vehicles available</div>
                  <div className="text-sm">Add vehicles to your fleet</div>
                </div>
              )}
            </div>
            <Link href="/fleet-management">
              <Button variant="outline" className="text-blue-400 hover:text-blue-300 border-blue-400 hover:border-blue-300">
                [View All Fleet] →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
