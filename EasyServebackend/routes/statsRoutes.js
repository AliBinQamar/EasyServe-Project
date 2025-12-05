const express = require("express");
const { getStats } = require("../controllers/statsController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Only admins can access stats
router.get("/", protect, admin, getStats);

module.exports = router;