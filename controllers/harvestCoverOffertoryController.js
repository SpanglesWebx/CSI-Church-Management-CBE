const Offertory = require("../Schema/HarvestCoverOffertory");

// ➤ ADD Harvest Cover Offertory
exports.addOffertory = async (req, res) => {
  try {
    const { member_id, member_name, phone, amount, date, description } = req.body;

    if (!member_id || !member_name || !amount || !date) {
      return res.status(400).json({ status: "Failed", message: "Missing required fields" });
    }

    const createData = await Offertory.create({
      member_id,
      member_name,
      phone,
      amount,
      date,
      description
    });

    res.json({ status: "Success", message: "Harvest Cover Offertory added", data: createData });
  } catch (err) {
    console.error("❌ Error adding harvest cover offertory:", err);
    res.status(500).json({ status: "Failed", message: "Server error" });
  }
};

// ➤ LIST with Search + Date Filter + Pagination
exports.listOffertory = async (req, res) => {
  try {
    const { page = 1, search = "", startDate = "", endDate = "" } = req.query;
    const limit = 25;
    const skip = (page - 1) * limit;

    let filter = {};

    // 🔍 Search by member_name (case-insensitive)
    if (search) {
      filter.member_name = { $regex: search, $options: "i" };
    }

    // 📅 Date Filter
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const total = await Offertory.countDocuments(filter);

    const records = await Offertory.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      status: "Success",
      totalPages: Math.ceil(total / limit),
      offertory: records,
    });
  } catch (err) {
    console.error("❌ Error fetching harvest offertory list:", err);
    res.status(500).json({ status: "Failed", message: "Server error" });
  }
};

// ➤ Single record view
exports.getOffertoryById = async (req, res) => {
  try {
    const record = await Offertory.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ status: "Failed", message: "Record not found" });
    }

    res.json({ status: "Success", data: record });
  } catch (err) {
    console.error("❌ Error fetching harvest offertory:", err);
    res.status(500).json({ status: "Failed", message: "Server error" });
  }
};
