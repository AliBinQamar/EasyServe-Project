const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const providerRoutes = require("./routes/providerRoutes");
const serviceRequestRoutes = require("./routes/serviceRequestRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const bidRoutes = require("./routes/bidRoutes");
const fixedRequestRoutes = require("./routes/fixedRequestRoutes");
dotenv.config();
connectDB();


const app = express();

// Middleware
app.use(express.json()); // parse JSON bodies

// Routes
// Ensure correct route mounting
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);  // ✅ MUST BE /api/payments/
app.use("/api/providers", providerRoutes);
app.use("/api/service-requests", serviceRequestRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/service-requests", fixedRequestRoutes);
// Default route
app.get("/", (req, res) => {
  res.send("✅ EasyServe Backend Running");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found ❌" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error ❌", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
