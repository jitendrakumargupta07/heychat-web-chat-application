import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { TypeAnimation } from "react-type-animation";
import {
  getMessages,
  sendMessage,
  sendFileMessage,
  markSeen,
} from "../../api/message.api";
import MessageBubble from "./MessageBubble";
import { useAuth } from "../../context/AuthContext";
import ChatInput from "./ChatInput";
import socket from "../../socket";
import ImageModal from "./ImageModal";
import VideoModal from "./VideoModal";

const MessageList = ({ chatId, onNewMessage }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [showTyping, setShowTyping] = useState(false);
  const [previewImage, setImagePreview] = useState(null);
  const [previewVideo, setVideoPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef(null);

  // Load messages when chat changes
  useEffect(() => {
    if (!chatId || !user) return;

    setMessages([]);
    setShowTyping(false);
    setLoading(true);

    const fetchMessages = async () => {
      try {
        const data = await getMessages(chatId);

        const normalized = data.map((msg) => ({
          ...msg,
          delivered:
            String(msg.sender._id) === String(user._id)
              ? false
              : msg.delivered ?? false,
          seen: msg.seen ?? false,
        }));

        setMessages(normalized);
      } catch (err) {
        console.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatId, user]);

  // Typing indicator
  useEffect(() => {
    if (!chatId) return;

    const handleTyping = ({ chatId: typingChatId }) => {
      if (String(typingChatId) === String(chatId)) {
        setShowTyping(true);
      }
    };

    const handleStopTyping = ({ chatId: typingChatId }) => {
      if (String(typingChatId) === String(chatId)) {
        setShowTyping(false);
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [chatId]);

  // Auto scroll
  useLayoutEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, showTyping]);

  const handleSendMessage = async (text) => {
    try {
      const newMessage = await sendMessage({
        chatId,
        content: text,
      });

      setMessages((prev) => [
        ...prev,
        { ...newMessage, delivered: false, seen: false },
      ]);

      onNewMessage(chatId, newMessage.content);
    } catch {
      console.error("Failed to send message");
    }
  };

  const handleSendFile = async (file) => {
    const formData = new FormData();
    formData.append("chatId", chatId);
    formData.append("file", file);

    try {
      const newMessage = await sendFileMessage(formData);

      setMessages((prev) => [
        ...prev,
        { ...newMessage, delivered: false, seen: false },
      ]);

      onNewMessage(chatId, "📎 File");
    } catch {
      console.error("File send failed");
    }
  };

  // Join chat room
  useEffect(() => {
    if (chatId) socket.emit("join-chat", chatId);
  }, [chatId]);

  // Receive new messages
  useEffect(() => {
    if (!chatId || !user) return;

    const handleSocketMessage = (message) => {
      if (String(message.chat._id) !== String(chatId)) return;
      if (String(message.sender._id) === String(user._id)) return;

      setMessages((prev) => [...prev, message]);

      socket.emit("message-delivered", {
        messageId: message._id,
        chatId,
      });

      markSeen(chatId);
      onNewMessage(chatId, message.content);
    };

    socket.on("new-message", handleSocketMessage);
    return () => socket.off("new-message", handleSocketMessage);
  }, [chatId, user, onNewMessage]);

  // Delivered update
  useEffect(() => {
    const handleDelivered = ({ messageId, chatId: deliveredChatId }) => {
      if (String(deliveredChatId) !== String(chatId)) return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, delivered: true } : msg,
        ),
      );
    };

    socket.on("message-delivered", handleDelivered);
    return () => socket.off("message-delivered", handleDelivered);
  }, [chatId]);

  // Seen update
  useEffect(() => {
    const handleSeen = ({ chatId: seenChatId }) => {
      if (String(seenChatId) !== String(chatId)) return;

      setMessages((prev) =>
        prev.map((msg) =>
          String(msg.sender._id) === String(user._id)
            ? { ...msg, seen: true, delivered: true }
            : msg,
        ),
      );
    };

    socket.on("messages-seen", handleSeen);
    return () => socket.off("messages-seen", handleSeen);
  }, [chatId, user]);

  // Mark seen once when chat opens
  useEffect(() => {
    if (chatId) markSeen(chatId);
  }, [chatId]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400">
        Loading messages...
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 overflow-y-auto flex-col m-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            time={new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            isOwn={String(msg.sender._id) === String(user._id)}
            delivered={msg.delivered}
            seen={msg.seen}
            onImageClick={setImagePreview}
            onVideoClick={setVideoPreview}
          />
        ))}

        {showTyping && (
          <TypeAnimation
            sequence={[".", 300, "..", 300, "...", 600, "", 200]}
            speed={99}
            repeat={Infinity}
            className="ml-2 text-sm text-gray-200 font-medium tracking-widest select-none"
          />
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInput
        onSend={handleSendMessage}
        onSendFile={handleSendFile}
        socket={socket}
        chatId={chatId}
      />

      {previewImage && (
        <ImageModal
          imageUrl={previewImage}
          onClose={() => setImagePreview(null)}
        />
      )}

      {previewVideo && (
        <VideoModal
          videoUrl={previewVideo}
          onClose={() => setVideoPreview(null)}
        />
      )}
    </>
  );
};

export default MessageList;
