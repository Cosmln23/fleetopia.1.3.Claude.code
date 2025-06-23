import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Navigation } from '@/components/navigation';
import { Sidebar } from '@/components/sidebar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClerkProvider } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { ChatProvider } from '@/contexts/chat-provider';
import { ChatManager } from '@/components/chat-manager';
import { DispatcherProvider } from '@/contexts/dispatcher-context';
import { NotificationProvider } from '@/contexts/notification-provider';
import { SidebarWrapper } from '@/components/sidebar-wrapper';

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
        <ClerkProvider>
          <DispatcherProvider>
            <ChatProvider>
              <NotificationProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  <Navigation />
                  <SidebarWrapper>
                    <main className="min-h-screen text-white">
                      {children}
                    </main>
                  </SidebarWrapper>
                  <Toaster />
                  <ChatManager />
                </ThemeProvider>
              </NotificationProvider>
            </ChatProvider>
          </DispatcherProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
