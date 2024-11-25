import { PrismaClient } from "@prisma/client";
import type { Context } from "hono";
import fs from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

export const getProfileHandler = async (c: Context) => {
  try {
    const userIdParam = c.req.param("user_id");
    const targetUserId = parseInt(userIdParam, 10);

    if (isNaN(targetUserId)) {
      return c.json({ success: false, message: "Invalid user ID" }, 400);
    }

    const access = c.get("access");
    let userFields: any = {
      username: true,
      name: true,
      profilePhotoPath: true,
      workHistory: true,
      skills: true,
      _count: { select: { sentConnections: true } },
    };

    if (access >= 2) {
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
      work_history: targetUser.workHistory,
      skills: targetUser.skills,
    };

    if (access >= 2) {
      responseBody.relevant_posts = targetUser.feeds?.map((post: any) => ({
        id: post.id.toString(),
        content: post.content,
        created_at: post.createdAt.toISOString(),
      }));
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
};

/**
 * Update Profile
 */
export const updateProfileHandler = async (c: Context) => {
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
      //Not unique file name, so no need for deleting file (just overwrite)
      const newPhotoName = `profile_photo_user_${userId}`;
      const filePath = path.join(
        uploadDir,
        newPhotoName
      );
      await fs.writeFile(
        filePath,
        Buffer.from(await profilePhoto.arrayBuffer())
      );
      updateData.profilePhotoPath = `/uploads/${newPhotoName}`;
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
};
