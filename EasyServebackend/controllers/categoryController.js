const Category = require("../models/Category");

// GET all categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories ❌", error });
  }
};

// ADD a new category
const addCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.json({ message: "Category added ✅", category });
  } catch (error) {
    res.status(500).json({ message: "Error adding category ❌", error });
  }
};

// EDIT category
const editCategory = async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Category updated ✅", category: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating category ❌", error });
  }
};

// DELETE category
const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted ✅" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category ❌", error });
  }
};

module.exports = { getCategories, addCategory, editCategory, deleteCategory };
