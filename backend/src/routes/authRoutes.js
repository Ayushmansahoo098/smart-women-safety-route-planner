import express from "express";
import { loginUser, registerUser } from "../controllers/authController.js";
import { requireDatabase } from "../middleware/databaseMiddleware.js";

const router = express.Router();

router.post("/register", requireDatabase, registerUser);
router.post("/login", requireDatabase, loginUser);

export default router;
