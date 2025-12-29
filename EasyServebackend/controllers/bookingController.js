const Booking = require("../models/booking");

// GET bookings (user or provider)
const getBookings = async (req, res) => {
  try {
    const { userId, providerId, status } = req.query;
    const filter = {};

    if (userId) filter.userId = userId;
    if (providerId) filter.providerId = providerId;
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .populate('requestId')
      .populate('bidId');

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings ❌", error: error.message });
  }
};

// CREATE booking (after bid is accepted)
const createBooking = async (req, res) => {
  try {
    const {
      requestId,
      bidId,
      userId,
      userName,
      providerId,
      providerName,
      agreedPrice,
    } = req.body;

    // Check if booking already exists for this bid
    const existingBooking = await Booking.findOne({ bidId });
    if (existingBooking) {
      return res.status(400).json({ message: "Booking already exists for this bid ❌" });
    }

    const booking = new Booking({
      requestId,
      bidId,
      userId,
      userName,
      providerId,
      providerName,
      agreedPrice,
      status: 'confirmed',
    });

    await booking.save();

    res.json({ 
      message: "Booking created successfully ✅", 
      booking 
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({ message: "Error creating booking ❌", error: error.message });
  }
};

// UPDATE booking status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['confirmed', 'in-progress', 'completed', 'cancelled', 'disputed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status ❌" });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found ❌" });
    }

    res.json({ 
      message: "Booking status updated ✅", 
      booking 
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating booking ❌", error: error.message });
  }
};
// GET single booking by ID
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate('requestId')
      .populate('bidId');

    if (!booking) {
      return res.status(404).json({ message: "Booking not found ❌" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({ 
      message: "Error fetching booking ❌", 
      error: error.message 
    });
  }
};
// GET messages for a booking
const getBookingMessages = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found ❌" });
    }

    // Return messages array (or empty array if none)
    const messages = booking.messages || [];
    res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ 
      message: "Error fetching messages ❌", 
      error: error.message 
    });
  }
};

// POST message to a booking
const sendBookingMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message cannot be empty ❌" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found ❌" });
    }

    // Verify user is part of this booking
    if (booking.userId !== userId && booking.providerId !== userId) {
      return res.status(403).json({ message: "Unauthorized ❌" });
    }

    // Initialize messages array if it doesn't exist
    if (!booking.messages) {
      booking.messages = [];
    }

    // Add new message
    const newMessage = {
      senderRole: userRole,
      senderId: userId,
      text: message.trim(),
      createdAt: new Date(),
    };

    booking.messages.push(newMessage);
    await booking.save();

    res.json({ 
      message: "Message sent ✅", 
      messages: booking.messages 
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ 
      message: "Error sending message ❌", 
      error: error.message 
    });
  }
};


module.exports = {
  getBookings,
  createBooking,
  updateBookingStatus,
  getBookingById,
    getBookingMessages,  // ← Export
  sendBookingMessage,
};