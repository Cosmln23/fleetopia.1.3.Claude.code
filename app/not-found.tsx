"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft, MapPin } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[--card] border-0 wave-hover">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-500/10 rounded-full w-16 h-16 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-blue-400" />
          </div>
          <CardTitle className="text-white text-2xl">404 - Page Not Found</CardTitle>
          <CardDescription className="text-slate-400">
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-slate-500 text-sm">
            You might have mistyped the URL or the page might have been removed.
          </div>
          <div className="space-y-2">
            <Link href="/" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
