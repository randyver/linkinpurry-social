import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";

const prisma = new PrismaClient();
const usersRoute = new Hono();

usersRoute.get("/users", async (c) => {
  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "10");
  const excludeEmail = c.req.query("excludeEmail") || null;

  if (!excludeEmail) {
    console.error("Missing excludeEmail parameter");
    return c.json({ error: "excludeEmail parameter is required" }, 400);
  }

  const skip = (page - 1) * limit;

  try {
    console.log("Pagination details:", { skip, limit });
    console.log("Exclude email:", excludeEmail);

    const users = await prisma.user.findMany({
      skip,
      take: limit,
      where: {
        email: {
          not: excludeEmail,
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        profilePhotoPath: true,
      },
    });

    const usersFormatted = users.map((user) => ({
      ...user,
      id: Number(user.id),
    }));

    const totalUsers = await prisma.user.count({
      where: {
        email: {
          not: excludeEmail,
        },
      },
    });

    console.log("Fetched users:", usersFormatted);
    console.log("Total users:", totalUsers);

    return c.json({
      users: usersFormatted,
      totalUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});

export default usersRoute;
