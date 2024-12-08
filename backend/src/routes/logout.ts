import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { setCookie } from "hono/cookie";

const prisma = new PrismaClient();

const logoutRoute = new Hono();

logoutRoute.post("/logout", async (c) => {
  try {
    const user = c.get("user");

    if (!user) {
      return c.json({ success: false, message: "User not logged in" }, 400);
    }

    await prisma.pushSubscription.updateMany({
      where: {
        userId: BigInt(user.userId),
      },
      data: {
        userId: null,
      },
    });

    setCookie(c, "token", "", {
      httpOnly: true,
      maxAge: 0,
      sameSite: "Strict",
      path: "/",
      secure: true,
    });

    return c.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Error during logout:", error);
    return c.json({ success: false, message: "Logout failed" }, 500);
  }
});

export default logoutRoute;