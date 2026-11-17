import express from "express";
import passport from "../config/passport.js";
import {
  register,
  login,
  logout,
  getCurrentUser,
} from "../controllers/authController.js";
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", getCurrentUser);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google`,
  }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL);
  },
);
export default router;
