import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const feedsRoute = async (c: any) => {
  try {
    const user = c.get("user");
    const userId = parseInt(user.userId, 10);

    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    // Ambil parameter cursor dan limit dari query
    const cursor = c.req.query("cursor");
    const limit = parseInt(c.req.query("limit"), 10) || 10;

    // Ambil koneksi yang terkait dengan userId (pengguna yang terhubung)
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

    // Query untuk mengambil feeds dari pengguna yang terkoneksi
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

    // Tentukan cursor berikutnya untuk pagination
    let nextCursor: string | null = null;
    if (feeds.length > limit) {
      nextCursor = feeds[limit].id.toString();
      feeds.pop();
    }

    // Konversi BigInt ke string untuk serialisasi
    const serializedFeeds = feeds.map((feed) => ({
      ...feed,
      id: feed.id.toString(),
      user: {
        ...feed.user,
        id: feed.user.id.toString(),
      },
    }));

    // Kembalikan hasil feeds dan cursor untuk halaman berikutnya
    return c.json({
      feeds: serializedFeeds,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching feeds:", error);
    return c.json({ error: "Failed to fetch feeds" }, 500);
  }
};