import express from "express";
import {
  createConversation,
  getConversations,
  getConversation,
} from "../controllers/conversationController.js";
const router = express.Router();
router.post("/", createConversation);
router.get("/", getConversations);
router.get("/:id", getConversation);
export default router;
