import React from "react";

const MessageBubble = ({
  message,
  time,
  isOwn,
  delivered,
  seen,
  onImageClick,
  onVideoClick,
}) => {
  if (!message) return null;

  const { messageType, content, fileUrl, fileName, fileSize } = message;

  let status = "✓";
  if (seen) status = "seen";
  else if (delivered) status = "✓✓";

  const fileFullUrl = fileUrl
    ? `${import.meta.env.VITE_BACKEND_URL}${fileUrl}`
    : null;

  return (
    <div
      className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm mb-2 mr-3
        ${
          isOwn
            ? "ml-auto bg-green-600 text-white rounded-br-none"
            : "mr-auto bg-[#1f1f1f] text-white rounded-bl-none"
        }`}
    >
      {/* text message */}
      {messageType === "text" && (
        <p className="break-words">{content}</p>
      )}

      {/* image message */}
      {messageType === "image" && fileFullUrl && (
        <img
          src={fileFullUrl}
          alt="image"
          onClick={() => onImageClick?.(fileFullUrl)}
          className="rounded-lg max-h-60 cursor-pointer hover:opacity-90"
        />
      )}

      {/* video message */}
      {messageType === "video" && fileFullUrl && (
        <video
          src={fileFullUrl}
          controls
          className="rounded-lg max-h-60"
          onClick={() => onVideoClick?.(fileFullUrl)}
        />
      )}

      {/* file message */}
      {messageType === "file" && fileFullUrl && (
        <a
          href={fileFullUrl}
          download
          className="flex items-center gap-2 bg-black/20 p-2 rounded-lg"
        >
          <span className="text-xl">📎</span>
          <div className="max-w-[180px]">
            <p className="text-sm truncate">{fileName || "File"}</p>
            {fileSize && (
              <p className="text-[10px] opacity-60">
                {(fileSize / 1024).toFixed(1)} KB
              </p>
            )}
          </div>
        </a>
      )}

      {/* time and status */}
      <div className="flex justify-end items-center gap-1 mt-1">
        <p className="text-[10px] opacity-60">{time}</p>

        {isOwn && (
          <span className="text-[10px] opacity-70 tick-animate">
            {status}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
