import { PrismaClient } from "@prisma/client";
import type { Context } from "hono";

const prisma = new PrismaClient();

export const editFeedRoute = async (c: Context) => {
  try {
    // Extract feed_id from the URL params and content from request body
    const feedId = BigInt(c.req.param("feed_id")); // Parse feed_id from the route
    const { content } = await c.req.json();

    // Update feed content
    const feed = await prisma.feed.update({
      where: { id: feedId },
      data: { content },
    });

    return c.json({ id: feed.id.toString(), content: feed.content });
  } catch (error) {
    console.error("Failed to update feed:", error);
    return c.json({ error: "Failed to update feed" }, 500);
  }
};