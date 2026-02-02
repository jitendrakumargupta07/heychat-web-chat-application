import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Text message
    content: {
      type: String,
      trim: true,
      required: function () {
        return this.messageType === "text";
      },
    },

    // File / media
    fileUrl: {
      type: String,
      required: function () {
        return this.messageType !== "text";
      },
    },

    fileName: {
      type: String,
    },

    fileType: {
      type: String,
    },

    fileSize: {
      type: Number,
    },

    messageType: {
      type: String,
      enum: ["text", "image", "video", "file"],
      default: "text",
    },

    delivered: {
      type: Boolean,
      default: false,
    },

    deliveredAt: {
      type: Date,
    },

    seen: {
      type: Boolean,
      default: false,
    },

    seenAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
