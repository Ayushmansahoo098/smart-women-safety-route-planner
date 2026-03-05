import jwt from "jsonwebtoken";

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authorization token is missing."
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.sub,
      name: decoded.name,
      email: decoded.email
    };
    return next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token."
    });
  }
}

export { authenticateToken };
