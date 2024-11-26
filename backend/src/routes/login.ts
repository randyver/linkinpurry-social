import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const loginRoute = new Hono();

const SECRET_KEY = process.env.SECRET_KEY || "default_secret_key";
const TOKEN_EXPIRATION = 3600;

loginRoute.post("/login", async (c) => {
  const { email, password } = await c.req.json();

  try {
    // Based only by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return c.json(
        { success: false, message: "Invalid email or password" },
        401
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return c.json(
        { success: false, message: "Invalid email or password" },
        401
      );
    }

    const payload = {
      userId: user.id.toString(),
      email: user.email,
      username: user.username,
      fullname: user.name,
    };

    const token = jwt.sign(payload, SECRET_KEY, {
      algorithm: "HS256",
      expiresIn: TOKEN_EXPIRATION,
    });

    // Set token in cookie (note: Add HttpOnly later)
    c.header("Set-Cookie", `token=${token}; Max-Age=${TOKEN_EXPIRATION}`);

    return c.json({
      success: true,
      message: "Login successful",
      body: {
        token,
      },
    });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Failed to login" }, 400);
  }
});

export default loginRoute;