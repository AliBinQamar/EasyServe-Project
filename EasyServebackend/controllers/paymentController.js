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
const releasePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found ❌' });

    const providerWallet = await Wallet.findOne({ userId: booking.providerId });
    if (!providerWallet) return res.status(404).json({ message: 'Provider wallet not found ❌' });
    booking.status = 'payment-released';
    await booking.save();
    // Update wallet
    providerWallet.balance += booking.agreedPrice;
    providerWallet.totalEarned += booking.agreedPrice;

    // Add transaction record
    providerWallet.transactions = providerWallet.transactions || [];
    providerWallet.transactions.push({
      type: 'credit',
      amount: booking.agreedPrice,
      reference: bookingId,
      status: 'completed',
      createdAt: new Date(),
    });

    await providerWallet.save();

    res.json({ message: 'Payment released ✅', wallet: providerWallet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error ❌', error: err.message });
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
// Provider withdraws money (SIMPLIFIED - No bank details required)
const withdrawMoney = async (req, res) => {
  try {
    const { amount } = req.body;
    const providerId = req.user.id;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount ❌" });
    }

    const wallet = await Wallet.findOne({ userId: providerId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found ❌" });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance ❌" });
    }

    // ✅ Deduct amount from balance
    wallet.balance -= amount;
    wallet.lastWithdrawal = new Date();

    // ✅ Add withdrawal transaction
    wallet.transactions = wallet.transactions || [];
    wallet.transactions.push({
      type: 'debit',
      amount: amount,
      reference: 'Withdrawal',
      status: 'withdrawn',
      createdAt: new Date(),
    });

    await wallet.save();

    res.json({
      message: "Withdrawal successful ✅",
      amount,
      newBalance: wallet.balance,
      wallet
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ message: "Withdrawal failed ❌", error: error.message });
  }
};

module.exports = {
  initiatePayment,
  markServiceCompleted,
  releasePayment,
  getTransactionHistory,
  getWallet,
  withdrawMoney,
};