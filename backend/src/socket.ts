import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import type { UserPayload } from "./types/UserPayload.js";
import { Server as SocketServer } from "socket.io";

const prisma = new PrismaClient();

const SECRET_KEY = process.env.SECRET_KEY || "default_secret_key";

export const attachSocket = (httpServer: any) => {
  const io = new SocketServer(httpServer, {
    transports: ["websocket"],
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const cookieHeader = socket.request.headers.cookie;
    if (!cookieHeader) return next(new Error("Authentication error"));

    const cookies = parse(cookieHeader);
    const token = cookies.token;

    if (!token) return next(new Error("Authentication error"));

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) return next(new Error("Authentication error"));
      socket.data.username = (decoded as UserPayload).userId;
      next();
    });
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("joinRoom", (userId) => {
      console.log(`User ${userId} joined their room`);
      socket.join(userId);
    });

    socket.on("sendMessage", async (data) => {
      const { senderId, receiverId, message, timestamp } = data;
      const validatedSenderId = socket.data.username;

      if (senderId !== validatedSenderId) {
        console.log("Sender ID not validated");
        return socket.emit("error", "Sender ID not validated");
      }

      if (validatedSenderId === receiverId) {
        console.log("You cannot send a message to yourself");
        return socket.emit("error", "You cannot send a message to yourself");
      }

      const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
      });
      if (!receiver) {
        console.log("Receiver not found");
        return socket.emit("error", "Receiver not found");
      }

      try {
        await saveMessage(validatedSenderId, receiverId, message, timestamp);

        io.to(receiverId).emit("receiveMessage", {
          senderId: validatedSenderId,
          message,
          timestamp,
        });
      } catch (error) {
        console.log("Error saving message:", error);
        socket.emit("error", "Failed to save message");
      }
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
};

async function saveMessage(
  senderId: string,
  receiverId: string,
  message: string,
  timestamp: string
) {
  console.log(`Saving message from ${senderId} to ${receiverId}: ${message}`);
  return await prisma.chat.create({
    data: {
      fromId: BigInt(senderId),
      toId: BigInt(receiverId),
      message: message,
      timestamp: new Date(timestamp),
    },
  });
}
