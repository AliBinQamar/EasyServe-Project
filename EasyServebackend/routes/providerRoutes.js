const express = require("express");
const { getProviders, getProviderById } = require("../controllers/providerController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getProviders);          // List all providers with optional filters
router.get("/:id", getProviderById);   // Get provider details by ID

module.exports = router;
