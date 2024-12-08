import { PrismaClient } from "@prisma/client";
import { sendPushNotification } from "./sendPushNotification.js";

const prisma = new PrismaClient();

export const notifyConnections = async (userId: bigint, feedId: string) => {
  try {
    const connections = await prisma.connection.findMany({
      where: {
        OR: [
          { fromId: userId },
          { toId: userId },
        ],
      },
    });

    const connectionUserIds = connections.map((conn) =>
      conn.fromId === userId ? conn.toId : conn.fromId
    );

    const pushSubscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: { in: connectionUserIds },
      },
    });

    for (const subscription of pushSubscriptions) {
      const message = `One of your connections has posted a new update!`;
      const url = `http://localhost:5173/feed/${feedId}`;

      await sendPushNotification(
        Number(subscription.userId),
        "feed",
        message,
        url
      );
    }

    console.log("Notifications sent to all connections about the new feed.");
  } catch (error) {
    console.error("Error notifying connections:", error);
  }
};