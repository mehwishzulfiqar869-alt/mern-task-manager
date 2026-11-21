
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
   
    const validToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(validToken.id).select("_id role");

    if (!user) {
      return res.status(401).json({
        message: "User not found. Please login again.",
      });
    }
    req.user = {
      ...validToken,
      id: user._id.toString(),
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Invalid or expired token.",
      });
    }

    console.error("Authentication error:", error);

    return res.status(500).json({
      message: "Authentication failed.",
    });
  }
};

export default authMiddleware;
