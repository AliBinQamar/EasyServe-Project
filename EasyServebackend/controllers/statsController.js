const User = require("../models/User");
const Provider = require("../models/Provider");
const Booking = require("../models/Booking");
const Category = require("../models/Category");

// GET admin dashboard stats
const getStats = async (req, res) => {
  try {
    const users = await User.countDocuments({ role: "user" });
    const providers = await Provider.countDocuments();
    const bookings = await Booking.countDocuments();
    const categories = await Category.countDocuments();

    res.json({
      users,
      providers,
      bookings,
      categories,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats ❌", error });
  }
};

module.exports = { getStats };