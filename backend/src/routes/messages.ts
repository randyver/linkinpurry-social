import { PrismaClient } from "@prisma/client";
import type { Context } from "hono";

const prisma = new PrismaClient();

/**
 * Get chat history
 */
export const getChatHistoryHandler = async (c: Context) => {
  const { userId, oppositeUserId } = c.req.param();
  const user = c.get("user");

  if (!user) {
    return c.json({ success: false, message: "User not authenticated" }, 401);
  }

  if (user.userId !== userId) {
    return c.json({ success: false, message: "You can only access your own chat history" }, 403);
  }

  try {
    const chatHistory = await prisma.chat.findMany({
      where: {
        OR: [
          { fromId: BigInt(userId), toId: BigInt(oppositeUserId) },
          { fromId: BigInt(oppositeUserId), toId: BigInt(userId) },
        ],
      },
      orderBy: {
        timestamp: "asc",
      },
      select: {
        fromId: true,
        toId: true,
        message: true,
        timestamp: true,
      },
    });

    if (chatHistory.length === 0) {
      return c.json({ success: true, message: "No chat history found", data: [] });
    }

    const formattedChatHistory = chatHistory.map((msg) => ({
      senderId: msg.fromId.toString(),
      receiverId: msg.toId.toString(),
      message: msg.message,
      timestamp: msg.timestamp,
    }));

    return c.json({
      success: true,
      message: "Chat history fetched successfully",
      data: formattedChatHistory,
    });
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "Failed to fetch chat history" }, 500);
  }
};