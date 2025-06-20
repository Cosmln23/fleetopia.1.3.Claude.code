import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { dispatcherEvents } from '@/lib/dispatcher-events';

export async function GET(request: NextRequest) {
  try {
    console.log('=== SSE DISPATCHER EVENTS START ===');
    
    console.log('1. Getting auth for SSE...');
    const { userId } = await auth();
    console.log('2. SSE Auth result:', { userId: userId ? 'PRESENT' : 'NULL' });
    
    if (!userId) {
      console.log('3. SSE No userId - returning 401');
      return new Response('Unauthorized', { status: 401 });
    }

    console.log('4. Creating SSE stream...');
    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        console.log('5. SSE Stream started');
        const writer = controller;
        
        try {
          // Add client to event emitter
          console.log('6. Adding client to dispatcher events...');
          dispatcherEvents.addClient(userId, writer as any);
          
          // Send initial connection message
          console.log('7. Sending welcome message...');
          const welcomeMessage = `event: connected\ndata: ${JSON.stringify({ 
            message: 'Dispatcher notifications connected',
            timestamp: new Date().toISOString()
          })}\n\n`;
          
          writer.enqueue(new TextEncoder().encode(welcomeMessage));
          console.log('8. Welcome message sent');
          
          // Keep-alive ping every 30 seconds
          const keepAlive = setInterval(() => {
            try {
              const pingMessage = `event: ping\ndata: ${JSON.stringify({ 
                timestamp: new Date().toISOString() 
              })}\n\n`;
              writer.enqueue(new TextEncoder().encode(pingMessage));
              console.log('SSE ping sent');
            } catch (error) {
              console.log('SSE ping error:', error);
              clearInterval(keepAlive);
              dispatcherEvents.removeClient(userId);
            }
          }, 30000);
          
          // Cleanup on disconnect
          request.signal.addEventListener('abort', () => {
            console.log('SSE connection aborted');
            clearInterval(keepAlive);
            dispatcherEvents.removeClient(userId);
            controller.close();
          });
        } catch (streamError) {
          console.error('SSE stream setup error:', streamError);
          controller.error(streamError);
        }
      }
    });

    console.log('9. Returning SSE response');
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });
    
  } catch (error) {
    console.error('=== SSE DISPATCHER EVENTS ERROR ===');
    console.error('SSE Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
