const Transaction = require("../models/transaction");
const Booking = require("../models/booking");
const Wallet = require("../models/wallet");

// STEP 1: User initiates payment for booking
const initiatePayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;
    const userId = req.user.id; // From JWT middleware

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found ❌" });
    }

    if (booking.isPaid) {
      return res.status(400).json({ message: "Booking already paid ❌" });
    }

    const amount = booking.agreedPrice;
    const platformFee = amount * 0.10; // 10% commission
    const providerAmount = amount - platformFee;

    // Create transaction record
    const transaction = new Transaction({
      bookingId: booking._id,
      userId: booking.userId,
      providerId: booking.providerId,
      amount,
      platformFee,
      providerAmount,
      status: 'pending',
      paymentMethod,
    });

    await transaction.save();

    // TODO: Integrate with actual payment gateway (Stripe/JazzCash/Easypaisa)
    // For now, simulate payment success
    transaction.status = 'held';
    transaction.paidAt = new Date();
    transaction.heldAt = new Date();
    await transaction.save();

    // Update booking
    booking.isPaid = true;
    booking.transactionId = transaction._id;
    await booking.save();

    // Update provider's wallet (held balance)
    let providerWallet = await Wallet.findOne({ userId: booking.providerId });
    if (!providerWallet) {
      providerWallet = new Wallet({
        userId: booking.providerId,
        userType: 'provider',
      });
    }
    providerWallet.heldBalance += providerAmount;
    await providerWallet.save();

    res.json({
      message: "Payment successful ✅",
      transaction,
      booking,
    });
  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ message: "Payment failed ❌", error: error.message });
  }
};

// STEP 2: Provider marks service as completed
const markServiceCompleted = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const providerId = req.user.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found ❌" });
    }

    if (booking.providerId !== providerId) {
      return res.status(403).json({ message: "Unauthorized ❌" });
    }

    booking.completedByProvider = true;
    booking.status = 'completed';
    await booking.save();

    res.json({ message: "Service marked as completed ✅", booking });
  } catch (error) {
    res.status(500).json({ message: "Error ❌", error: error.message });
  }
};

// STEP 3: User confirms service completion and releases payment
const confirmAndRelease = async (req, res) => {
  try {
    const { bookingId, rating, review } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found ❌" });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized ❌" });
    }

    if (!booking.completedByProvider) {
      return res.status(400).json({ message: "Provider hasn't completed service yet ❌" });
    }

    // Update booking
    booking.completedByUser = true;
    booking.completedAt = new Date();
    booking.userRating = rating;
    booking.userReview = review;
    await booking.save();

    // Release payment
    const transaction = await Transaction.findById(booking.transactionId);
    if (transaction) {
      transaction.status = 'completed';
      transaction.releasedAt = new Date();
      await transaction.save();

      // Move money from held to available in provider's wallet
      const providerWallet = await Wallet.findOne({ userId: booking.providerId });
      if (providerWallet) {
        providerWallet.heldBalance -= transaction.providerAmount;
        providerWallet.balance += transaction.providerAmount;
        providerWallet.totalEarned += transaction.providerAmount;
        providerWallet.updatedAt = new Date();
        await providerWallet.save();
      }

      // Update user's wallet
      let userWallet = await Wallet.findOne({ userId: booking.userId });
      if (!userWallet) {
        userWallet = new Wallet({
          userId: booking.userId,
          userType: 'user',
        });
      }
      userWallet.totalSpent += transaction.amount;
      await userWallet.save();
    }

    res.json({
      message: "Payment released to provider ✅",
      booking,
      transaction,
    });
  } catch (error) {
    console.error("Release Error:", error);
    res.status(500).json({ message: "Error releasing payment ❌", error: error.message });
  }
};

// Get user's transaction history
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const transactions = await Transaction.find({
      $or: [{ userId }, { providerId: userId }]
    })
    .sort({ createdAt: -1 })
    .populate('bookingId');

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions ❌", error: error.message });
  }
};

// Get wallet details
const getWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({
        userId,
        userType: req.user.role === 'provider' ? 'provider' : 'user',

      });
      await wallet.save();
    }

    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: "Error fetching wallet ❌", error: error.message });
  }
};

// Provider withdraws money
const withdrawMoney = async (req, res) => {
  try {
    const { amount } = req.body;
    const providerId = req.user.id;

    const wallet = await Wallet.findOne({ userId: providerId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found ❌" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance ❌" });
    }

    if (!wallet.bankDetails || !wallet.bankDetails.accountNumber) {
      return res.status(400).json({ message: "Please add bank details first ❌" });
    }

    // TODO: Integrate with actual bank transfer API
    // For now, simulate withdrawal
    wallet.balance -= amount;
    wallet.lastWithdrawal = new Date();
    await wallet.save();

    res.json({
      message: "Withdrawal successful ✅",
      amount,
      newBalance: wallet.balance,
    });
  } catch (error) {
    res.status(500).json({ message: "Withdrawal failed ❌", error: error.message });
  }
};

// Raise dispute
const raiseDispute = async (req, res) => {
  try {
    const { bookingId, reason } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found ❌" });
    }

    booking.status = 'disputed';
    await booking.save();

    const transaction = await Transaction.findById(booking.transactionId);
    if (transaction) {
      transaction.status = 'disputed';
      transaction.disputeReason = reason;
      await transaction.save();
    }

    res.json({ message: "Dispute raised. Admin will review ✅", booking });
  } catch (error) {
    res.status(500).json({ message: "Error raising dispute ❌", error: error.message });
  }
};
const addBankDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { accountName, accountNumber, bankName, iban } = req.body;

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({
        userId,
        userType: req.user.role,
      });
    }

    wallet.bankDetails = {
      accountName,
      accountNumber,
      bankName,
      iban,
    };

    wallet.updatedAt = new Date();
    await wallet.save();

    res.json({ message: "Bank details saved ✅", wallet });
  } catch (error) {
    res.status(500).json({ message: "Failed to save bank details ❌" });
  }
};

module.exports = {
  initiatePayment,
  markServiceCompleted,
  confirmAndRelease,
  getTransactionHistory,
  getWallet,
  withdrawMoney,
  raiseDispute,
  addBankDetails,
};