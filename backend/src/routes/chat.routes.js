import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createOrGetChat,
  getMyChats,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/", protect, createOrGetChat);
router.get("/", protect, getMyChats);

export default router;
