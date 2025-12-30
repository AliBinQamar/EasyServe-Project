const mongoose = require("mongoose");

const BidSchema = new mongoose.Schema({
  serviceRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true,
  },
  providerId: { type: String, required: true },
  providerName: { type: String, required: true },
  providerPhone:{type:String,required:false},
providerEmail:{type:String,required:false},
  proposedAmount: { type: Number, required: true },
  note: { type: String },
  estimatedTime: { type: String },
  
  // NEW: Image attachments support
  attachments: [{
    uri: String,
    type: { type: String, enum: ['image', 'video'] },
    name: String,
    size: Number,
  }],
  
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Bid || mongoose.model("Bid", BidSchema);