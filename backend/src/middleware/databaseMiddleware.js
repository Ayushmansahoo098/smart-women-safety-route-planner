import { isDatabaseConnected } from "../config/db.js";

function requireDatabase(req, res, next) {
  if (!isDatabaseConnected()) {
    return res.status(503).json({
      message: "Database is unavailable. Start MongoDB and try again."
    });
  }

  return next();
}

export { requireDatabase };
