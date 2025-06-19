import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { dispatcherEvents } from '@/lib/dispatcher-events';

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      const writer = controller;
      
      // Add client to event emitter
      dispatcherEvents.addClient(userId, writer as any);
      
      // Send initial connection message
      const welcomeMessage = `event: connected\ndata: ${JSON.stringify({ 
        message: 'Dispatcher notifications connected',
        timestamp: new Date().toISOString()
      })}\n\n`;
      
      writer.enqueue(new TextEncoder().encode(welcomeMessage));
      
      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          const pingMessage = `event: ping\ndata: ${JSON.stringify({ 
            timestamp: new Date().toISOString() 
          })}\n\n`;
          writer.enqueue(new TextEncoder().encode(pingMessage));
        } catch (error) {
          clearInterval(keepAlive);
          dispatcherEvents.removeClient(userId);
        }
      }, 30000);
      
      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        dispatcherEvents.removeClient(userId);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}
