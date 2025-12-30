const ServiceRequest = require("../models/ServiceRequest");
const Booking = require("../models/booking"); // ← ADD THIS
const Provider = require("../models/Provider");

// ==========================
// PROVIDER ACCEPTS FIXED PRICE REQUEST
// ==========================
const acceptFixedRequest = async (req, res) => {
  try {
    const { requestId, providerId, providerName } = req.body;

    if (!requestId || !providerId || !providerName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const request = await ServiceRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Service request not found" });
    if (request.requestType !== "fixed")
      return res.status(400).json({ message: "Not a fixed price request" });
    if (request.status === "assigned")
      return res.status(400).json({ message: "Request already assigned" });

    // Fetch provider details
    const provider = await Provider.findById(providerId);
    if (!provider) return res.status(404).json({ message: "Provider not found" });

    // Check if booking already exists
    const existingBooking = await Booking.findOne({
      requestId: request._id,
      providerId,
    });
    if (existingBooking) {
      return res.status(400).json({
        message: "Booking already exists",
        booking: existingBooking,
      });
    }

    // Update request
    request.assignedProviderId = providerId;
    request.assignedProviderName = providerName;
    request.status = "assigned";
    request.finalAmount = request.fixedAmount;
    await request.save();

    // Create booking
    const booking = new Booking({
      requestId: request._id,
      userId: request.userId,
      userName: request.userName,
      providerId,
      providerName,
      // providerPhone: provider.phone || null,
      // providerEmail: provider.email || null,
      agreedPrice: request.fixedAmount,
      status: "confirmed",
    });
    await booking.save();

    res.json({
      message: "Fixed price request accepted and booking created successfully",
      request,
      booking,
    });
  } catch (error) {
    console.error("Accept Fixed Request Error:", error);
    res.status(500).json({
      message: "Error accepting fixed price request",
      error: error.message,
    });
  }
};

module.exports = {
  acceptFixedRequest,
};