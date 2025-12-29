const express = require("express");
const router = express.Router();
const bidController = require("../controllers/bidController");

// Provider submits a bid
router.post("/", bidController.createBid);

// Get all bids by provider
router.get("/provider/:providerId", bidController.getBidsByProvider);

// Update bid status
router.patch("/:bidId/status", bidController.updateBidStatus);

module.exports = router;
