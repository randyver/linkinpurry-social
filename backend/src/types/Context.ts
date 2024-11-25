import type { UserPayload } from "./userPayload.js";

declare module "hono" {
  interface Context {
    user: UserPayload;
  }
}