import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import { getIO } from "../socket.js";

/* SEND TEXT MESSAGE */
export const sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;

    if (!chatId || !content) {
      return res
        .status(400)
        .json({ message: "Chat ID and content are required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const message = await Message.create({
      chat: chatId,
      sender: req.user._id,
      content,
      messageType: "text",
    });

    chat.lastMessage = content;
    chat.lastMessageAt = new Date();

    const senderId = req.user._id.toString();
    const receiverId = chat.participants.find(
      (id) => id.toString() !== senderId,
    )?.toString();

    const io = getIO();

    // Check if receiver is in chat room
    const room = io.sockets.adapter.rooms.get(chatId);
    let receiverInRoom = false;

    if (room && receiverId) {
      for (const socketId of room) {
        const socket = io.sockets.sockets.get(socketId);
        if (socket?.userId === receiverId) {
          receiverInRoom = true;
          break;
        }
      }
    }

    // Handle unread count
    if (!receiverInRoom && receiverId) {
      const unread =
        chat.unreadCount?.[receiverId] ??
        chat.unreadCount?.get?.(receiverId) ??
        0;

      chat.unreadCount.set
        ? chat.unreadCount.set(receiverId, unread + 1)
        : (chat.unreadCount[receiverId] = unread + 1);

      io.to(receiverId).emit("unread-count-updated", {
        chatId,
        unreadCount:
          chat.unreadCount?.[receiverId] ??
          chat.unreadCount?.get?.(receiverId),
      });
    }

    await chat.save();

    const fullMessage = await Message.findById(message._id)
      .populate("sender", "name email")
      .populate("chat");

    io.to(chatId).emit("new-message", fullMessage);

    res.status(201).json(fullMessage);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* SEND FILE MESSAGE */
export const sendFileMessage = async (req, res) => {
  try {
    const { chatId } = req.body;
    const file = req.file;

    if (!chatId || !file) {
      return res.status(400).json({ message: "Chat ID and file are required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const messageType = file.mimetype.startsWith("image")
      ? "image"
      : file.mimetype.startsWith("video")
      ? "video"
      : "file";

    const message = await Message.create({
      chat: chatId,
      sender: req.user._id,
      messageType,
      fileUrl: `/uploads/${file.filename}`,
      fileName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
    });

    chat.lastMessage =
      messageType === "file" ? "📎 File" : `📷 ${messageType}`;
    chat.lastMessageAt = new Date();

    const senderId = req.user._id.toString();
    const receiverId = chat.participants.find(
      (id) => id.toString() !== senderId,
    )?.toString();

    const io = getIO();

    if (receiverId) {
      const unread =
        chat.unreadCount?.[receiverId] ??
        chat.unreadCount?.get?.(receiverId) ??
        0;

      chat.unreadCount.set
        ? chat.unreadCount.set(receiverId, unread + 1)
        : (chat.unreadCount[receiverId] = unread + 1);

      io.to(receiverId).emit("unread-count-updated", {
        chatId,
        unreadCount:
          chat.unreadCount?.[receiverId] ??
          chat.unreadCount?.get?.(receiverId),
      });
    }

    await chat.save();

    const fullMessage = await Message.findById(message._id)
      .populate("sender", "name email")
      .populate("chat");

    io.to(chatId).emit("new-message", fullMessage);

    res.status(201).json(fullMessage);
  } catch (error) {
    console.error("File send error:", error);
    res.status(500).json({ message: "File send failed" });
  }
};

/* GET MESSAGES */
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* MARK MESSAGE AS DELIVERED */
export const markAsDelivered = async (req, res) => {
  try {
    const { messageId, chatId } = req.body;

    await Message.findByIdAndUpdate(messageId, {
      delivered: true,
      deliveredAt: new Date(),
    });

    const io = getIO();
    io.to(chatId).emit("message-delivered", {
      messageId,
      chatId,
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Delivery update error:", error);
    res.sendStatus(500);
  }
};

/* MARK MESSAGES AS SEEN */
export const markAsSeen = async (req, res) => {
  try {
    const { chatId } = req.body;

    await Message.updateMany(
      {
        chat: chatId,
        seen: false,
        sender: { $ne: req.user._id },
      },
      {
        seen: true,
        seenAt: new Date(),
      },
    );

    await Chat.findByIdAndUpdate(chatId, {
      $set: {
        [`unreadCount.${req.user._id}`]: 0,
      },
    });

    const io = getIO();

    io.to(chatId).emit("messages-seen", { chatId });
    io.to(req.user._id.toString()).emit("unread-count-reset", { chatId });

    res.sendStatus(200);
  } catch (error) {
    console.error("Seen update error:", error);
    res.sendStatus(500);
  }
};
