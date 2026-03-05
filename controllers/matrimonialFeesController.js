const MatrimonialFees = require("../Schema/MatrimonialFees");

// Add Fees
exports.addMatrimonialFees = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        status: "Failed",
        message: "Amount is required",
      });
    }

    const newFee = await MatrimonialFees.create({
      amount,
      isActive: true
    });

    return res.status(200).json({
      status: "Success",
      message: "Matrimonial fees added successfully",
      data: newFee
    });
  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Server Error",
    });
  }
};

// Fetch all
exports.getAllMatrimonialFees = async (req, res) => {
  try {
    const list = await MatrimonialFees.find().sort({ createdAt: -1 });
    return res.status(200).json({
      status: "Success",
      message: "Fees fetched successfully",
      data: list
    });
  } catch (e) {
    return res.status(500).json({ status: "Failed", message: "Server Error" });
  }
};

// Get active
exports.getActiveMatrimonialFees = async (req, res) => {
  try {
    const active = await MatrimonialFees.findOne({ isActive: true });
    return res.status(200).json({
      status: "Success",
      data: active
    });
  } catch (e) {
    return res.status(500).json({ status: "Failed", message: "Server Error" });
  }
};

// Toggle active/inactive
exports.toggleMatrimonialFees = async (req, res) => {
  try {
    const { id } = req.params;
    const fee = await MatrimonialFees.findById(id);

    if (!fee) {
      return res.status(404).json({ status: "Failed", message: "Not Found" });
    }

    const activeCount = await MatrimonialFees.countDocuments({ isActive: true });

    if (fee.isActive && activeCount === 1) {
      return res.status(400).json({
        status: "Failed",
        message: "At least one active fee must remain."
      });
    }

    fee.isActive = !fee.isActive;
    await fee.save();

    return res.status(200).json({
      status: "Success",
      message: "Fees updated"
    });

  } catch (e) {
    return res.status(500).json({ status: "Failed", message: "Server Error" });
  }
};
