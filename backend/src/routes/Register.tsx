import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const registerRoute = new Hono();

registerRoute.post("/register", async (c) => {
  try {
    // Extract user data from the request body
    const {
      username,
      email,
      password,
      workHistory = "",
      skills = "",
      profilePhotoPath = "",
    } = await c.req.json();

    // Validate required fields
    if (!username || !email || !password) {
      return c.json(
        {
          success: false,
          message: "Username, email, and password are required",
        },
        400
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        name: username, // Set name to username as default
        passwordHash: hashedPassword,
        workHistory,
        skills,
        profilePhotoPath,
      },
    });

    // Convert BigInt to string for JSON serialization
    const userResponse = {
      ...newUser,
      id: newUser.id.toString(),
    };

    return c.json({ success: true, data: userResponse }, 201);
  } catch (error) {
    console.error("Error creating user:", (error as Error).message);

    return c.json(
      {
        success: false,
        message: "Failed to create user",
        error: (error as Error).message,
      },
      400
    );
  }
});

export default registerRoute;
