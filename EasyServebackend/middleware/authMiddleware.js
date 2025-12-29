// middleware/authMiddleware.ts - COMPLETE VERSION

const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Provider = require("../models/provider");

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({ message: "Not authorized to access this route ❌" });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch full user data to ensure role is correct
      let user;
      if (decoded.role === 'provider') {
        user = await Provider.findById(decoded.id);
      } else {
        user = await User.findById(decoded.id);
      }

      if (!user) {
        return res.status(401).json({ message: "User not found ❌" });
      }

      // Attach user to request
      req.user = {
        id: decoded.id,
        role: user.role || decoded.role, // Use DB role to prevent issues
      };

      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({ message: "Token is invalid ❌" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Authentication error ❌" });
  }
};

// Optional: Check if user is a provider
const protectProvider = async (req, res, next) => {
  try {
    await protect(req, res, () => {
      if (req.user.role !== 'provider') {
        return res.status(403).json({ message: "This route is for providers only ❌" });
      }
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Authorization error ❌" });
  }
};

// Optional: Check if user is a regular user
const protectUser = async (req, res, next) => {
  try {
    await protect(req, res, () => {
      if (req.user.role !== 'user') {
        return res.status(403).json({ message: "This route is for users only ❌" });
      }
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Authorization error ❌" });
  }
};

module.exports = { protect, protectProvider, protectUser };