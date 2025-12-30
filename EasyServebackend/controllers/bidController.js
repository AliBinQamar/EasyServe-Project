const Bid = require("../models/Bid");
const Provider = require("../models/Provider");
// Provider submits a bid
exports.createBid = async (req, res) => {
  try {
    const { serviceRequestId, providerId, providerName, proposedAmount, note } = req.body;

    const bid = new Bid({
      serviceRequestId,
      providerId,
      providerName,
      proposedAmount,
      note,
      status: "pending",
    });

    const savedBid = await bid.save();
    res.status(201).json(savedBid);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create bid", error });
  }
};

// Get all bids by provider
exports.getBidsByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const bids = await Bid.find({ providerId }).sort({ createdAt: -1 });
    res.json(bids);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch bids", error });
  }
};

// Update bid status (accept/reject) - typically by admin or service requester
exports.updateBidStatus = async (req, res) => {
  try {
    const { bidId } = req.params;
    const { status } = req.body; // accepted / rejected

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const bid = await Bid.findByIdAndUpdate(
      bidId,
      { status },
      { new: true }
    );

    if (!bid) return res.status(404).json({ message: "Bid not found" });

    res.json(bid);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update bid", error });
  }
};
