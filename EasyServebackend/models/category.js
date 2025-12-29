const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  icon: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Category", CategorySchema);