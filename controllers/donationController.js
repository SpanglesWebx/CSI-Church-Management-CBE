const mongoose = require("mongoose");
const Donation = require("../Schema/DonationSchema");
const PoorHelpTitle = require("../Schema/PoorHelpTitle"); // adjust path if needed

// POST /donations/add
exports.addDonation = async (req, res) => {
  try { // you may validate auth elsewhere

    const {
      isMember = true,
      member_id = "",
      member_name = "",
      member_phone = "",
      non_member_name = "",
      non_member_phone = "",
      help_title_id,
      help_title_name,
      amount,
      date,
      description = ""
    } = req.body;

    if (!help_title_id || !help_title_name) {
      return res.status(400).json({ message: "Help title is required" });
    }

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    // Optional: validate title id exists
    if (!mongoose.Types.ObjectId.isValid(help_title_id)) {
      return res.status(400).json({ message: "Invalid help_title_id" });
    }

    const title = await PoorHelpTitle.findById(help_title_id);
    if (!title) {
      return res.status(404).json({ message: "Help title not found" });
    }

    const donation = new Donation({
      isMember,
      member_id: isMember ? member_id : "",
      member_name: isMember ? member_name : "",
      member_phone: isMember ? member_phone : "",
      non_member_name: !isMember ? non_member_name : "",
      non_member_phone: !isMember ? non_member_phone : "",
      help_title_id,
      help_title_name,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      description
    });

    await donation.save();

    return res.status(201).json({ message: "Donation saved", data: donation });
  } catch (err) {
    console.error("Add Donation Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};


// GET /donations/list
// query: page, limit, search, startDate, endDate
exports.listDonations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      startDate,
      endDate
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const pageSize = Math.max(parseInt(limit, 10) || 10, 1);

    const filter = {};

    // search: match member_name, non_member_name, or help_title_name (case-insensitive contains)
    if (search && String(search).trim() !== "") {
      const q = String(search).trim();
      filter.$or = [
        { member_name: { $regex: q, $options: "i" } },
        { non_member_name: { $regex: q, $options: "i" } },
        { help_title_name: { $regex: q, $options: "i" } },
        { member_id: { $regex: q, $options: "i" } }
      ];
    }

    // date filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const sd = new Date(startDate);
        sd.setHours(0, 0, 0, 0);
        filter.date.$gte = sd;
      }
      if (endDate) {
        const ed = new Date(endDate);
        ed.setHours(23, 59, 59, 999);
        filter.date.$lte = ed;
      }
    }

    const totalCount = await Donation.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / pageSize);

    const docs = await Donation.find(filter)
      .sort({ date: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return res.json({
      donations: docs,
      page: pageNum,
      totalPages,
      totalCount
    });
  } catch (err) {
    console.error("List Donations Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
