import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

// Map<userId, socketId>
const onlineUsers = new Map();

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      if (!process.env.JWT_SECRET) {
        return next(new Error("JWT_SECRET missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId || decoded._id || decoded.id;

      if (!socket.userId) {
        return next(new Error("Invalid token payload"));
      }

      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;

    // remove old socket if exists (reconnect fix)
    if (onlineUsers.has(userId)) {
      const oldSocketId = onlineUsers.get(userId);
      io.sockets.sockets.get(oldSocketId)?.disconnect(true);
    }

    onlineUsers.set(userId, socket.id);
    socket.join(userId); // personal room

    io.emit("online-users", Array.from(onlineUsers.keys()));

    console.log(`🟢 User connected: ${userId}`);

    socket.on("join-chat", (chatId) => {
      if (!chatId) return;
      socket.join(chatId);
    });

    socket.on("typing", ({ chatId }) => {
      socket.to(chatId).emit("typing", { chatId });
    });

    socket.on("stopTyping", ({ chatId }) => {
      socket.to(chatId).emit("stopTyping", { chatId });
    });

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("online-users", Array.from(onlineUsers.keys()));
      console.log(`🔴 User disconnected: ${userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
