const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  id: { type: String },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  providerId: { type: String, required: true },
  providerName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  note: { type: String },
  status: { type: String, enum: ["pending", "confirmed", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Booking", BookingSchema);
