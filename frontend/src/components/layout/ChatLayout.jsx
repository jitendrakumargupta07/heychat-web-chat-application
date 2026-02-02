import React from "react";
import chatBg from "../../assets/chatBackground.png";

const ChatLayout = ({ sidebar, chat }) => {
  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-[320px] bg-[#0f0f0f] border-r border-gray-800">
        {sidebar}
      </div>

      {/* Chat area */}
      <div className="flex-1 relative flex flex-col">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-50"
          style={{ backgroundImage: `url(${chatBg})` }}
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative flex flex-col h-full">{chat}</div>
      </div>
    </div>
  );
};

export default ChatLayout;
