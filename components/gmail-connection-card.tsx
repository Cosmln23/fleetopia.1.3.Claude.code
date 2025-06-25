'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Mail, Unplug, RefreshCw, AlertTriangle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { GmailConnectionStatus } from '@/lib/services/clerk-gmail-integration';

export function GmailConnectionCard() {
  const [status, setStatus] = useState<GmailConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const searchParams = useSearchParams();

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/gmail/status');
      const data = await response.json();
      if (data.success) {
        setStatus(data.status);
      } else {
        toast.error('Error checking Gmail status', { description: data.details });
      }
    } catch (error) {
      toast.error('Network Error', { description: 'Could not contact the server.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Check URL params to display notifications from the callback
    if (searchParams) {
      if (searchParams.get('success') === 'gmail_connected') {
        toast.success('Success!', { description: 'Your Gmail account has been connected.' });
      }
      if (searchParams.get('error')) {
        toast.error('Connection Failed', { description: searchParams.get('details') || 'An unknown error occurred.' });
      }
    }
  }, [searchParams]);

  const handleConnect = async () => {
    setIsActionLoading(true);
    try {
      const response = await fetch('/api/gmail/connect', { method: 'POST' });
      const data = await response.json();
      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast.error('Configuration Required', { description: data.details || 'Check the environment variables on the server.' });
      }
    } catch (error) {
      toast.error('Connection Error', { description: 'Could not initiate the connection process.' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsActionLoading(true);
    try {
      const response = await fetch('/api/gmail/disconnect', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        toast.success('Disconnected', { description: 'Your Gmail account has been disconnected.' });
        fetchStatus(); // Reload status
      } else {
        toast.error('Disconnection Error', { description: data.details });
      }
    } catch (error) {
        toast.error('Network Error', { description: 'Could not complete the disconnection.' });
    } finally {
        setIsActionLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <Mail className="h-6 w-6" />
                <CardTitle>Gmail Integration</CardTitle>
            </div>
            {status && (
                <Badge variant={status.connected ? 'default' : 'destructive'} className={status.connected ? 'bg-green-600' : ''}>
                    {status.connected ? 'Connected' : 'Not Connected'}
                </Badge>
            )}
        </div>
        <CardDescription>
          Connect your Gmail account to send notifications and emails directly from the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Checking connection status...</span>
          </div>
        ) : status?.connected ? (
          <div className="space-y-4">
            <p className="text-sm font-medium">
              Connected as: <span className="font-bold text-primary">{status.email}</span>
            </p>
            <Button variant="destructive" onClick={handleDisconnect} disabled={isActionLoading}>
                {isActionLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Unplug className="mr-2 h-4 w-4" />}
                Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 mr-3 text-yellow-500" />
                <p className="text-sm text-yellow-800">
                    You need to connect your Google account to enable this functionality.
                </p>
            </div>
            <Button onClick={handleConnect} disabled={isActionLoading}>
                {isActionLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                Connect with Google
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 