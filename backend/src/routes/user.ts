import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";

const prisma = new PrismaClient();
const userRoute = new Hono();

userRoute.get("/user", async (c) => {
  const userId = c.req.query("userId");

  if (!userId) {
    return c.json({ error: "userId is required" }, 400);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        profilePhotoPath: true,
      },
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const response = {
      ...user,
      id: user.id.toString(),
    };

    return c.json(response);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to fetch user" }, 500);
  }
});

export default userRoute;