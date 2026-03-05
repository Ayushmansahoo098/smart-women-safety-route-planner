import cors from "cors";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";

const app = express();

const configuredOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (e.g. curl, Postman)
      if (!origin) return callback(null, true);

      // Always allow any localhost / 127.0.0.1 origin in development
      const isLocalhost =
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (isLocalhost) return callback(null, true);

      // Allow explicitly configured origins
      if (configuredOrigins.includes(origin)) return callback(null, true);

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true
  })
);

app.use(express.json());

app.get("/api/health", (_, res) => {
  res.status(200).json({ message: "API is healthy." });
});

app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);

app.use((_, res) => {
  res.status(404).json({ message: "Endpoint not found." });
});

app.use((error, _, res, __) => {
  console.error(error);
  res.status(500).json({ message: "Internal server error." });
});

export default app;
