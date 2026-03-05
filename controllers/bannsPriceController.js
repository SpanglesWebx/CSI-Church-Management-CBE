const BannsPrice = require("../Schema/BannsPrice");

// Add Banns Price
exports.addBannsPrice = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        status: "Failed",
        message: "Amount is required",
      });
    }

    const newPrice = await BannsPrice.create({ amount, isActive: true });

    return res.status(200).json({
      status: "Success",
      message: "Banns price added successfully",
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

// Get All Banns Prices (history)
exports.getAllBannsPrices = async (req, res) => {
  try {
    const prices = await BannsPrice.find().sort({ createdAt: -1 });

    return res.status(200).json({
      status: "Success",
      message: "Banns prices fetched successfully",
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

// Get Latest Banns Price
exports.getLatestBannsPrice = async (req, res) => {
  try {
    const latest = await BannsPrice.findOne().sort({ createdAt: -1 });

    return res.status(200).json({
      status: "Success",
      message: "Latest banns price fetched successfully",
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

exports.getActiveBannsPrice = async (req, res) => {
  try {
    const activePrice = await BannsPrice.findOne({ isActive: true })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: "Success",
      message: "Active banns price fetched",
      data: activePrice,
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Server Error",
    });
  }
};

exports.toggleBannsPrice = async (req, res) => {
  try {
    const { id } = req.params;

    const price = await BannsPrice.findById(id);
    if (!price) {
      return res.status(404).json({
        status: "Failed",
        message: "Price not found",
      });
    }

    if (price.isActive === true) {
      // Check if more than one active price exists
      const activeCount = await BannsPrice.countDocuments({ isActive: true });

      if (activeCount === 1) {
        return res.status(400).json({
          status: "Failed",
          message: "At least one active price must remain.",
        });
      }
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
