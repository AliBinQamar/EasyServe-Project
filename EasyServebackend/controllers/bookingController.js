const Booking = require("../models/Booking");

// GET bookings
const getBookings = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const bookings = await Booking.find(filter);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings ❌", error });
  }
};

// CREATE booking
const createBooking = async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.json({ message: "Booking created ✅", booking });
  } catch (error) {
    res.status(500).json({ message: "Error creating booking ❌", error });
  }
};

// UPDATE booking status
const updateBookingStatus = async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json({ message: "Booking status updated ✅", booking: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating booking ❌", error });
  }
};

module.exports = { getBookings, createBooking, updateBookingStatus };
