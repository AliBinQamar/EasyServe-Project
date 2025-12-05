const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const ProviderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  categoryId: { type: String, required: true },
  categoryName: { type: String },
  price: { type: Number, required: true },
  area: { type: String, required: true },
  rating: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String },
  reviews: { type: [ReviewSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Provider", ProviderSchema);
