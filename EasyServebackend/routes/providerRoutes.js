const express = require("express");
const { getProviders, getProviderById, addProvider, editProvider, deleteProvider } = require("../controllers/providerController");

const router = express.Router();

router.get("/", getProviders);
router.get("/:id", getProviderById); // Add this route
router.post("/", addProvider);
router.put("/:id", editProvider);
router.delete("/:id", deleteProvider);

module.exports = router;