import express from "express";
import { getDashboardData } from "../controllers/dashboardController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { requireDatabase } from "../middleware/databaseMiddleware.js";

const router = express.Router();

router.get("/dashboard", requireDatabase, authenticateToken, getDashboardData);

export default router;
