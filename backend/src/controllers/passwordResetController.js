import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getDatabase } from "../config/database.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
const RESET_TOKEN_EXPIRY = 15 * 60 * 1000;
export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;
    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const users = getDatabase().collection("users");
    const user = await users.findOne({ email: normalizedEmail });
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      const resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_EXPIRY);
      await users.updateOne(
        { _id: user._id },
        {
          $set: {
            resetTokenHash,
            resetTokenExpiry,
          },
        },
      );
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      try {
        await sendPasswordResetEmail(normalizedEmail, resetUrl);
      } catch (emailError) {
        console.error("Password reset email failed:", emailError.message);
        await users.updateOne(
          { _id: user._id, resetTokenHash },
          {
            $unset: {
              resetTokenHash: "",
              resetTokenExpiry: "",
            },
          },
        );
      }
    }
    return res.status(200).json({
      success: true,
      message:
        "If an account exists with that email, a password reset link will be sent.",
    });
  } catch (error) {
    console.error("Password reset request error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to process your request. Please try again.",
    });
  }
}
export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/i.test(token) ||
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 128
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired reset link, or password does not meet the requirements.",
      });
    }
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const passwordHash = await bcrypt.hash(password, 12);
    const users = getDatabase().collection("users");
    const result = await users.updateOne(
      {
        resetTokenHash,
        resetTokenExpiry: { $gt: new Date() },
      },
      {
        $set: {
          passwordHash,
          updatedAt: new Date(),
        },
        $unset: {
          resetTokenHash: "",
          resetTokenExpiry: "",
        },
      },
    );
    if (result.modifiedCount !== 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset link.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Password reset error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to reset your password. Please try again.",
    });
  }
}
