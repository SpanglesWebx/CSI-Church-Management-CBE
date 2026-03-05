const mongoose = require("mongoose");   
const PoorHelpTitle = require("../Schema/PoorHelpTitle");

exports.addTitle = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || title.toString().trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    const newTitle = new PoorHelpTitle({ title: title.trim(), description: description || "" });
    await newTitle.save();

    return res.status(201).json({
      message: "Poor Help Title Added Successfully",
      data: newTitle,
    });
  } catch (error) {
    console.error("Add Title Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};



exports.getTitles = async (req, res) => {
  try {
    const {
      search = "",
      startDate,
      endDate,
      status = "All",
      page = 1,
      limit = 25,
    } = req.query;

    const pageNum = parseInt(page, 10) > 0 ? parseInt(page, 10) : 1;
    const pageSize = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 10;

    const filter = {};

    if (search && search.trim() !== "") {
      filter.title = { $regex: search.trim(), $options: "i" };
    }

    if (status !== "All") {
      filter.status = status;
    }

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

    const totalCount = await PoorHelpTitle.countDocuments(filter);
    const totalPages = Math.ceil(totalCount / pageSize);

    const docs = await PoorHelpTitle.find(filter)
      .sort({ status: 1, date: -1 })   // ← ⭐ Active first + latest first
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return res.json({
      data: docs,
      page: pageNum,
      totalPages,
      totalCount,
    });

  } catch (error) {
    console.error("Get Titles Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};


exports.updateTitleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const title = await PoorHelpTitle.findById(id);
    if (!title) {
      return res.status(404).json({ message: "Title not found" });
    }

    title.status = "Inactive";
    await title.save();

    return res.json({ message: "Title marked as Inactive", data: title });
  } catch (error) {
    console.error("Status Update Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// exports.searchTitles in controllers/poorHelpController.js
exports.searchTitles = async (req, res) => {
  try {
    const { search = "", limit = 20 } = req.query;
    const q = String(search || "").trim();

    const filter = { status: "Active" }; // only active titles for donation selection
    if (q) filter.title = { $regex: q, $options: "i" };

    const docs = await PoorHelpTitle.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit, 10))
      .select("_id title description")
      .lean();

    return res.json({ data: docs });
  } catch (err) {
    console.error("Search Titles Error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
