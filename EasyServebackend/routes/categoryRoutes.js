const express = require("express");
const { getCategories } = require("../controllers/categoryController");

const router = express.Router();

// Only GET route, no create/update/delete
router.get("/", getCategories);

module.exports = router;
