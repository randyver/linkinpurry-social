import { PrismaClient } from "@prisma/client";
import { notifyConnections } from "../utils/notifyConnections.js";

const prisma = new PrismaClient();

export const feedsRoute = async (c: any) => {
  try {
    const user = c.get("user");
    const userId = parseInt(user.userId, 10);

    if (!userId) {
      return c.json(
        {
          success: false,
          message: "User ID is required",
          body: null,
        },
        400
      );
    }

    const cursor = c.req.query("cursor");
    const limit = parseInt(c.req.query("limit"), 10) || 10;

    const connections = await prisma.connection.findMany({
      where: {
        OR: [{ fromId: BigInt(userId) }, { toId: BigInt(userId) }],
      },
      select: {
        fromId: true,
        toId: true,
      },
    });

    const connectedUserIds = new Set<bigint>();
    connectedUserIds.add(BigInt(userId));
    connections.forEach((connection) => {
      connectedUserIds.add(connection.fromId);
      connectedUserIds.add(connection.toId);
    });

    const feeds = await prisma.feed.findMany({
      where: {
        userId: {
          in: Array.from(connectedUserIds),
        },
        ...(cursor && { id: { lt: BigInt(cursor) } }),
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
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

    let nextCursor: string | null = null;
    if (feeds.length > limit) {
      nextCursor = feeds[limit].id.toString();
      feeds.pop();
    }

    const serializedFeeds = feeds.map((feed) => ({
      ...feed,
      id: feed.id.toString(),
      user: {
        ...feed.user,
        id: feed.user.id.toString(),
      },
    }));

    return c.json({
      success: true,
      message: "Feeds fetched successfully",
      body: {
        cursor: nextCursor,
        feeds: serializedFeeds,
      },
    });
  } catch (error) {
    console.error("Error fetching feeds:", error);
    return c.json(
      {
        success: false,
        message: "Failed to fetch feeds",
        body: null,
      },
      500
    );
  }
};

export const addFeedRoute = async (c: any) => {
  try {
    const user = c.get("user");
    const userId = parseInt(user.userId, 10);
    const { content } = await c.req.json();

    const newFeed = await prisma.feed.create({
      data: {
        content,
        userId,
        createdAt: new Date(),
      },
    });

    console.log("Notifying connections about new feed:", newFeed.id.toString());
    notifyConnections(BigInt(userId), newFeed.id.toString());

    return c.json({ id: newFeed.id.toString(), content: newFeed.content }, 201);

  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to create feed" }, 500);
  }
};

export const editFeedRoute = async (c: any) => {
  try {
    const feedId = BigInt(c.req.param("feed_id"));
    const { content } = await c.req.json();

    const feed = await prisma.feed.update({
      where: { id: feedId },
      data: { content },
    });

    return c.json({ content: feed.content });
  } catch (error) {
    console.error("Failed to update feed:", error);
    return c.json({ error: "Failed to update feed" }, 500);
  }
};

export const deleteFeedRoute = async (c: any) => {
  try {
    const feedId = BigInt(c.req.param("feed_id"));

    await prisma.feed.delete({
      where: { id: feedId },
    });

    return c.json({ message: "Feed deleted successfully" });
  } catch (error) {
    console.error("Failed to delete feed:", error);
    return c.json({ error: "Failed to delete feed" }, 500);
  }
};

export const detailFeedRoute = async (c: any) => {
  try {
    const feedId = BigInt(c.req.param("feed_id"));

    const feed = await prisma.feed.findUnique({
      where: { id: feedId },
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

    if (!feed) {
      return c.json({ error: "Feed not found" }, 404);
    }

    return c.json({
      id: feed.id.toString(),
      content: feed.content,
      createdAt: feed.createdAt,
      user: {
        id: feed.user.id.toString(),
        username: feed.user.username,
        name: feed.user.name,
        profilePhotoPath: feed.user.profilePhotoPath,
      },
    });
  } catch (error) {
    console.error("Failed to fetch feed details:", error);
    return c.json({ error: "Failed to fetch feed details" }, 500);
  }
}