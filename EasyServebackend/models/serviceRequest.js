const mongoose = require("mongoose");

const ServiceRequestSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  categoryId: { type: String, required: true },
  categoryName: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  
  // Bidding system fields
  requestType: {
    type: String,
    enum: ['fixed', 'bidding'],
    default: 'fixed'
  },
  fixedAmount: { type: Number },
  
  // Bidding specific
  biddingEndDate: { type: Date },
  minBidAmount: { type: Number },
  maxBidAmount: { type: Number },
  
  status: {
    type: String,
    enum: ['open', 'bidding', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },
  
  assignedProviderId: { type: String },
  assignedProviderName: { type: String },
  acceptedBidId: { type: mongoose.Schema.Types.ObjectId, ref: "Bid" },
  finalAmount: { type: Number },
  
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ServiceRequest", ServiceRequestSchema);