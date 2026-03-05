const CanteenCollectionTeam = require("../Schema/CanteenCollectionTeam");
const CanteenCollectionPayment = require("../Schema/CanteenCollectionPayment");
const mongoose = require("mongoose");

// ---------------------- Create Shops ----------------------
exports.createTeams = async (req, res) => {
  try {
    const { year, teams } = req.body;

    if (!year || !teams || !Array.isArray(teams)) {
      return res.status(400).json({ success: false, message: "Year and shops required" });
    }

    const teamDoc = await CanteenCollectionTeam.create({ year, teams });
    return res.json({ success: true, data: teamDoc });
  } catch (err) {
    console.error("createTeams:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------------- Paginated list ----------------------
exports.getTeams = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "25");
    const search = (req.query.search || "").trim();

    const filter = {};

    // Search by year or shop name
    if (search) {
      if (/^\d{4}$/.test(search)) {
        filter.year = parseInt(search);
      } else {
        filter.teams = { $regex: search, $options: "i" };
      }
    }

    const total = await CanteenCollectionTeam.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;

    const data = await CanteenCollectionTeam.find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json({ success: true, data, page, totalPages, total });
  } catch (err) {
    console.error("getTeams:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------------- Fetch Group Details ----------------------
exports.getTeamDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid id" });

    const group = await CanteenCollectionTeam.findById(id).lean();
    if (!group)
      return res.status(404).json({ success: false, message: "Group not found" });

    const payments = await CanteenCollectionPayment.find({ team_group_id: id })
      .sort({ date: -1 })
      .lean();

    return res.json({ success: true, data: { group, payments } });
  } catch (err) {
    console.error("getTeamDetails:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------------- Add Payment ----------------------
exports.addPayment = async (req, res) => {
  try {
    const { team_group_id, date, payments } = req.body;

    if (!team_group_id || !date || !payments || !Array.isArray(payments)) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    // Check duplicate
    const existing = await CanteenCollectionPayment.findOne({ team_group_id, date });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Payment already added for this date",
      });
    }

    const normalized = payments.map((p) => ({
      team: p.team,
      amount: Number(p.amount || 0),
    }));

    const day_total = normalized.reduce((sum, item) => sum + item.amount, 0);

    // Insert payment
    const paymentDoc = await CanteenCollectionPayment.create({
      team_group_id,
      date,
      payments: normalized,
      day_total,
    });

    // Recalculate overall total
    const aggregation = await CanteenCollectionPayment.aggregate([
      { $match: { team_group_id: new mongoose.Types.ObjectId(team_group_id) } },
      { $group: { _id: "$team_group_id", total: { $sum: "$day_total" } } },
    ]);

    const total_amount = aggregation.length ? aggregation[0].total : 0;

    await CanteenCollectionTeam.findByIdAndUpdate(team_group_id, { total_amount });

    return res.json({ success: true, data: paymentDoc });
  } catch (err) {
    console.error("addPayment:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Payment already exists for this date",
      });
    }

    return res.status(500).json({ success: false, message: "Server error" });
  }
};
