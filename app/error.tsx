'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[--card] border-0 wave-hover">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-red-500/10 rounded-full w-16 h-16 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <CardTitle className="text-white">Something went wrong!</CardTitle>
          <CardDescription className="text-slate-400">
            An unexpected error occurred while loading the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error.digest && (
            <div className="text-xs text-slate-500 bg-slate-800 p-2 rounded">
              Error ID: {error.digest}
            </div>
          )}
          <Button
            onClick={reset}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
