import { Loader2, Truck } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Truck className="w-12 h-12 text-blue-400" />
          <Loader2 className="w-6 h-6 text-white animate-spin absolute -top-1 -right-1" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Loading Fleetopia</h2>
          <p className="text-slate-400">Preparing your transport paradise...</p>
        </div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}
