import { Hono } from "hono";

const vapidRoute = new Hono();

vapidRoute.get("/vapid-key", (c) => {
  const vapidKey = process.env.VAPID_PUBLIC_KEY!;
  console.log("VAPID Key:", vapidKey);
  if (!vapidKey) {
    return c.json({ error: "VAPID key not set in the environment" }, 500);
  }
  return c.json({ vapidKey });
});

export default vapidRoute;