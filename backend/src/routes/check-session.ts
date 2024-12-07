import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { profile } from "console";

const prisma = new PrismaClient();
const checkSessionRoute = new Hono();

checkSessionRoute.get("/check-session", async (c) => {
  const user = c.get("user");

  if (!user) {
    return c.json({ success: false, message: "Not authenticated" }, 401);
  }

  try {
    const userData = await prisma.user.findUnique({
      where: { id: BigInt(user.userId) },
      select: {
        username: true,
        name: true,
        email: true,
        profilePhotoPath: true,
      },
    });

    if (!userData) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    return c.json({
      success: true,
      user: {
        userId: user.userId,
        email: userData.email,
        username: userData.username,
        fullname: userData.name,
        profilePhotoPath: userData.profilePhotoPath,
      },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return c.json(
      { success: false, message: "Failed to fetch user data" },
      500
    );
  }
});

export default checkSessionRoute;
