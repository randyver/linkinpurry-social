import jwt from "jsonwebtoken";
import { getCookie } from "hono/cookie";
import type { UserPayload } from "../types/UserPayload.js";
import type { Context } from "hono";

const SECRET_KEY = process.env.SECRET_KEY || "default_secret_key";

export async function validateJWT(c: Context, next: () => Promise<void>) {
  console.log("Middleware...");
  const token = getCookie(c, "token");

  if (!token) {
    return c.json(
      { success: false, message: "Authentication token missing" },
      401
    );
  }

  try {
    const payload = jwt.verify(token, SECRET_KEY) as UserPayload;
    console.log("JWT Decoded:", payload);
    c.set("user", payload);
    await next();
  } catch (error) {
    console.error("JWT validation error:", error);
    return c.json({ success: false, message: "Invalid or expired token" }, 401);
  }
}
