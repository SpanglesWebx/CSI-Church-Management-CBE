// controllers/carolController.js
const CarolTeam = require("../Schema/CarolTeam");
const CarolPayment = require("../Schema/CarolPayment");
const mongoose = require("mongoose");

// -------------------------- Create Teams --------------------------
exports.createTeams = async (req, res) => {
  try {
    const { year, teams } = req.body;

    if (!year || !teams || !Array.isArray(teams)) {
      return res.status(400).json({ success: false, message: "Year and teams required" });
    }

    const teamDoc = await CarolTeam.create({ year, teams });
    return res.json({ success: true, data: teamDoc });
  } catch (err) {
    console.error("createTeams:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------------- List Teams with Search + Pagination --------------------------
exports.getTeams = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "25");
    const search = (req.query.search || "").trim();

    const filter = {};

    // Search: by year or team name
    if (search) {
      if (/^\d{4}$/.test(search)) {
        filter.year = parseInt(search);
      } else {
        filter.teams = { $regex: search, $options: "i" };
      }
    }

    const total = await CarolTeam.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;

    const items = await CarolTeam.find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const formatted = items.map((t) => ({
      ...t,
      teams_display: (t.teams || []).join(", "),
      created_date: t.created_at ? t.created_at.toISOString().split("T")[0] : null,
    }));

    return res.json({
      success: true,
      data: formatted,
      page,
      totalPages,
      total,
    });
  } catch (err) {
    console.error("getTeams:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------------- Fetch Full Team Details --------------------------
exports.getTeamDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid id" });

    const team = await CarolTeam.findById(id).lean();
    if (!team) return res.status(404).json({ success: false, message: "Team not found" });

    const payments = await CarolPayment.find({ team_group_id: id })
      .sort({ date: -1 })
      .lean();

    return res.json({ success: true, data: { team, payments } });
  } catch (err) {
    console.error("getTeamDetails:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------------- Add Payment (Prevent Duplicate Date) --------------------------
exports.addPayment = async (req, res) => {
  try {
    const { team_group_id, date, payments } = req.body;

    if (!team_group_id || !date || !payments || !Array.isArray(payments)) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    // Check duplicate date
    const existing = await CarolPayment.findOne({ team_group_id, date });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Payment already added for this date",
      });
    }

    const normalized = payments.map((p) => ({
      team: p.team,
      amount: Number(p.amount || 0),
      receipt_from: Number(p.receipt_from || 0),
      receipt_to: Number(p.receipt_to || 0),
    }));

    const day_total = normalized.reduce((sum, item) => sum + item.amount, 0);

    const paymentDoc = await CarolPayment.create({
      team_group_id,
      date,
      payments: normalized,
      day_total,
    });

    // Update overall total for CarolTeam
    const aggregation = await CarolPayment.aggregate([
      { $match: { team_group_id: new mongoose.Types.ObjectId(team_group_id) } },
      { $group: { _id: "$team_group_id", total: { $sum: "$day_total" } } },
    ]);

    const total_amount = aggregation.length ? aggregation[0].total : 0;

    await CarolTeam.findByIdAndUpdate(team_group_id, { total_amount });

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
