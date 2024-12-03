import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const userSearchRoute = new Hono();

userSearchRoute.get("/user-search", async function (c) {
  const search = c.req.query("search");

  if (!search || search.trim() === "") {
    return c.json({ success: false, message: "Query is required" }, 400);
  }

  try {
    const results = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
          {
            id: {
              equals: isNaN(parseInt(search)) ? undefined : BigInt(search),
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        profilePhotoPath: true,
      },
      take: 10,
    });

    const formattedResults = results.map((user) => ({
      ...user,
      id: user.id.toString(),
    }));

    return c.json({ success: true, data: formattedResults });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching users:", error.message);
      return c.json(
        { error: "Failed to fetch users", details: error.message },
        500
      );
    }

    console.error("Unknown error:", error);
    return c.json({ error: "An unexpected error occurred" }, 500);
  }
});

export default userSearchRoute;
