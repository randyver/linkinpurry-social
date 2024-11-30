import { PrismaClient } from "@prisma/client";
import type { Context } from "hono";

const prisma = new PrismaClient();

export const feedsRoute = async (c: Context) => {
  try {
    // Ambil userId dari query parameter
    const userId = c.req.query("userId");

    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    // Ambil koneksi yang terkait dengan userId
    const connections = await prisma.connection.findMany({
      where: {
        OR: [{ fromId: BigInt(userId) }, { toId: BigInt(userId) }],
      },
      select: {
        fromId: true,
        toId: true,
      },
    });

    // Dapatkan semua userId yang terkoneksi (termasuk user itu sendiri)
    const connectedUserIds = new Set<bigint>();
    connectedUserIds.add(BigInt(userId));
    connections.forEach((connection) => {
      connectedUserIds.add(connection.fromId);
      connectedUserIds.add(connection.toId);
    });

    // Ambil feeds dari semua user yang terkoneksi
    const feeds = await prisma.feed.findMany({
      where: {
        userId: {
          in: Array.from(connectedUserIds),
        },
      },
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

    // Konversi BigInt ke string
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
};