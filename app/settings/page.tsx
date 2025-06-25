'use client';

import { GmailConnectionCard } from '@/components/gmail-connection-card';
import { Suspense } from 'react';

// Wrapper to use `useSearchParams` inside a client component
function SettingsPageContent() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">External Integrations</h3>
        <p className="text-sm text-muted-foreground">
          Connect your external accounts to extend the platform's functionality.
        </p>
      </div>
      <GmailConnectionCard />
    </div>
  );
}

export default function SettingsPage() {
  return (
    // Suspense is required because useSearchParams is used inside
    <Suspense fallback={<div>Loading...</div>}>
      <SettingsPageContent />
    </Suspense>
  );
}
