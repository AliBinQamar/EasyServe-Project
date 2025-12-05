const express = require("express");
const { getCategories, addCategory, editCategory, deleteCategory } = require("../controllers/categoryController");

const router = express.Router();

router.get("/", getCategories);
router.post("/", addCategory);
router.put("/:id", editCategory);
router.delete("/:id", deleteCategory);

module.exports = router;
