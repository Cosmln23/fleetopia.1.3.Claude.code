'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, MapPin } from 'lucide-react';

export default function FreeMapsPage() {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🗺️ Maps Functionality
          </h1>
          <p className="text-xl text-slate-300">
            Map components temporarily removed for optimization
          </p>
        </div>

        {/* Info Card */}
        <Card className="bg-[--card] hover:bg-gradient-to-r hover:from-white/10 hover:via-white/20 hover:to-white/10 transition-all duration-500">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-400" />
              Maps Status
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-blue-900/50 rounded-lg flex items-center justify-center mb-6">
              <MapPin className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-200 mb-4">
              Map Components Removed
            </h3>
            <p className="text-slate-300 mb-6 max-w-md mx-auto">
              All Leaflet-based map components have been removed to optimize the application build process and reduce dependencies.
            </p>
            <Badge variant="outline" className="text-yellow-400 border-yellow-400">
              Functionality will be restored with alternative mapping solution
            </Badge>
          </CardContent>
        </Card>

        {/* Future Plans */}
        <Card className="bg-[--card] hover:bg-gradient-to-r hover:from-white/10 hover:via-white/20 hover:to-white/10 transition-all duration-500">
          <CardHeader>
            <CardTitle className="text-slate-200">Future Implementation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-900/50 rounded-full flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                </div>
                <div>
                  <h4 className="text-slate-200 font-medium">Google Maps Integration</h4>
                  <p className="text-slate-400 text-sm">Direct Google Maps API integration for production use</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-900/50 rounded-full flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                </div>
                <div>
                  <h4 className="text-slate-200 font-medium">MapBox Alternative</h4>
                  <p className="text-slate-400 text-sm">Lighter weight mapping solution with custom styling</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-purple-900/50 rounded-full flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                </div>
                <div>
                  <h4 className="text-slate-200 font-medium">Optimized Build</h4>
                  <p className="text-slate-400 text-sm">Improved deployment performance without heavy mapping libraries</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
