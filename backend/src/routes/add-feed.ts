import { PrismaClient } from "@prisma/client";
import type { Context } from "hono";

const prisma = new PrismaClient();

export const addFeedRoute = async (c: Context) => {
  try {
    const { content, userId } = await c.req.json();

    const newFeed = await prisma.feed.create({
      data: {
        content,
        userId,
        createdAt: new Date(),
      },
    });

    return c.json({ id: newFeed.id.toString(), content: newFeed.content }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to create feed" }, 500);
  }
};