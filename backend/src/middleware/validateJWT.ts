import { Context } from "hono";
import jwt from "jsonwebtoken";
import type { UserPayload } from "../types/userPayload.js";

const SECRET_KEY = process.env.SECRET_KEY || "default_secret_key";

export async function validateJWT(c: Context, next: () => Promise<void>) {
  const cookie = c.req.header("Cookie");

  if (!cookie) {
    return c.json({ success: false, message: "Authentication required" }, 401);
  }

  const tokenMatch = cookie.match(/token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;

  if (!token) {
    return c.json({ success: false, message: "Authentication token missing" }, 401);
  }

  try {
    const payload = jwt.verify(token, SECRET_KEY) as UserPayload;
    c.set("user", payload);

    await next();
  } catch (error) {
    console.error("JWT validation error:", error);
    return c.json({ success: false, message: "Invalid or expired token" }, 401);
  }
}