import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";

const prisma = new PrismaClient();
const addFeedRoute = new Hono();

addFeedRoute.post("/add-feed", async (c) => {
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
});

export default addFeedRoute;