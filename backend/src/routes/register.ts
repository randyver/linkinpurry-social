import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // Add this line to use JWT for token generation

const prisma = new PrismaClient();
const registerRoute = new Hono();

registerRoute.post("/register", async (c) => {
  try {
    const formData = await c.req.json();
    const { username, name, email, password } = formData;

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return c.json({ success: false, message: "Username or email already exists", body: {} }, 400);
    }

    // Hash password before saving to database
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        name,
        email,
        passwordHash: hashedPassword,
        profilePhotoPath: "https://pub-1220a31bae724d06910a9c77c9750e1a.r2.dev/profile_photos/default-profile-pic.png",
      },
    });

    // Convert BigInt to string
    const userIdString = newUser.id.toString();

    // Generate a token (for example, using JWT)
    const token = jwt.sign(
      { userId: userIdString, username: newUser.username },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );

    return c.json({
      success: true,
      message: "User registered successfully",
      body: { token },
    }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Failed to create user", body: {} }, 500);
  }
});

export default registerRoute;