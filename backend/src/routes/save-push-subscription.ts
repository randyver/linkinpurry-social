import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const savePushSubscription = async (c: any) => {
  try {
    console.log("Saving push subscription");
    const user = c.get("user");
    const { endpoint, keys } = await c.req.json();
    
    console.log("Request Body:", { endpoint, keys });

    if (!user || !endpoint || !keys) {
      return c.json({ error: "Invalid subscription data" }, 400);
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { keys, userId: BigInt(user.userId) },
      create: { endpoint, keys, userId: BigInt(user.userId) },
    });

    return c.json({ message: "Subscription saved successfully" });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    return c.json({ error: "Failed to save subscription" }, 500);
  }
};
