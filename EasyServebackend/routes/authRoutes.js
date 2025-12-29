// routes/authRoutes.ts - COMPLETE FIXED VERSION

const express = require("express");
const { 
  signupUser, 
  loginUser, 
  providerSignup, 
  providerLogin, 
  getMe,
  updateProfile,
  logout 
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* ==================== USER ROUTES ==================== */
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);

/* ==================== PROVIDER ROUTES ==================== */
router.post("/provider/signup", providerSignup);
router.post("/provider/login", providerLogin);
router.post("/provider/logout", protect, logout);
router.put("/profile", protect, updateProfile);
module.exports = router;