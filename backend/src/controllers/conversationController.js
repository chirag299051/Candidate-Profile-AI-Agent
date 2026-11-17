import { ObjectId } from "mongodb";
import { getDatabase } from "../config/database.js";
export async function createConversation(req, res) {
  try {
    const db = getDatabase();
    const conversation = {
      userId: req.user._id,
      title: "New Conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection("conversations").insertOne(conversation);
    return res.status(201).json({
      success: true,
      conversation: {
        id: result.insertedId.toString(),
        title: conversation.title,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    console.error("Create conversation error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create conversation.",
    });
  }
}
export async function getConversations(req, res) {
  try {
    const conversations = await getDatabase()
      .collection("conversations")
      .find(
        { userId: req.user._id },
        {
          projection: {
            title: 1,
            createdAt: 1,
            updatedAt: 1,
            messages: { $slice: 1 },
          },
        },
      )
      .sort({ updatedAt: -1 })
      .toArray();
    return res.status(200).json({
      success: true,
      conversations: conversations.map((conversation) => ({
        id: conversation._id.toString(),
        title: conversation.title,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messageCount: conversation.messages?.length || 0,
      })),
    });
  } catch (error) {
    console.error("Get conversations error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load conversations.",
    });
  }
}
export async function getConversation(req, res) {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID.",
      });
    }
    const conversation = await getDatabase()
      .collection("conversations")
      .findOne({
        _id: new ObjectId(id),
        userId: req.user._id,
      });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }
    return res.status(200).json({
      success: true,
      conversation: {
        id: conversation._id.toString(),
        title: conversation.title,
        messages: conversation.messages,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get conversation error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load conversation.",
    });
  }
}
