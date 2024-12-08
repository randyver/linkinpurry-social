import { Hono } from "hono";
import { sendPushNotification } from "../utils/sendPushNotification.js";

const notificationRoute = new Hono();

notificationRoute.post("/send-push-notification", async (c) => {
  const { userId, notificationType, message, url } = await c.req.json();

  try {
    await sendPushNotification(userId, notificationType, message, url);
    return c.json({ success: true });
  } catch (error) {
    console.log(error);
    return c.json({
      success: false,
      message: "Failed to send notification"
    });
  }
});

export default notificationRoute;