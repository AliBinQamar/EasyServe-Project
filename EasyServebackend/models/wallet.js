const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  userType: { type: String, enum: ['user', 'provider'], required: true },
  
  balance: { type: Number, default: 0 }, // Available balance
  heldBalance: { type: Number, default: 0 }, // Money in escrow
  totalEarned: { type: Number, default: 0 }, // Lifetime earnings (providers)
  totalSpent: { type: Number, default: 0 }, // Lifetime spending (users)
  
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    iban: String,
  },
  
  lastWithdrawal: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Wallet", WalletSchema);