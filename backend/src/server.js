import dotenv from "dotenv";
import app from "./app.js";
import { connectDatabase, isDatabaseConnected } from "./config/db.js";

dotenv.config();

const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
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

      if (!isDatabaseConnected()) {
        console.log(
          "Server started without MongoDB connection. Auth endpoints will return 503."
        );
      }
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

bootstrap();