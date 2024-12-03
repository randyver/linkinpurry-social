import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";

const prisma = new PrismaClient();
const usersRoute = new Hono();

usersRoute.get("/users", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "10");
  const excludedId = c.req.query("excludedId");
  const excludedIdParsed = excludedId ? parseInt(excludedId, 10) : null;

  if (page < 1 || limit < 1) {
    return c.json({ success: false, message: "Invalid page or limit" }, 400);
  }

  const skip = (page - 1) * limit;

  try {
    const totalUsers = await prisma.user.count({
      where: excludedIdParsed !== null
        ? {
            id: {
              not: excludedIdParsed,
            },
          }
        : undefined,
    });

    const users = await prisma.user.findMany({
      skip,
      take: limit,
      where: excludedIdParsed !== null
        ? {
            id: {
              not: excludedIdParsed,
            },
          }
        : undefined,
      select: {
        id: true,
        username: true,
        name: true,
        profilePhotoPath: true,
        sentConnections: {
          where: { toId: excludedIdParsed || undefined },
        },
        receivedConnections: {
          where: { fromId: excludedIdParsed || undefined },
        },
        sentRequests: {
          where: { toId: excludedIdParsed || undefined },
        },
        receivedRequests: {
          where: { fromId: excludedIdParsed || undefined },
        },
      },
    });

    const usersFormatted = users.map((user) => ({
      id: user.id.toString(),
      username: user.username,
      name: user.name,
      profilePhotoPath: user.profilePhotoPath || null,
      isConnected:
        user.sentConnections.length > 0 || user.receivedConnections.length > 0,
      hasPendingRequest:
        user.sentRequests.length > 0 || user.receivedRequests.length > 0,
    }));

    const hasMore = skip + users.length < totalUsers;

    return c.json({
      users: usersFormatted,
      totalUsers: totalUsers.toString(),
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});


export default usersRoute;
