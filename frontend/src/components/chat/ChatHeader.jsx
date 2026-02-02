import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const ChatHeader = ({ chat, onlineUsers = [] }) => {
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);

  if (!chat || !user) return null;

  const otherUser = chat.participants?.find(
    (p) => p?._id && p._id !== user._id
  );

  const isOnline =
    otherUser && Array.isArray(onlineUsers)
      ? onlineUsers.includes(otherUser._id)
      : false;

  const initials = otherUser?.name
    ? otherUser.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div className="relative h-16 px-4 flex items-center justify-between border-b border-gray-800 bg-[#0f0f0f]">
      {/* Left user info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center font-bold">
          {initials}
        </div>

        <div>
          <p className="font-medium text-sm">
            {otherUser?.name || "Chat"}
          </p>
          <p
            className={`text-xs ${
              isOnline ? "text-green-400" : "text-gray-400"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* ⋮ and details box */}
      <div className="relative">
        <button
          onClick={() => setShowDetails((p) => !p)}
          className="text-gray-400 cursor-pointer text-xl p-2 rounded hover:bg-[#1f1f1f]"
        >
          ⋮
        </button>

        {/* Details popover */}
        {showDetails && (
          <div className="absolute right-0 top-12 w-56 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-lg z-50 p-4 text-sm">
            <p className="text-xs text-gray-400 mb-3">
              Conversation with
            </p>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Name</span>
                <span>{otherUser?.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span>{otherUser?.email}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Status</span>
                <span
                  className={`flex items-center gap-1 ${
                    isOnline ? "text-green-400" : "text-gray-400"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOnline ? "bg-green-400" : "bg-gray-500"
                    }`}
                  ></span>
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
