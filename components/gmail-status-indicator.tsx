'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Status {
  connected: boolean;
  email?: string;
}

export function GmailStatusIndicator() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/gmail/status');
        const data = await response.json();
        if (data.success) {
          setStatus(data.status);
        }
      } catch (error) {
        // Do nothing on error, the indicator will remain neutral
      }
    };
    fetchStatus();
  }, []);

  if (!status) {
    return <div className="h-6 w-24 bg-gray-200 rounded-md animate-pulse" />;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
            <Link href="/settings">
                <Badge variant={status.connected ? 'default' : 'secondary'} className={`cursor-pointer ${status.connected ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    {status.connected ? 'Connected' : 'Disconnected'}
                </Badge>
            </Link>
        </TooltipTrigger>
        <TooltipContent>
          {status.connected ? (
            <p>Gmail connected as: {status.email}</p>
          ) : (
            <p>Gmail account is not connected. Click to configure.</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 