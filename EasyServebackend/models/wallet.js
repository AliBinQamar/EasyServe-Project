const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  userType: { type: String, enum: ['user', 'provider'], required: true },
  
  balance: { type: Number, default: 0 },
  heldBalance: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  
  transactions: [
    {
      type: { type: String, enum: ['credit', 'debit'], required: true }, // ✅ Added type back
      amount: { type: Number, required: true },
      reference: { type: String },
      status: { type: String },
      createdAt: { type: Date, default: Date.now },
    }
  ],
  
  lastWithdrawal: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Wallet", WalletSchema);