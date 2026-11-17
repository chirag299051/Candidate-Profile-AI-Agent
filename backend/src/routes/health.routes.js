import express from "express";
import { getDatabase } from "../config/database.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await getDatabase().command({ ping: 1 });

    res.status(200).json({
      success: true,
      message: "Candidate Profile Agent API is running",
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection unavailable",
    });
  }
});

export default router;
