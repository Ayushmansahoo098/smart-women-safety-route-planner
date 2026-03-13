import express from "express";
import passport from "passport";
import { loginUser, oauthCallback, registerUser } from "../controllers/authController.js";
import { requireDatabase } from "../middleware/databaseMiddleware.js";

const router = express.Router();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ── Email / Password ────────────────────────────────────────────────────────
router.post("/register", requireDatabase, registerUser);
router.post("/login", requireDatabase, loginUser);

// ── Google OAuth ────────────────────────────────────────────────────────────
// Step 1: Redirect user to Google's consent screen
router.get("/google", (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.redirect(`${CLIENT_URL}/login?error=google_not_configured`);
    }
    return passport.authenticate("google", {
        scope: ["profile", "email"],
        session: false
    })(req, res, next);
});

// Step 2: Google redirects back here; passport verifies and calls oauthCallback
router.get(
    "/google/callback",
    (req, res, next) => {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            return res.redirect(`${CLIENT_URL}/login?error=google_not_configured`);
        }
        return passport.authenticate("google", {
            failureRedirect: `${CLIENT_URL}/login?error=google_failed`,
            session: false
        })(req, res, next);
    },
    oauthCallback
);

export default router;
