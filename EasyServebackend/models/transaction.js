const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  userId: { type: String, required: true },
  providerId: { type: String, required: true },

  amount: { type: Number, required: true },
  platformFee: { type: Number, required: true },
  providerAmount: { type: Number, required: true },

  status: {
    type: String,
    enum: ['pending', 'held', 'completed', 'refunded', 'disputed'],
    default: 'pending'
  },

  paymentMethod: {
    type: String,
    enum: ['card', 'jazzcash', 'easypaisa', 'cash on service'],
    required: true
  },

  paymentGatewayId: String,

  paidAt: Date,
  heldAt: Date,
  releasedAt: Date,
  refundedAt: Date,

  disputeReason: String,
  disputeResolvedAt: Date,

  createdAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
