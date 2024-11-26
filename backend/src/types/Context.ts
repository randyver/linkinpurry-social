import type { UserPayload } from './UserPayload.js';

declare module 'hono' {
  interface ContextVariableMap {
    user: UserPayload;
    access: number;
  }
}