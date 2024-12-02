import { PrismaClient } from "@prisma/client";
import type { Context } from "hono";

const prisma = new PrismaClient();

export const deleteFeedRoute = async (c: Context) => {
  try {
    // Extract feed_id from the URL params
    const feedId = BigInt(c.req.param("feed_id")); // Parse feed_id from the route

    // Delete the feed
    await prisma.feed.delete({
      where: { id: feedId },
    });

    return c.json({ message: "Feed deleted successfully" });
  } catch (error) {
    console.error("Failed to delete feed:", error);
    return c.json({ error: "Failed to delete feed" }, 500);
  }
};