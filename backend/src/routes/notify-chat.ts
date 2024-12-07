import { PrismaClient } from "@prisma/client";
import type { Context } from "hono";
import webpush from "web-push";

const prisma = new PrismaClient();

export const notifyChatHandler = async (c: Context) => {
  const { senderId, receiverId, message } = await c.req.json();

  if (!senderId || !receiverId || !message) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  try {
    console.log("Notifying user:", receiverId);

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: BigInt(receiverId) },
    });

    if (subscriptions.length === 0) {
      console.log("No subscriptions found for user:", receiverId);
      return c.json({ error: "No subscriptions found" }, 404);
    }

    const payload = JSON.stringify({
      title: "New Message",
      message: `${message}`,
      url: "http://localhost:5173/messages",
    });

    const vapidKeys = {
      publicKey: process.env.VAPID_PUBLIC_KEY!,
      privateKey: process.env.VAPID_PRIVATE_KEY!,
    };

    webpush.setVapidDetails(
      "mailto:your-email@example.com",
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );

    await Promise.all(
      subscriptions.map((subscription) =>
        webpush.sendNotification(subscription, payload).catch((err: Error) => {
          console.error("Failed to send notification:", err);
        })
      )
    );

    return c.json({ success: true });
  } catch (error) {
    console.error("Error notifying chat recipient:", error);
    return c.json({ error: "Failed to send notification" }, 500);
  }
};
