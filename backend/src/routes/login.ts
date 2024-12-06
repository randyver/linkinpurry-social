import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { setCookie } from "hono/cookie";

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
      profilePhotoPath: user.profilePhotoPath,
    };

    const token = jwt.sign(payload, SECRET_KEY, {
      algorithm: "HS256",
      expiresIn: TOKEN_EXPIRATION,
    });

    setCookie(c, "token", token, {
      secure: true,
      httpOnly: true,
      maxAge: 3600,
      sameSite: "None",
    });

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
