import webpush from "web-push";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY!;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY!;

export const sendPushNotification = async (
  userId: number,
  notificationType: string,
  message: string,
  url: string
) => {
  webpush.setVapidDetails(
    "mailto:your-email@example.com",
    vapidPublicKey,
    vapidPrivateKey
  );

  try {
    const subscription = await prisma.pushSubscription.findFirst({
      where: {
        userId: BigInt(userId),
      },
    });

    if (!subscription) {
      throw new Error("No push subscription found for this user");
    }

    const { endpoint, keys } = subscription;

    const { p256dh, auth } = keys as { p256dh: string; auth: string };

    if (!p256dh || !auth) {
      throw new Error("Push subscription keys are missing");
    }

    let notificationPayload;
    if (notificationType === "message") {
      notificationPayload = {
        notification: {
          title: "New message from your friend!",
          body: message,
          icon: "/icon.png",
          data: { url },
        },
      };
    } else if (notificationType === "feed") {
      notificationPayload = {
        notification: {
          title: "New post from your connection!",
          body: message,
          icon: "/icon.png",
          data: { url },
        },
      };
    } else {
      throw new Error("Invalid notification type");
    }

    await webpush.sendNotification(
      {
        endpoint: endpoint,
        keys: {
          p256dh: p256dh,
          auth: auth,
        },
      },
      JSON.stringify(notificationPayload)
    );

    console.log(
      `Push notification sent successfully for ${notificationType} notification!`
    );
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};
