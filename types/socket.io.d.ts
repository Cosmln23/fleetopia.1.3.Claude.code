declare module 'socket.io' {
  import type { Server as HTTPServer } from 'http';
  export class Server {
    constructor(server: HTTPServer, options?: any);
    emit(event: string, ...args: any[]): boolean;
    on(event: string, listener: (...args: any[]) => void): this;
    to(room: string): this;
    sockets: {
      adapter: {
        rooms: Map<string, any>;
      };
    };
    close(): void;
  }
  export interface Socket {
    id: string;
    emit(event: string, ...args: any[]): boolean;
    on(event: string, listener: (...args: any[]) => void): this;
  }
} 