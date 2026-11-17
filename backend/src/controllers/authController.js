import bcrypt from "bcryptjs";
import { getDatabase } from "../config/database.js";
function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}
export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      password.length < 8 ||
      password.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Provide a valid name, email, and password of at least 8 characters.",
      });
    }
    const db = getDatabase();
    const users = db.collection("users");
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await users.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await users.insertOne(user);
    user._id = result.insertedId;
    await new Promise((resolve, reject) => {
      req.login(user, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    return res.status(201).json({
      success: true,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create your account.",
    });
  }
}
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }
    const db = getDatabase();
    const user = await db.collection("users").findOne({
      email: email.trim().toLowerCase(),
    });
    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }
    await new Promise((resolve, reject) => {
      req.login(user, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
    return res.status(200).json({
      success: true,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to log in.",
    });
  }
}
export function getCurrentUser(req, res) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }
  return res.json({
    success: true,
    user: publicUser(req.user),
  });
}
export function logout(req, res, next) {
  req.logout((error) => {
    if (error) return next(error);
    req.session.destroy((sessionError) => {
      if (sessionError) return next(sessionError);
      res.clearCookie("candidate.sid");
      return res.json({
        success: true,
        message: "Logged out successfully.",
      });
    });
  });
}
