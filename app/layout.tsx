import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Navigation } from '@/components/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthProvider from '@/components/AuthProvider';
import { cn } from '@/lib/utils';
import { ChatProvider } from '@/contexts/chat-provider';
import { ChatManager } from '@/components/chat-manager';
import { DispatcherProvider } from '@/contexts/dispatcher-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fleetopia.co - Transport Paradise',
  description: 'Self-Evolving AI Marketplace for Transport Paradise',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <AuthProvider>
          <DispatcherProvider>
            <ChatProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <Navigation />
                <main className="min-h-screen text-white">
                  {children}
                </main>
                <Toaster />
                <ChatManager />
              </ThemeProvider>
            </ChatProvider>
          </DispatcherProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
