const express = require("express");
const {
  getServiceRequests,
  createServiceRequest,
  getBidsByRequest,
  placeBid,
  acceptBid,
  getProviderBids,
  getServiceRequestById
} = require("../controllers/serviceRequestController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

// Bidding (STATIC first)
router.post("/bid", placeBid);
router.post("/accept-bid", acceptBid);

// Provider bids (STATIC)
router.get("/provider-bids/:providerId", getProviderBids);

// Service Requests
router.get("/", getServiceRequests);
router.post("/", createServiceRequest);

// Dynamic routes LAST
router.get("/:serviceRequestId/bids", getBidsByRequest);
router.get("/:id", getServiceRequestById);

module.exports = router;