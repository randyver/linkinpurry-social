import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";

const prisma = new PrismaClient();
const feedsRoute = new Hono();

feedsRoute.get("/feeds", async (c) => {
  try {
    const feeds = await prisma.feed.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            profilePhotoPath: true,
          },
        },
      },
    });

    const serializedFeeds = feeds.map((feed) => ({
      ...feed,
      id: feed.id.toString(),
      user: {
        ...feed.user,
        id: feed.user.id.toString(),
      },
    }));

    return c.json(serializedFeeds);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to fetch feeds" }, 500);
  }
});

export default feedsRoute;