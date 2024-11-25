import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import fs from "fs/promises";
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

    if (isNaN(targetUserId)) {
      return c.json({ success: false, message: "Invalid user ID" }, 400);
    }

    const user = c.get("user");
    const currentUserId = user ? parseInt(user.userId, 10) : null;

    let accessLevel = "public";
    if (currentUserId) {
      if (BigInt(currentUserId) === BigInt(targetUserId)) {
        accessLevel = "owner";
      } else {
        const isConnected = await prisma.connection.findFirst({
          where: {
            fromId: BigInt(currentUserId),
            toId: BigInt(targetUserId),
          },
        });
        accessLevel = isConnected ? "connected" : "not_connected";
      }
    }

    let userFields: any = {
      username: true,
      name: true,
      profilePhotoPath: true,
      _count: { select: { sentConnections: true } },
    };

    if (accessLevel === "owner" || accessLevel === "connected") {
      userFields.workHistory = true;
      userFields.skills = true;
      userFields.feeds = {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, content: true, createdAt: true },
      };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: BigInt(targetUserId) },
      select: userFields,
    });

    if (!targetUser) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    const responseBody: any = {
      username: targetUser.username,
      name: targetUser.name,
      profile_photo: targetUser.profilePhotoPath,
      connection_count: targetUser.connection_count,
    };

    if (accessLevel === "owner" || accessLevel === "connected") {
      responseBody.work_history = targetUser.workHistory;
      responseBody.skills = targetUser.skills;
      responseBody.relevant_posts = targetUser.feeds?.map((post: any) => ({
        id: post.id.toString(),
        content: post.content,
        created_at: post.createdAt.toISOString(),
      }));
    } else if (accessLevel === "not_connected") {
      responseBody.relevant_posts = [];
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
 * Update Profile
 */
profileRoute.put("/profile/:user_id", async (c) => {
  try {
    const userIdParam = c.req.param("user_id");
    const userId = parseInt(userIdParam, 10);

    if (isNaN(userId)) {
      return c.json({ success: false, message: "Invalid user ID" }, 400);
    }

    const user = c.get("user");
    if (!user || parseInt(user.userId, 10) !== userId) {
      return c.json({ success: false, message: "Unauthorized" }, 403);
    }

    const formData = await c.req.formData();
    const username = formData.get("username") as string;
    const name = formData.get("name") as string;
    const workHistory = formData.get("work_history") as string;
    const skills = formData.get("skills") as string;
    const profilePhoto = formData.get("profile_photo");

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

    const uploadDir = path.join(__dirname, "../uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    if (profilePhoto && typeof profilePhoto !== "string") {
      const filePath = path.join(
        uploadDir,
        `user_${userId}_${Date.now()}_${profilePhoto.name}`
      );
      await fs.writeFile(
        filePath,
        Buffer.from(await profilePhoto.arrayBuffer())
      );
      updateData.profilePhotoPath = `/uploads/${path.basename(filePath)}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: BigInt(userId) },
      data: updateData,
    });

    return c.json({
      success: true,
      message: "Profile updated successfully",
      body: {
        username: updatedUser.username,
        name: updatedUser.name,
        workHistory: updatedUser.workHistory,
        skills: updatedUser.skills,
        profilePhotoPath: updatedUser.profilePhotoPath,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return c.json({ success: false, message: "Failed to update profile" }, 500);
  }
});

export default profileRoute;
