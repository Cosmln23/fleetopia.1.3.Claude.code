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
  vehicle: string;
  job: string;
  description: string;
}

export default function DispatcherProDashboard() {
  const { user } = useUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [fleetStatus, setFleetStatus] = useState<FleetStatus>({ active: 5, waiting: 2, utilization: 76 });
  const [aiActivities, setAiActivities] = useState<AIActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDispatcherData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch recent jobs (similar to existing logic)
        const jobsResponse = await fetch('/api/dispatch/jobs?status=TAKEN,IN_PROGRESS,COMPLETED,CANCELED');
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          setJobs(jobsData.slice(0, 4)); // Show only recent 4
        }

        // Initialize AI suggestions with sample data
        setAiSuggestions([
          { id: '1', vehicle: 'GR-1245', job: 'Job #156', description: 'High priority cargo assignment' },
          { id: '2', vehicle: 'VH-003', job: 'Palermo → Milano', description: 'New cargo opportunity' },
          { id: '3', vehicle: 'VH-003', job: 'Route optimization', description: 'Available optimization' }
        ]);

        // Initialize AI activities with sample data  
        setAiActivities([
          { id: '1', type: 'assignment', message: 'Job #156 auto-assigned → GR-1245', timestamp: new Date(), icon: '✅' },
          { id: '2', type: 'detection', message: 'New cargo detected Palermo → Milano', timestamp: new Date(), icon: '🔔' },
          { id: '3', type: 'optimization', message: 'Route optimized → -12% estimated time', timestamp: new Date(), icon: '🧠' },
          { id: '4', type: 'maintenance', message: 'Vehicle VH-003 maintenance due in 2 days', timestamp: new Date(), icon: '⚠️' }
        ]);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDispatcherData();
  }, []);

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
      <div className="min-h-screen bg-slate-900 p-6 flex justify-center items-center">
        <Loader className="w-12 h-12 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* SECTION 1: Welcome Header */}
      <div className="bg-slate-800 rounded-lg p-6 mb-6 border border-slate-700">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">
            👋 Welcome, {user?.firstName || 'Cosmin'}
          </h1>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              size="sm"
              className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
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
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              🤖 AI Suggestions
            </h3>
            <div className="space-y-3">
              {aiSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="text-gray-300">
                  <div className="text-blue-400">• Vehicle {suggestion.vehicle} →</div>
                  <div className="ml-4 text-sm">{suggestion.job}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fleet Status Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              🚛 Fleet Status
            </h3>
            <div className="space-y-2">
              <div className="text-gray-300 flex justify-between">
                <span>• Active:</span>
                <span className="text-green-400 font-semibold">{fleetStatus.active}</span>
              </div>
              <div className="text-gray-300 flex justify-between">
                <span>• Waiting:</span>
                <span className="text-yellow-400 font-semibold">{fleetStatus.waiting}</span>
              </div>
              <div className="text-gray-300 flex justify-between">
                <span>• Utilization:</span>
                <span className="text-blue-400 font-semibold">{fleetStatus.utilization}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 3: Recent Jobs */}
      <Card className="bg-slate-800 border-slate-700 mb-6">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            📋 Recent Jobs
          </h3>
          <div className="space-y-3">
            {jobs.length > 0 ? jobs.map((job) => (
              <Link key={job.id} href={`/dispatch/${job.id}`}>
                <div className="flex justify-between items-center text-gray-300 py-2 border-b border-slate-700 last:border-b-0 hover:bg-slate-700/50 transition-colors cursor-pointer rounded px-2">
                  <span className="font-mono text-blue-400">#{job.id.slice(-3)}</span>
                  <span className="flex-1 mx-4">{job.fromAddress} → {job.toAddress}</span>
                  <span className="text-right">{getStatusBadge(job.status)}</span>
                </div>
              </Link>
            )) : (
              <div className="text-gray-400">
                <div className="py-2 hover:bg-slate-700/50 transition-colors cursor-pointer rounded px-2">#156    Arad → Constanța         <span className="text-yellow-400">In Progress 🟡</span></div>
                <div className="py-2 hover:bg-slate-700/50 transition-colors cursor-pointer rounded px-2">#151    Galați → Cluj-Napoca     <span className="text-green-400">Completed 🟢</span></div>
                <div className="py-2 hover:bg-slate-700/50 transition-colors cursor-pointer rounded px-2">#147    Iași → Oradea            <span className="text-green-400">Completed 🟢</span></div>
                <div className="py-2 hover:bg-slate-700/50 transition-colors cursor-pointer rounded px-2">#143    București → Timișoara    <span className="text-red-400">Canceled 🔴</span></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 4: AI Automatic Activity */}
      <Card className="bg-slate-800 border-slate-700 mb-6">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            🔄 AI Automatic Activity
          </h3>
          <div className="space-y-3">
            {aiActivities.map((activity) => (
              <div key={activity.id} className="flex items-center text-gray-300">
                <span className="mr-3 text-lg">{activity.icon}</span>
                <span>{activity.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 5: Fleet Map + Fleet Management Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mini Map Section */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              🗺 Fleet Map (mini view)
            </h3>
            <div className="text-gray-300 space-y-2 mb-4">
              <div>• Live vehicles on map</div>
              <div>• {fleetStatus.active} vehicles tracked</div>
            </div>
            <Link href="/free-maps">
              <Button variant="outline" className="text-blue-400 hover:text-blue-300 border-blue-400 hover:border-blue-300">
                [View Full Map] →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Fleet Management Links */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              🔗 Fleet Management
            </h3>
            <div className="space-y-2 text-gray-300 mb-4">
              <div className="flex justify-between">
                <span>• AB-123:</span>
                <span className="text-green-400">active</span>
              </div>
              <div className="flex justify-between">
                <span>• CD-456:</span>
                <span className="text-yellow-400">break</span>
              </div>
              <div className="flex justify-between">
                <span>• GR-789:</span>
                <span className="text-red-400">maintenance</span>
              </div>
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
