import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import bcrypt from "bcryptjs";

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
      return c.json({ error: "Username or email already exists" }, 400);
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

    return c.json({ id: newUser.id.toString(), username: newUser.username }, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to create user" }, 500);
  }
});

export default registerRoute;