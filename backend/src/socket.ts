import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import type { UserPayload } from "./types/UserPayload.js";
import { io } from "./index.js";

const prisma = new PrismaClient();

const SECRET_KEY = process.env.SECRET_KEY || "default_secret_key";

io.use((socket, next) => {
  const cookieHeader = socket.request.headers.cookie;
  if (!cookieHeader) return next(new Error("Authentication error"));

  const cookies = parse(cookieHeader);
  const token = cookies.token;

  if (!token) return next(new Error("Authentication error"));

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return next(new Error("Authentication error"));
    socket.userId = (decoded as UserPayload).userId;
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
    const { receiverId, message } = data;
    const senderId = socket.userId;

    if (senderId === receiverId) {
      return socket.emit("error", "You cannot send a message to yourself");
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });
    if (!receiver) {
      return socket.emit("error", "Receiver not found");
    }

    // // Verify that the sender and receiver are connected or friends
    // const connection = await prisma.connection.findFirst({
    //   where: {
    //     fromId: BigInt(senderId),
    //     toId: receiverId,
    //   },
    // });

    // if (!connection) {
    //   return socket.emit(
    //     "error",
    //     "You can only message users who are connected"
    //   );
    // }

    try {
      await saveMessage(senderId, receiverId, message);
      io.to(receiverId).emit("receiveMessage", { senderId, message });
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("error", "Failed to save message");
    }
  });
  
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

async function saveMessage(
  senderId: string,
  receiverId: string,
  message: string
) {
  console.log(`Saving message from ${senderId} to ${receiverId}: ${message}`);
  return await prisma.chat.create({
    data: {
      fromId: BigInt(senderId),
      toId: BigInt(receiverId),
      message: message,
    },
  });
}
