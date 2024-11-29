// socket.d.ts

import { Socket } from 'socket.io';

// Extending the `Socket` interface to include a `user` property
declare module 'socket.io' {
  interface Socket {
    userId: string;
  }
}