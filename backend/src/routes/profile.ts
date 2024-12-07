import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import type { Context } from "hono";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

/**
 * Get profile
 */
export const getProfileHandler = async (c: Context) => {
  try {
    console.log("here");
    const userIdParam = c.req.param("user_id");
    const targetUserId = parseInt(userIdParam, 10);
    const loggedInUserIdParam = c.req.query("logged_in_user_id");
    const loggedInUserId = loggedInUserIdParam
      ? parseInt(loggedInUserIdParam, 10)
      : -1;

    // if (isNaN(targetUserId) || !loggedInUserId || (loggedInUserId && isNaN(loggedInUserId))) {
    //   return c.json({ success: false, message: "Invalid user ID" }, 400);
    // }

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

    const targetUser: any = await prisma.user.findUnique({
      where: { id: BigInt(targetUserId) },
      select: userFields,
    });

    if (!targetUser) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    const connection = await prisma.connection.findUnique({
      where: {
        fromId_toId: {
          fromId: BigInt(loggedInUserId),
          toId: BigInt(targetUserId),
        },
      },
    });

    const responseBody: any = {
      username: targetUser.username,
      name: targetUser.name,
      profile_photo: targetUser.profilePhotoPath,
      connection_count: targetUser._count.sentConnections || 0,
      work_history: targetUser.workHistory,
      skills: targetUser.skills,
      is_connected: !!connection,
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
 * Update profile
 */
export const updateProfileHandler = async (c: Context) => {
  try {
    console.log("here");
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
    const currentPassword = formData.get("current_password") as string;
    const newPassword = formData.get("new_password") as string;

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

    if (currentPassword && newPassword) {
      const userRecord = await prisma.user.findUnique({
        where: { id: BigInt(userId) },
      });

      if (!userRecord) {
        return c.json({ success: false, message: "User not found" }, 404);
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        userRecord.passwordHash
      );

      if (!isPasswordValid) {
        return c.json(
          { success: false, message: "Current password is incorrect" },
          400
        );
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      updateData.passwordHash = hashedNewPassword;
    } else if (newPassword) {
      return c.json(
        {
          success: false,
          message: "Current password is required to update the password",
        },
        400
      );
    }

    if (profilePhoto && typeof profilePhoto !== "string") {
      const fileBuffer = Buffer.from(await profilePhoto.arrayBuffer());
      const fileKey = `profile_photos/user_${userId}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: fileKey,
          Body: fileBuffer,
          ContentType: profilePhoto.type,
          CacheControl: "no-cache"
        })
      );

      const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileKey}`;
      updateData.profilePhotoPath = publicUrl;
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
