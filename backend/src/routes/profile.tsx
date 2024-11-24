import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import { writeFile } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();
const profileRoute = new Hono();

/**
 * Get Profile
 */
profileRoute.get("/profile/:user_id", async (c) => {
  try {
    const userIdParam = c.req.param("user_id");
    const targetUserId = parseInt(userIdParam, 10);
    const currentUserIdHeader = c.req.header("user-id");

    if (isNaN(targetUserId)) {
      return c.json({ success: false, message: "Invalid user ID" }, 400);
    }

    const currentUserId = currentUserIdHeader
      ? parseInt(currentUserIdHeader, 10)
      : null;

    const user = await prisma.user.findUnique({
      where: { id: BigInt(targetUserId) },
      select: {
        username: true,
        name: true,
        workHistory: true,
        skills: true,
        profilePhotoPath: true,
        feeds: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { sentConnections: true },
        },
      },
    });

    if (!user) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    const responseBody: any = {
      username: user.username,
      name: user.name,
      profile_photo: user.profilePhotoPath,
      connection_count: user._count.sentConnections,
      relevant_posts: user.feeds.map((post) => ({
        id: post.id.toString(),
        content: post.content,
        created_at: post.createdAt.toISOString(),
      })),
    };

    if (!currentUserId) {
      // Public Access (Unauthenticated)
      return c.json({
        success: true,
        message: "Profile fetched",
        body: responseBody,
      });
    }

    if (BigInt(currentUserId) === BigInt(targetUserId)) {
      // Owner (Full access)
      responseBody.work_history = user.workHistory;
      responseBody.skills = user.skills;
    } else {
      // Check if connected
      const isConnected = await prisma.connection.findFirst({
        where: {
          OR: [
            { fromId: BigInt(currentUserId), toId: BigInt(targetUserId) },
            { fromId: BigInt(targetUserId), toId: BigInt(currentUserId) },
          ],
        },
      });

      if (isConnected) {
        // Connected Access
        responseBody.work_history = user.workHistory;
        responseBody.skills = user.skills;
      } else {
        // Not Connected (Authenticated but limited access)
        responseBody.relevant_posts = [];
      }
    }

    return c.json({
      success: true,
      message: "Profile fetched",
      body: responseBody,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return c.json({ success: false, message: "Failed to fetch profile" }, 500);
  }
});

/**
 * Save Base64 encoded image to the filesystem
 * @param base64Image Base64 encoded string
 * @param userId User ID for generating a unique filename
 * @returns Path to the saved image
 */
async function saveBase64Image(
  base64Image: string,
  userId: number
): Promise<string> {
  const matches = base64Image.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid Base64 image format");
  }

  const [, mimeType, data] = matches;
  const extension = mimeType.split("/")[1];
  const filename = `user_${userId}.${extension}`;
  const uploadDir = path.join(__dirname, "uploads");
  const filePath = path.join(uploadDir, filename);

  await writeFile(filePath, Buffer.from(data, "base64"));

  return `/uploads/${filename}`;
}

/**
 * Update Profile
 */
profileRoute.put("/profile/:user_id", async (c) => {
  try {
    const userIdParam = c.req.param("user_id");
    const userId = parseInt(userIdParam, 10);
    const currentUserIdHeader = c.req.header("user-id");

    if (isNaN(userId)) {
      return c.json({ success: false, message: "Invalid user ID" }, 400);
    }

    const currentUserId = currentUserIdHeader
      ? parseInt(currentUserIdHeader, 10)
      : null;
    if (!currentUserId || BigInt(currentUserId) !== BigInt(userId)) {
      return c.json({ success: false, message: "Unauthorized" }, 403);
    }

    const { username, name, workHistory, skills, profilePhoto } =
      await c.req.json();

    if (!username || !name) {
      return c.json(
        { success: false, message: "Username and name are required" },
        400
      );
    }

    const updateData: any = {
      username,
      name,
      workHistory: workHistory || "",
      skills: skills || "",
    };

    if (profilePhoto) {
      const photoPath = await saveBase64Image(profilePhoto, userId);
      updateData.profilePhotoPath = photoPath;
    }

    const updatedUser = await prisma.user.update({
      where: { id: BigInt(userId) },
      data: updateData,
    });

    return c.json({
      success: true,
      message: "Profile updated successfully",
      body: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return c.json({ success: false, message: "Failed to update profile" }, 500);
  }
});

export default profileRoute;
