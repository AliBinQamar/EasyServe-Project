// models/provider.js - NO PRE-SAVE HOOK

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Review schema
const ReviewSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const ProviderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String },
  categoryId: { type: String, required: true },
  categoryName: { type: String },
  price: { type: Number, required: true },
  area: { type: String, required: true },
  rating: { type: Number, default: 0 },
  description: { type: String, required: true },
  image: { type: String },
  reviews: { type: [ReviewSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

// Compare password method
ProviderSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.Provider || mongoose.model("Provider", ProviderSchema);