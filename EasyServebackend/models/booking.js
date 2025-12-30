const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceRequest", required: true },
   bidId: { type: mongoose.Schema.Types.ObjectId, ref: "Bid" },

  userId: { type: String, required: true },
  userName: { type: String, required: true },

  providerId: { type: String, required: true },
  providerName: { type: String, required: true },

  agreedPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["confirmed", "in-progress", "completed", "payment-released", "disputed"],
    default: "confirmed",
  },

  isPaid: { type: Boolean, default: false },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },

  completedByProvider: { type: Boolean, default: false },
  completedByUser: { type: Boolean, default: false },
  completedAt: { type: Date },

  userRating: { type: Number, min: 1, max: 5 },
  providerRating: { type: Number, min: 1, max: 5 },
  userReview: { type: String },

messages: [{
    senderRole: { type: String, enum: ['user', 'provider'], required: true },
    senderId: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);