import React, { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";

const ChatInput = ({ onSend, onSendFile, chatId, socket }) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!socket || !chatId) return;

    if (!isTyping && value.trim()) {
      setIsTyping(true);
      socket.emit("typing", { chatId });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { chatId });
      setIsTyping(false);
    }, 2000);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target) &&
        !emojiButtonRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const escListener = (e) => {
      if (e.key === "Escape") setShowEmojiPicker(false);
    };

    document.addEventListener("keydown", escListener);
    return () =>
      document.removeEventListener("keydown", escListener);
  }, []);

  const handleEmojiClick = (emojiData) => {
    if (!inputRef.current) return;

    const emoji = emojiData.emoji;
    const cursorPos = inputRef.current.selectionStart;

    const updatedMessage =
      message.slice(0, cursorPos) +
      emoji +
      message.slice(cursorPos);

    setMessage(updatedMessage);

    setTimeout(() => {
      inputRef.current.focus();
      inputRef.current.selectionStart =
        inputRef.current.selectionEnd =
          cursorPos + emoji.length;
    }, 0);
  };

  const handleSend = () => {
    if (!socket || !chatId) return;

    if (selectedFile) {
      onSendFile(selectedFile);
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    if (!message.trim()) return;

    onSend(message);
    setMessage("");

    socket.emit("stopTyping", { chatId });
    setIsTyping(false);
    clearTimeout(typingTimeoutRef.current);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    if (file.type.startsWith("image") || file.type.startsWith("video")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      clearTimeout(typingTimeoutRef.current);
    };
  }, [previewUrl]);

  return (
    <div className="relative">
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-16 left-4 z-50">
          <EmojiPicker
            theme="dark"
            emojiStyle="native"
            onEmojiClick={handleEmojiClick}
          />
        </div>
      )}

      {selectedFile && (
        <div className="absolute bottom-20 left-4 right-4 bg-[#1a1a1a] p-3 rounded-xl flex items-center gap-3 shadow-lg">
          {selectedFile.type.startsWith("image") && (
            <img
              src={previewUrl}
              alt="preview"
              className="w-20 h-20 object-cover rounded"
            />
          )}

          {selectedFile.type.startsWith("video") && (
            <video src={previewUrl} className="w-24 h-20 rounded" muted />
          )}

          {!selectedFile.type.startsWith("image") &&
            !selectedFile.type.startsWith("video") && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">
                    {(selectedFile.size / 1024).toFixed(1)}KB
                  </p>
                </div>
              </div>
            )}

          <button
            onClick={() => {
              setSelectedFile(null);
              setPreviewUrl(null);
            }}
            className="ml-auto text-red-400 hover:text-red-500"
          >
            ✕
          </button>
        </div>
      )}

      <div className="h-16 px-4 flex items-center gap-3 border-t border-gray-800 bg-[#0f0f0f]">
        <button
          ref={emojiButtonRef}
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="text-xl hover:scale-110 transition"
        >
          😊
        </button>

        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 px-4 py-2 rounded-full bg-[#1a1a1a] text-sm outline-none"
        />

        <button
          onClick={() => fileInputRef.current.click()}
          className="text-xl hover:scale-110 transition"
        >
          📎
        </button>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleFileSelect}
        />

        <button
          onClick={handleSend}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full text-sm"
        >
          {selectedFile ? "Upload" : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
