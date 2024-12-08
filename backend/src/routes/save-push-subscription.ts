import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const savePushSubscription = async (c: any) => {
  try {
    const user = c.get("user");
    const { endpoint, keys } = await c.req.json();

    if (!user || !endpoint || !keys) {
      return c.json({ error: "Invalid subscription data" }, 400);
    }
    const existingSubscription = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    });

    if (existingSubscription) {
      await prisma.pushSubscription.update({
        where: { endpoint },
        data: {
          userId: BigInt(user.userId),
          keys,
        },
      });

      return c.json({ message: "Subscription updated successfully" });
    } else {
      await prisma.pushSubscription.create({
        data: {
          endpoint,
          keys,
          userId: BigInt(user.userId),
        },
      });

      return c.json({ message: "Subscription saved successfully" });
    }
  } catch (error) {
    return c.json({ error: "Failed to save or update subscription" }, 500);
  }
};