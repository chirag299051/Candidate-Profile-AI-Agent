import express from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../config/database.js";
import { answerCandidateQuestion } from "../services/ragService.js";
const router = express.Router();
router.post("/:conversationId/messages", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { question } = req.body;
    if (!ObjectId.isValid(conversationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID.",
      });
    }
    if (typeof question !== "string" || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid question.",
      });
    }
    if (question.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Question cannot exceed 1000 characters.",
      });
    }
    const db = getDatabase();
    const conversations = db.collection("conversations");
    const conversation = await conversations.findOne({
      _id: new ObjectId(conversationId),
      userId: req.user._id,
    });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }
    const history = conversation.messages.slice(-8).map((message) => ({
      role: message.role,
      content: message.content,
    }));
    const trimmedQuestion = question.trim();
    const result = await answerCandidateQuestion(trimmedQuestion, history);
    const userMessage = {
      role: "user",
      content: trimmedQuestion,
      createdAt: new Date(),
    };
    const assistantMessage = {
      role: "assistant",
      content: result.answer,
      sources: result.sources,
      createdAt: new Date(),
    };
    const update = {
      $push: {
        messages: {
          $each: [userMessage, assistantMessage],
        },
      },
      $set: {
        updatedAt: new Date(),
      },
    };
    if (conversation.messages.length === 0) {
      update.$set.title = trimmedQuestion.slice(0, 60);
    }
    await conversations.updateOne(
      {
        _id: conversation._id,
        userId: req.user._id,
      },
      update,
    );
    return res.status(200).json({
      success: true,
      answer: result.answer,
      sources: result.sources,
      messages: [userMessage, assistantMessage],
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const status =
      Number(error.status || error.code) === 429
        ? 429
        : Number(error.status || error.code) === 503
          ? 503
          : 500;
    return res.status(status).json({
      success: false,
      message:
        status === 429
          ? "AI service rate limit reached. Please try again shortly."
          : status === 503
            ? "AI service is temporarily unavailable. Please try again."
            : "Something went wrong while answering your question.",
    });
  }
});
export default router;
