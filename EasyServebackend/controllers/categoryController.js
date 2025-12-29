const Category = require("../models/category");

// GET all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }); // Sort alphabetically
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories ❌", error: error.message });
  }
};

module.exports = { getCategories };
