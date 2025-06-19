// Enhanced in-memory event emitter with proper connection management
class DispatcherEventEmitter {
  private clients = new Map<string, {
    writer: WritableStreamDefaultWriter;
    lastPing: number;
    connectionId: string;
  }>();
  private cleanupInterval: NodeJS.Timeout;
  
  constructor() {
    // Clean up stale connections every 60 seconds
    this.cleanupInterval = setInterval(() => {
      this.cleanupStaleConnections();
    }, 60000);
  }
  
  addClient(userId: string, writer: WritableStreamDefaultWriter) {
    // Remove existing connection for this user to prevent duplicates
    this.removeClient(userId);
    
    const connectionId = `${userId}-${Date.now()}`;
    this.clients.set(userId, {
      writer,
      lastPing: Date.now(),
      connectionId
    });
    
    console.log(`Dispatcher client connected: ${userId} (${connectionId})`);
    return connectionId;
  }
  
  removeClient(userId: string) {
    const client = this.clients.get(userId);
    if (client) {
      try {
        // Attempt to close the writer gracefully
        client.writer.close?.();
      } catch (error) {
        // Writer might already be closed, ignore error
      }
      this.clients.delete(userId);
      console.log(`Dispatcher client disconnected: ${userId} (${client.connectionId})`);
    }
  }
  
  updateLastPing(userId: string) {
    const client = this.clients.get(userId);
    if (client) {
      client.lastPing = Date.now();
    }
  }
  
  cleanupStaleConnections() {
    const now = Date.now();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes
    
    for (const [userId, client] of Array.from(this.clients.entries())) {
      if (now - client.lastPing > staleThreshold) {
        console.log(`Cleaning up stale connection for user: ${userId}`);
        this.removeClient(userId);
      }
    }
  }
  
  async emitToUser(userId: string, event: string, data: any) {
    const client = this.clients.get(userId);
    if (client) {
      try {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        await client.writer.write(new TextEncoder().encode(message));
        this.updateLastPing(userId);
      } catch (error) {
        console.error(`Error sending SSE message to ${userId}:`, error);
        this.removeClient(userId);
      }
    }
  }
  
  async emitToAll(event: string, data: any) {
    const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    const encoder = new TextEncoder();
    
    for (const [userId, client] of Array.from(this.clients.entries())) {
      try {
        await client.writer.write(encoder.encode(message));
      } catch (error) {
        console.error(`Error sending to client ${userId}:`, error);
        this.removeClient(userId);
      }
    }
  }
}

// Global instance
export const dispatcherEvents = new DispatcherEventEmitter(); 