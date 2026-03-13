import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { validatePasswordStrength } from "../utils/passwordValidation.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email = "") {
  return email.trim().toLowerCase();
}

function isValidEmail(email = "") {
  return EMAIL_REGEX.test(email);
}

function signJwt(user) {
  return jwt.sign(
    {
      sub: user.id,
      name: user.name,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const trimmedName = (name || "").trim();

    if (!trimmedName || !normalizedEmail || !password) {
      return res.status(400).json({
        message: "Full Name, Email, and Password are required."
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address."
      });
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: passwordValidation.errors[0]
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      provider: "local"
    });

    return res.status(201).json({
      message: "Account created successfully."
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    return res.status(500).json({
      message: "Unable to register user right now."
    });
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: "Email and Password are required."
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address."
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    // Prevent social-only (Google) accounts from using password login
    if (user.provider !== "local" || !user.password) {
      return res.status(401).json({
        message: `This account uses ${user.provider} login. Please sign in with ${user.provider}.`
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password."
      });
    }

    const token = signJwt(user);

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch {
    return res.status(500).json({
      message: "Unable to login right now."
    });
  }
}

/**
 * Called after Passport has successfully authenticated the user via Google.
 * Signs a JWT and redirects the browser to the frontend /oauth-callback route
 * with the token as a query param.
 */
function oauthCallback(req, res) {
  try {
    if (!req.user) {
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      return res.redirect(`${clientUrl}/login?error=oauth_failed`);
    }

    const token = signJwt(req.user);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    return res.redirect(
      `${clientUrl}/oauth-callback?token=${encodeURIComponent(token)}`
    );
  } catch {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    return res.redirect(`${clientUrl}/login?error=oauth_failed`);
  }
}

export { loginUser, oauthCallback, registerUser };
