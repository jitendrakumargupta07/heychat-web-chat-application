import React, { useEffect, useState } from "react";
import { getMyChats, createChat } from "../../api/chat.api";
import { getUsers } from "../../api/user.api";
import { useAuth } from "../../context/AuthContext";
import UserList from "./UserList";
import LogoutButton from "./LogoutButton";
import socket from "../../socket";

const Sidebar = ({
  chats,
  setChats,
  selectedChat,
  onSelectChat,
  onlineUsers = [],
}) => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [showUsers, setShowUsers] = useState(false);
  const [users, setUsers] = useState([]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);

  // ✅ FIX: OWN PROFILE IS ALWAYS ONLINE
  const isOnline = true;

  const handleStartChat = async (selectedUser) => {
    try {
      const chat = await createChat(selectedUser._id);

      onSelectChat(chat);

      setChats((prev) => {
        const exists = prev.find((c) => c._id === chat._id);
        return exists ? prev : [chat, ...prev];
      });

      setShowUsers(false);
    } catch (error) {
      console.error("Failed to start chat", error);
    }
  };

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const data = await getMyChats();
        setChats(data);
      } catch {
        console.error("Failed to load chats");
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    if (!showUsers) return;

    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch {
        console.error("Failed to load users");
      }
    };

    fetchUsers();
  }, [showUsers]);

  useEffect(() => {
    socket.on("unread-count-updated", ({ chatId, unreadCount }) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === chatId
            ? {
                ...chat,
                unreadCount: {
                  ...chat.unreadCount,
                  [user._id]: unreadCount,
                },
              }
            : chat,
        ),
      );
    });

    socket.on("unread-count-reset", ({ chatId }) => {
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === chatId
            ? {
                ...chat,
                unreadCount: {
                  ...chat.unreadCount,
                  [user._id]: 0,
                },
              }
            : chat,
        ),
      );
    });

    return () => {
      socket.off("unread-count-updated");
      socket.off("unread-count-reset");
    };
  }, [user._id, setChats]);

  if (loading) {
    return <div className="p-4 text-gray-500">Loading chats...</div>;
  }

  return (
    <>
      <div className="h-full flex flex-col bg-[#0f0f0f]">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-lg">HeyChat</p>

            <div className="relative">
              <button
                onClick={() => setMenuOpen((p) => !p)}
                className="text-gray-400 text-xl p-1 rounded hover:bg-[#1f1f1f]"
              >
                ⋮
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-lg z-50">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-[#2a2a2a]"
                    onClick={() => {
                      setModal("profile");
                      setMenuOpen(false);
                    }}
                  >
                    Profile
                  </button>

                  <button
                    className="w-full text-left px-4 py-2 hover:bg-[#2a2a2a]"
                    onClick={() => {
                      setModal("edit");
                      setMenuOpen(false);
                    }}
                  >
                    Edit profile
                  </button>

                  <button
                    className="w-full text-left px-4 py-2 hover:bg-[#2a2a2a]"
                    onClick={() => {
                      setModal("password");
                      setMenuOpen(false);
                    }}
                  >
                    Change password
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-400">{user?.name}</p>
        </div>

        <button
          onClick={() => setShowUsers((p) => !p)}
          className="p-3 text-sm text-green-400 hover:bg-[#1a1a1a] text-left"
        >
          Start new chat
        </button>

        {showUsers && (
          <UserList users={users} onSelectUser={handleStartChat} />
        )}

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => {
            const otherUser = chat.participants?.find(
              (p) => p._id !== user?._id,
            );

            const unread =
              chat.unreadCount?.[user._id] ??
              chat.unreadCount?.get?.(user._id) ??
              0;

            return (
              <div
                key={chat._id}
                onClick={() => {
                  setChats((prev) =>
                    prev.map((c) =>
                      c._id === chat._id
                        ? {
                            ...c,
                            unreadCount: {
                              ...c.unreadCount,
                              [user._id]: 0,
                            },
                          }
                        : c,
                    ),
                  );
                  onSelectChat(chat);
                }}
                className={`p-4 cursor-pointer border-b border-gray-800 ${
                  selectedChat?._id === chat._id
                    ? "bg-[#1f1f1f]"
                    : "hover:bg-[#141414]"
                }`}
              >
                <div className="flex justify-between items-center">
                  <p className="font-medium">
                    {otherUser?.name || "Unknown User"}
                  </p>

                  {unread > 0 && (
                    <span className="bg-green-500 text-black text-xs px-2 py-0.5 rounded-full">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-400 truncate">
                  {chat.lastMessage || "Start a conversation"}
                </p>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-800">
          <LogoutButton />
        </div>
      </div>

      {/* PROFILE MODAL */}
      {modal === "profile" && (
        <Modal title="Profile" onClose={() => setModal(null)}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-700 rounded-full flex items-center justify-center text-xl font-bold">
              {user.name?.[0]?.toUpperCase()}
            </div>

            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-gray-400">{user.email}</p>

              <div className="flex items-center gap-1 mt-1 text-xs text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                Online
              </div>
            </div>
          </div>
        </Modal>
      )}

      {modal === "edit" && (
        <Modal title="Edit Profile" onClose={() => setModal(null)}>
          <input
            defaultValue={user.name}
            className="w-full mb-3 bg-[#1a1a1a] p-2 rounded border border-gray-700"
          />
          <input
            defaultValue={user.email}
            className="w-full mb-4 bg-[#1a1a1a] p-2 rounded border border-gray-700"
          />
          <button className="w-full bg-green-600 py-2 rounded">
            Save changes
          </button>
        </Modal>
      )}

      {modal === "password" && (
        <Modal title="Change Password" onClose={() => setModal(null)}>
          <input
            type="password"
            placeholder="Current password"
            className="w-full mb-3 bg-[#1a1a1a] p-2 rounded border border-gray-700"
          />
          <input
            type="password"
            placeholder="New password"
            className="w-full mb-4 bg-[#1a1a1a] p-2 rounded border border-gray-700"
          />
          <button className="w-full bg-green-600 py-2 rounded">
            Update password
          </button>
        </Modal>
      )}
    </>
  );
};

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className="bg-[#0f0f0f] w-96 rounded-xl border border-gray-800 p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-lg">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          ✕
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default Sidebar;
