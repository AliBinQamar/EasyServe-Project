const express = require("express");
const {
  initiatePayment,
  markServiceCompleted,
  confirmAndRelease,
  getTransactionHistory,
  getWallet,
  withdrawMoney,
  raiseDispute,
  addBankDetails
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

// ✅ CONSISTENT /payments/ PREFIX
router.post("/initiate", initiatePayment);
router.post("/mark-completed", markServiceCompleted);
router.post("/confirm-release", confirmAndRelease);
router.get("/transactions", getTransactionHistory);
router.get("/wallet", getWallet);
router.post("/withdraw", withdrawMoney);
router.post("/dispute", raiseDispute);
router.post("/bank-details", addBankDetails);
module.exports = router;