const Provider = require("../models/Provider");

// GET providers with optional filters
const getProviders = async (req, res) => {
  try {
    const { categoryId, area, price } = req.query;

    const filter = {};
    if (categoryId) filter.categoryId = categoryId;
    if (area) filter.area = area;
    if (price) filter.price = { $lte: Number(price) };

    const providers = await Provider.find(filter);
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching providers ❌", error });
  }
};

// GET single provider by ID
// GET single provider by ID
const getProviderById = async (req, res) => {
  try {
    const providerId = req.params.id;

    // 🌟 STEP 1: Implement an early check for missing or invalid ID 🌟
    // Note: Mongoose.isValidObjectId is a great way to check the format
    // If you're not using Mongoose.isValidObjectId, a simple truthy check is essential.
    if (!providerId || providerId === 'undefined' /* Add format check here if possible */) {
      // Return 400 Bad Request if the parameter is clearly invalid/missing
      return res.status(400).json({ message: "Invalid or missing Provider ID in request ⚠️" });
    }

    // 🌟 STEP 2: Execute the query only with a valid ID 🌟
    const provider = await Provider.findById(providerId); 

    if (!provider) {
      // Return 404 Not Found if the ID is valid but no provider exists
      return res.status(404).json({ message: "Provider not found ❌" });
    }
    res.json(provider);

  } catch (error) {
    // This catch block should now only handle genuine server/database issues
    res.status(500).json({ message: "Error fetching provider ❌", error: error.message });
  }
};

// ADD a provider
const addProvider = async (req, res) => {
  try {
    const provider = new Provider(req.body);
    await provider.save();
    res.json({ message: "Provider added ✅", provider });
  } catch (error) {
    res.status(500).json({ message: "Error adding provider ❌", error });
  }
};

// EDIT provider
const editProvider = async (req, res) => {
  try {
    const updated = await Provider.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Provider updated ✅", provider: updated });
  } catch (error) {
    res.status(500).json({ message: "Error updating provider ❌", error });
  }
};

// DELETE provider
const deleteProvider = async (req, res) => {
  try {
    await Provider.findByIdAndDelete(req.params.id);
    res.json({ message: "Provider removed ✅" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting provider ❌", error });
  }
};

module.exports = { getProviders, getProviderById, addProvider, editProvider, deleteProvider };