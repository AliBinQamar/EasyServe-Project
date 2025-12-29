const ServiceRequest = require("../models/ServiceRequest");
const Booking = require("../models/booking"); // ← ADD THIS

// PROVIDER accepts a fixed price request
const acceptFixedRequest = async (req, res) => {
  try {
    const { requestId, providerId, providerName } = req.body;

    if (!requestId || !providerId || !providerName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const request = await ServiceRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Service request not found" });
    }

    if (request.requestType !== "fixed") {
      return res.status(400).json({ message: "Not a fixed price request" });
    }

    if (request.status === "assigned") {
      return res.status(400).json({ message: "Request already assigned" });
    }

    // Check if booking already exists
    const existingBooking = await Booking.findOne({ 
      requestId: request._id,
      providerId: providerId 
    });
    if (existingBooking) {
      return res.status(400).json({ 
        message: "Booking already exists",
        booking: existingBooking 
      });
    }

    // Update request with assigned provider
    request.assignedProviderId = providerId;
    request.assignedProviderName = providerName;
    request.status = "assigned";
    request.finalAmount = request.fixedAmount;
    await request.save();

    // ✅ CREATE BOOKING (no bidId for fixed price)
    const booking = new Booking({
      requestId: request._id,
      // bidId not included - it's optional now
      userId: request.userId,
      userName: request.userName,
      providerId: providerId,
      providerName: providerName,
           providerPhone: provider?.phone || null,      // ← ADD
      providerEmail: provider?.email || null,
      agreedPrice: request.fixedAmount,
      status: 'confirmed',
    });
    await booking.save();

    console.log("✅ Booking created for fixed request:", booking._id);

    res.json({
      message: "Fixed price request accepted and booking created successfully",
      request,
      booking
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