import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";

const prisma = new PrismaClient();
const userRoute = new Hono();

userRoute.get("/user", async (c) => {
  const email = c.req.query("email");

  if (!email) {
    return c.json({ error: "Email is required" }, 400);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
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