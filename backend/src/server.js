import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "./config/passport.js";
import {
  connectDatabase,
  closeDatabase,
  getDatabase,
} from "./config/database.js";
import healthRoutes from "./routes/health.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import authRoutes from "./routes/auth.routes.js";
import passwordResetRoutes from "./routes/passwordReset.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import { requireAuth } from "./middleware/authMiddleware.js";
const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5050;
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: "candidate.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      dbName: process.env.MONGODB_DB_NAME,
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60,
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 14 * 24 * 60 * 60 * 1000,
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", requireAuth, chatRoutes);
app.use("/api/password", passwordResetRoutes);
app.use("/api/conversations", requireAuth, conversationRoutes);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});
async function startServer() {
  try {
    await connectDatabase();
    const users = getDatabase().collection("users");
    await users.createIndex({ email: 1 }, { unique: true });
    await users.createIndex({ googleId: 1 }, { unique: true, sparse: true });
    const conversations = getDatabase().collection("conversations");
    await conversations.createIndex({ userId: 1, updatedAt: -1 });

    const server = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
    const shutdown = async () => {
      console.log("Shutting down server...");
      server.close(async () => {
        await closeDatabase();
        process.exit(0);
      });
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}
startServer();
