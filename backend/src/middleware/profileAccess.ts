import { PrismaClient } from "@prisma/client";
import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

/**
 * Access:
 * 1: Public
 * 2: Not Connected
 * 3: Connected
 * 4: Owner
 */
export async function profileAccessMiddleware(c: Context, next: () => Promise<void>) {
  const userIdParam = c.req.param("user_id");
  const targetUserId = parseInt(userIdParam, 10);

  console.log(userIdParam);

  if (isNaN(targetUserId)) {
    return c.json({ success: false, message: "Invalid user ID" }, 400);
  }

  const token = getCookie(c, "token");
  let currentUserId: number | null = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY || "default_secret_key") as { userId: string };
      currentUserId = parseInt(decoded.userId, 10);
    } catch {
      currentUserId = null;
    }
  }

  if (!currentUserId) {
    c.set("access", 1);
    return await next();
  }

  if (BigInt(currentUserId) === BigInt(targetUserId)) {
    c.set("access", 4);
    return await next();
  }

  const isConnected = await prisma.connection.findFirst({
    where: {
      fromId: BigInt(currentUserId),
      toId: BigInt(targetUserId),
    },
  });

  if (isConnected) {
    c.set("access", 3);
  } else {
    c.set("access", 2);
  }

  await next();
}