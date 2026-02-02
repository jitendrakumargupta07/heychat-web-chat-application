import React, { useEffect, useState } from "react";
import ChatLayout from "../components/layout/ChatLayout";
import Sidebar from "../components/sidebar/Sidebar";
import ChatHeader from "../components/chat/ChatHeader";
import MessageList from "../components/chat/MessageList";
import { getMyChats } from "../api/chat.api";
import socket from "../socket";

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load chats ONCE — single source of truth
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const data = await getMyChats();
        setChats(Array.isArray(data) ? data : []);
      } catch {
        console.error("Failed to load chats");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  // Online users socket listener
  useEffect(() => {
    const handleOnlineUsers = (users) => {
      setOnlineUsers(Array.isArray(users) ? users : []);
    };

    socket.on("online-users", handleOnlineUsers);

    return () => {
      socket.off("online-users", handleOnlineUsers);
    };
  }, []);

  const handleNewMessage = (chatId, lastMessage) => {
    setChats((prevChats) => {
      const updated = prevChats.map((chat) =>
        String(chat._id) === String(chatId)
          ? {
              ...chat,
              lastMessage,
              lastMessageAt: new Date().toISOString(),
            }
          : chat,
      );

      return [...updated].sort(
        (a, b) =>
          new Date(b.lastMessageAt || 0) -
          new Date(a.lastMessageAt || 0),
      );
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-400">
        Loading chats...
      </div>
    );
  }

  return (
    <ChatLayout
      sidebar={
        <Sidebar
          chats={chats}
          setChats={setChats}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
        />
      }
      chat={
        selectedChat ? (
          <>
            <ChatHeader chat={selectedChat} onlineUsers={onlineUsers} />
            <MessageList
              chatId={selectedChat._id}
              onNewMessage={handleNewMessage}
            />
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-200 text-xl">
            Select a chat to start messaging
          </div>
        )
      }
    />
  );
};

export default Chat;
