const Matrimonial = require("../Schema/Matrimonial");
const MatrimonialFees = require("../Schema/MatrimonialFees");

exports.addMatrimonial = async (req, res) => {
  try {
    const { 
      isMember,
      member_id,
      member_name,
      phone,
      nonMemberName,
      nonMemberPhone,
      nonMemberChurch,
      nonMemberAddress,
      description,
      fees
    } = req.body;

    if (isMember && !member_id) {
      return res.status(400).json({
        status: "Failed",
        message: "Member ID is required"
      });
    }

    if (!isMember && !nonMemberName) {
      return res.status(400).json({
        status: "Failed",
        message: "Non-member name is required"
      });
    }

    const activeFee = await MatrimonialFees.findOne({ isActive: true });

    const finalFees = fees || activeFee?.amount;

    if (!finalFees) {
      return res.status(400).json({
        status: "Failed",
        message: "No active matrimonial fees found"
      });
    }

    const newEntry = await Matrimonial.create({
      isMember,
      member_id,
      member_name,
      phone,
      nonMemberName,
      nonMemberPhone,
      nonMemberChurch,
      nonMemberAddress,
      description,
      fees: finalFees
    });

    return res.status(200).json({
      status: "Success",
      message: "Matrimonial entry added successfully",
      data: newEntry
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "Failed",
      message: "Server Error",
      error: error.message
    });
  }
};



// LIST API
exports.listMatrimonial = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", startDate, endDate } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { member_name: { $regex: search, $options: "i" } },
        { nonMemberName: { $regex: search, $options: "i" } }
      ];
    }

    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const total = await Matrimonial.countDocuments(query);

    const data = await Matrimonial.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return res.status(200).json({
      status: "Success",
      data,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    return res.status(500).json({
      status: "Failed",
      message: "Server Error"
    });
  }
};
