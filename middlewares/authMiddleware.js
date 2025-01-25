const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect route (ensure the user is logged in)
exports.protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied, no token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Only allow admins
exports.admin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied, admin only" });
  }
  next();
};

// Only allow users (protect specific user routes)
exports.user = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access denied, user only" });
  }
  next();
};

exports.verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required" });
    }

    req.user = user; // Attach user to the request object
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
