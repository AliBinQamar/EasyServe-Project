const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(uri);
    console.log(`✅ Mongo Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
