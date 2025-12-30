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
    transactions: [
    {
      type: { type: String, enum: ['credit','debit'], required: true },
      amount: { type: Number, required: true },
      reference: { type: String }, // bookingId or withdrawalId
      status: { type: String }, // e.g., 'released', 'held', 'withdrawn'
      createdAt: { type: Date, default: Date.now },
    }
  ],
  
  lastWithdrawal: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Wallet", WalletSchema);