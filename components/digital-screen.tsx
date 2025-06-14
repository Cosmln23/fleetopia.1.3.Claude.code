
'use client';

import { useState, useEffect } from 'react';
import { Clock, Wifi, Activity, Zap, AlertTriangle } from 'lucide-react';

interface DigitalScreenProps {
  className?: string;
}

export default function DigitalScreen({ className = '' }: DigitalScreenProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [fleetEfficiency, setFleetEfficiency] = useState(94.7);
  const [aiProcessingRate, setAiProcessingRate] = useState(847);
  const [systemStatus, setSystemStatus] = useState<'online' | 'maintenance' | 'offline'>('online');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark that we're on the client and set initial time
    setIsClient(true);
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simulate real-time data fluctuations
      setFleetEfficiency(prev => {
        const change = (Math.random() - 0.5) * 0.2;
        return Math.max(90, Math.min(100, prev + change));
      });
      
      setAiProcessingRate(prev => {
        const change = Math.floor((Math.random() - 0.5) * 20);
        return Math.max(800, Math.min(900, prev + change));
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`terminal-border rounded-lg p-6 matrix-text ${className}`}>
      <div className="scan-line mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-green-400" />
            <span className="text-green-400 text-sm">SYSTEM TIME</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wifi className={`w-4 h-4 ${systemStatus === 'online' ? 'text-green-400' : 'text-red-400'}`} />
            <span className={`text-xs ${systemStatus === 'online' ? 'text-green-400' : 'text-red-400'}`}>
              {systemStatus.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="text-2xl font-mono text-white mb-1">
          {isClient && currentTime ? formatTime(currentTime) : '--:--:--'}
        </div>
        <div className="text-sm text-gray-400 mb-4">
          {isClient && currentTime ? formatDate(currentTime) : 'Loading...'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="metric-card rounded p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-300">FLEET EFFICIENCY</span>
            </div>
            <span className="text-green-400 text-xs pulse-green">●</span>
          </div>
          <div className="text-xl font-mono text-white">
            {fleetEfficiency.toFixed(1)}%
          </div>
        </div>

        <div className="metric-card rounded p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-300">AI PROCESSING</span>
            </div>
            <span className="text-green-400 text-xs pulse-green">●</span>
          </div>
          <div className="text-xl font-mono text-white">
            {aiProcessingRate} req/min
          </div>
        </div>

        <div className="metric-card rounded p-4 md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-300">SYSTEM STATUS</span>
            </div>
            <span className="text-green-400 text-xs">ALL SYSTEMS OPERATIONAL</span>
          </div>
          <div className="flex space-x-4 text-sm">
            <span className="text-green-400">● Core Systems</span>
            <span className="text-green-400">● AI Agents</span>
            <span className="text-green-400">● Database</span>
            <span className="text-green-400">● Network</span>
          </div>
        </div>
      </div>
    </div>
  );
}
