const express = require("express");
const router = express.Router();
const fixedRequestController = require("../controllers/fixedRequestController");

// Provider accepts a fixed price request
router.post("/accept-fixed", fixedRequestController.acceptFixedRequest);

module.exports = router;
