// controllers/authController.js - HASH PASSWORD BEFORE SAVING

const User = require("../models/user");
const Provider = require("../models/provider");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

/* ==================== USER AUTH ==================== */
// ✅ USER SIGNUP
const signupUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required ❌" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters ❌" });
    }

    // Check if user exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "User already exists ❌" });

    // Hash password BEFORE saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with hashed password
    const user = new User({ 
      name, 
      email: email.toLowerCase(), 
      password: hashedPassword,
      phone, 
      role: "user" 
    });
    
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: "Signup successful ✅",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server signup error ❌", error: error.message });
  }
};

// ✅ USER LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "All fields required ❌" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found ❌" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Wrong password ❌" });

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "Login successful ✅",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server login error ❌", error: error.message });
  }
};

/* ==================== PROVIDER AUTH ==================== */
// ✅ PROVIDER SIGNUP
const providerSignup = async (req, res) => {
  try {
    const { name, email, password, phone, categoryId, categoryName, price, area, description } = req.body;

    // Validate required fields
    if (!name || !email || !password || !categoryId || !categoryName || !price || !area || !description) {
      return res.status(400).json({ message: "All fields required ❌" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters ❌" });
    }

    // Check if provider already exists
    const existing = await Provider.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Provider already exists ❌" });
    }

    // Hash password BEFORE saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new provider with hashed password
    const provider = new Provider({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      categoryId,
      categoryName,
      price,
      area,
      description,
    });

    // Save provider (no pre-save hook, password already hashed)
    await provider.save();

    const token = generateToken(provider._id, "provider");

    res.status(201).json({
      message: "Provider signup successful ✅",
      token,
      user: {
        id: provider._id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        categoryId: provider.categoryId,
        categoryName: provider.categoryName,
        price: provider.price,
        area: provider.area,
        description: provider.description,
        role: "provider",
      },
    });
  } catch (error) {
    console.error("Provider Signup Error:", error);
    res.status(500).json({ message: "Server provider signup error ❌", error: error.message });
  }
};

// ✅ PROVIDER LOGIN
const providerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required ❌" });
    }

    const provider = await Provider.findOne({ email: email.toLowerCase() });
    if (!provider) return res.status(404).json({ message: "Provider not found ❌" });

    const isMatch = await provider.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Wrong password ❌" });

    const token = generateToken(provider._id, "provider");

    res.status(200).json({
      message: "Provider login successful ✅",
      token,
      user: {
        id: provider._id,
        name: provider.name,
        email: provider.email,
        phone: provider.phone,
        categoryId: provider.categoryId,
        categoryName: provider.categoryName,
        price: provider.price,
        area: provider.area,
        description: provider.description,
        role: "provider",
      },
    });
  } catch (error) {
    console.error("Provider Login Error:", error);
    res.status(500).json({ message: "Server provider login error ❌", error: error.message });
  }
};

/* ==================== GET CURRENT USER/PROVIDER ==================== */
const getMe = async (req, res) => {
  try {
    if (req.user.role === "provider") {
      const provider = await Provider.findById(req.user.id).select("-password");
      return res.json(provider);
    }

    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({ message: "Error fetching profile ❌", error });
  }
};

/* ==================== LOGOUT ==================== */
const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log(`✅ User ${userId} (${userRole}) logged out`);

    res.json({
      message: "Logout successful ✅",
      data: {
        userId,
        userRole,
        loggedOutAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Logout failed ❌", error: error.message });
  }
};
const updateProfile = async (req, res) => {
  try {
    const { name, phone, area, price, description } = req.body;

    if (req.user.role === "provider") {
      const provider = await Provider.findByIdAndUpdate(
        req.user.id,
        { name, phone, area, price, description },
        { new: true }
      ).select("-password");

      return res.json(provider);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Profile update failed ❌" });
  }
};

module.exports = {
  signupUser,
  loginUser,
  providerSignup,
  providerLogin,
  getMe,
  updateProfile,
  logout,
};