const express = require("express");
const {
  initiatePayment,
  markServiceCompleted,
  releasePayment,
  getTransactionHistory,
  getWallet,
  withdrawMoney,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

// ✅ CONSISTENT /payments/ PREFIX
router.post("/initiate", initiatePayment);
router.post("/mark-completed", markServiceCompleted);
router.post("/:bookingId/confirm-release", releasePayment);

router.get("/transactions", getTransactionHistory);
router.get("/wallet", getWallet);
router.post("/withdraw", withdrawMoney);
// router.post("/dispute", raiseDispute);
// router.post("/bank-details", addBankDetails);
module.exports = router;