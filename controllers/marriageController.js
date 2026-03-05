// controllers/marriageController.js
const Marriage = require("../Schema/Marriage");

exports.addMarriage = async (req, res) => {
  try {
    const {
      type,
      date,
      amount,
      member,
      non_member,
      hallBooking
    } = req.body;

    if (!type || !date) {
      return res.status(400).json({ status: "Failed", message: "Type and date are required" });
    }

    const doc = await Marriage.create({
      type,
      date,
      amount,
      member: member || null,
      non_member: non_member || null,
      hallBooking: hallBooking || null,
    });

    return res.status(201).json({ status: "Success", message: "Marriage saved", data: doc });
  } catch (err) {
    return res.status(500).json({
      status: "Failed",
      message: err.message || "Server error",
    });
  }
};

exports.getMarriageList = async (req, res) => {
  try {
    let { page, limit, search, startDate, endDate } = req.query;

    page = Number(page) || 1;
    limit = Number(limit) || 25;

    const skip = (page - 1) * limit;

    let filter = {};

    // 🔍 Date filters
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // 🔍 Search filter (member or non_member)
    if (search && search.trim() !== "") {
      const regex = new RegExp(search, "i");

      filter.$or = [
        { "member.member_name": regex },
        { "non_member.name": regex },
      ];
    }

    const total = await Marriage.countDocuments(filter);

    const marriages = await Marriage.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      status: "Success",
      message: "Marriage list fetched",
      data: marriages,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });

  } catch (err) {
    return res.status(500).json({
      status: "Failed",
      message: err.message || "Server error",
    });
  }
};

