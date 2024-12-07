import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
import webpush from "web-push";

export const notifyConnections = async (userId: bigint, postId: string) => {
  try {
    console.log("Notifying connections for user:", userId);
    const connections = await prisma.connection.findMany({
      where: {
        OR: [{ fromId: userId }, { toId: userId }],
      },
    });

    const connectedUserIds = new Set<bigint>();
    connections.forEach((connection) => {
      connectedUserIds.add(connection.fromId);
      connectedUserIds.add(connection.toId);
    });
    connectedUserIds.delete(userId);

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: { in: Array.from(connectedUserIds) } },
    });

    console.log("Found subscriptions:", subscriptions);

    const payload = JSON.stringify({
      title: "New Post Alert",
      message: `A connection has posted something new!`,
      url: `http://localhost:5173/post/${postId}`,
    });

    const vapidKeys = {
      publicKey: process.env.VAPID_PUBLIC_KEY!,
      privateKey: process.env.VAPID_PRIVATE_KEY!,
    };
    webpush.setVapidDetails("mailto:your-email@example.com", vapidKeys.publicKey, vapidKeys.privateKey);

    await Promise.all(
      subscriptions.map((subscription) =>
        webpush.sendNotification(subscription, payload).catch((err: Error) => {
          console.error("Failed to send notification:", err);
        })
      )
    );
  } catch (error) {
    console.error("Error notifying connections:", error);
  }
};
