const MarriagePrice = require("../Schema/MarriagePrice");

// Add Marriage Price
exports.addMarriagePrice = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        status: "Failed",
        message: "Amount is required",
      });
    }

    const newPrice = await MarriagePrice.create({ amount, isActive: true });

    return res.status(200).json({
      status: "Success",
      message: "Marriage price added successfully",
      data: newPrice,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get All Marriage Prices (history)
exports.getAllMarriagePrices = async (req, res) => {
  try {
    const prices = await MarriagePrice.find().sort({ createdAt: -1 });

    return res.status(200).json({
      status: "Success",
      message: "Marriage prices fetched successfully",
      data: prices,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get Latest Marriage Price
exports.getLatestMarriagePrice = async (req, res) => {
  try {
    const latest = await MarriagePrice.findOne().sort({ createdAt: -1 });

    return res.status(200).json({
      status: "Success",
      message: "Latest marriage price fetched successfully",
      data: latest,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.getActiveMarriagePrice = async (req, res) => {
  try {
    const activePrice = await MarriagePrice.findOne({ isActive: true })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "Success",
      message: "Active marriage price fetched",
      data: activePrice,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Server Error",
    });
  }
};

exports.toggleMarriagePrice = async (req, res) => {
  try {
    const { id } = req.params;

    const price = await MarriagePrice.findById(id);
    if (!price) {
      return res.status(404).json({
        status: "Failed",
        message: "Price not found",
      });
    }

    // If trying to deactivate last active → block
    if (price.isActive === true) {
      const activeCount = await MarriagePrice.countDocuments({ isActive: true });

      if (activeCount === 1) {
        return res.status(400).json({
          status: "Failed",
          message: "At least one active price must remain.",
        });
      }
    }

    // ❗ Do not allow reactivating inactive
    if (!price.isActive) {
      return res.status(400).json({
        status: "Failed",
        message: "Inactive prices cannot be activated again.",
      });
    }

    price.isActive = !price.isActive;
    await price.save();

    return res.status(200).json({
      status: "Success",
      message: "Price status updated",
      data: price,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Server Error",
    });
  }
};