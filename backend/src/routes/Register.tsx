import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const prisma = new PrismaClient();
const registerRoute = new Hono();

// Tentukan `__dirname` secara manual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path untuk menyimpan foto profil
const UPLOADS_DIR = path.join(__dirname, "../../uploads");

// Pastikan folder untuk menyimpan file ada
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

registerRoute.post("/register", async (c) => {
  const formData = await c.req.parseBody();
  const { username, name, email, password } = formData as { [key: string]: string };
  const profilePhoto = formData.profilePhoto;

  try {
    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: "Invalid email format" }, 400);
    }

    // Periksa jika profilePhoto ada
    if (!profilePhoto || typeof profilePhoto === 'string') {
      return c.json({ error: "Profile picture is required" }, 400);
    }

    // Simpan file foto profil
    const fileName = `${nanoid()}.${profilePhoto.name.split(".").pop()}`;
    const profilePhotoPath = path.join(UPLOADS_DIR, fileName);
    const arrayBuffer = await profilePhoto.arrayBuffer();
    fs.writeFileSync(profilePhotoPath, Buffer.from(arrayBuffer));

    // Hash password sebelum menyimpan ke database
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        name,
        email,
        passwordHash: hashedPassword,
        profilePhotoPath,
      },
    });

    const userResponse = {
      ...newUser,
      id: newUser.id.toString(),
    };

    return c.json(userResponse, 201);
  } catch (error) {
    console.error(error);
    return c.json({ error: "Failed to create user" }, 400);
  }
});

export default registerRoute;