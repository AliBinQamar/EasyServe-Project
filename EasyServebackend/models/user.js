// models/user.js - NO PRE-SAVE HOOK

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ["user", "provider"], default: "user" },
  createdAt: { type: Date, default: Date.now },
});

// Compare password method
userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.models.User || mongoose.model("user", userSchema);