import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const registerRoute = new Hono();

registerRoute.post("/register", async (c) => {
  try {
    const formData = await c.req.json();
    const { username, name, email, password } = formData;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return c.json({ success: false, message: "Username or email already exists", body: {} }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        name,
        email,
        passwordHash: hashedPassword,
        profilePhotoPath: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
      },
    });

    const userIdString = newUser.id.toString();

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