import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    isGroupChat: {
      type: Boolean,
      default: false,
    },

    lastMessage: {
      type: String,
      default: "",
    },

    // Used for sorting chats
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true },
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
