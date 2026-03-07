import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";

dotenv.config();

const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];

const OAUTH_ENV = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"];
const missingOAuth = OAUTH_ENV.filter((key) => !process.env[key]);
if (missingOAuth.length > 0) {
  console.warn(
    `⚠️  Google OAuth env vars not set (${missingOAuth.join(", ")}). Google login will be disabled.`
  );
}
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

bootstrap();