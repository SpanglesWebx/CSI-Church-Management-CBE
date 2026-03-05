// controllers/staffController.js
const Staff = require("../Schema/staffSchema");
const StaffAdvance = require("../Schema/staffAdvanceSchema");
const generateEmployeeId = require("../util/generateEmployeeId");

// ➕ Add Staff
exports.addStaff = async (req, res) => {
  try {
    const {
      isMember,
      member_id,
      member_name,
      member_tamil_name,
      gender,
      phone,
      aadhar_number,
      permanent_address,
      present_address,
      non_member_name,
      non_member_tamil_name,
      non_member_gender,
      non_member_phone,
      non_member_aadhar,
      non_member_permanent_address,
      non_member_present_address,
      designation,
      salary,
      notes,
    } = req.body;

    // 🧩 Generate Unique Employee ID
    const employee_id = await generateEmployeeId();

    const staff = new Staff({
      employee_id,
      isMember,
      member_id,
      member_name,
      member_tamil_name,
      gender,
      phone,
      aadhar_number,
      permanent_address,
      present_address,
      non_member_name,
      non_member_tamil_name,
      non_member_gender,
      non_member_phone,
      non_member_aadhar,
      non_member_permanent_address,
      non_member_present_address,
      designation,
      salary,
      notes,
    });

    await staff.save();

    res.status(201).json({
      success: true,
      message: "Staff added successfully",
      employee_id,
    });
  } catch (error) {
    console.error("Error adding staff:", error);
    res.status(500).json({ message: "Server error while adding staff" });
  }
};

// 🆔 Generate Employee ID (for frontend preview)
exports.generateNewEmployeeId = async (req, res) => {
  try {
    const employee_id = await generateEmployeeId();
    res.status(200).json({ employee_id });
  } catch (err) {
    console.error("Error generating employee ID:", err);
    res.status(500).json({ message: "Failed to generate employee ID" });
  }
};

// 📋 Get Staff List with Filters and Pagination
exports.getStaffs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search = "",
      fromDate,
      toDate,
      status = "All",
    } = req.query;

    const query = {};

    // 🔍 Search filter
    if (search) {
      query.$or = [
        { employee_id: { $regex: search, $options: "i" } },
        { member_name: { $regex: search, $options: "i" } },
        { non_member_name: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
      ];
    }

    // 📆 Date range filter (by start_date)
    if (fromDate && toDate) {
      query.start_date = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    // ⚙️ Status filter
    if (status !== "All") {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const total = await Staff.countDocuments(query);

    // ✅ Sort: Active first, Inactive last, then newest first within each group
    const staffs = await Staff.find(query)
      .sort({ status: 1, createdAt: -1 }) // 🔥 Main change
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      staffs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (err) {
    console.error("Error fetching staffs:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// 🔄 Update Staff Status
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = { ...req.body }; // spread body directly for partial updates

    // ✅ Handle status + end_date logic safely
    if (req.body.status === "Inactive") {
      updateFields.inactive_description = req.body.inactive_description || "";
      updateFields.end_date = new Date();
    } else if (req.body.status === "Active") {
      updateFields.inactive_description = "";
      updateFields.end_date = null;
    }

    // ✅ Ensure Aadhaar retains spaces (for non-members)
    if (req.body.non_member_aadhar) {
      updateFields.non_member_aadhar = req.body.non_member_aadhar
        .replace(/\s{2,}/g, " ") // clean double spaces only
        .trim(); // keep format like "1234 5678 9012"
    }

    // ✅ Perform partial update — keeps all other data untouched
    const staff = await Staff.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.status(200).json({
      message: "Staff updated successfully",
      staff,
    });
  } catch (err) {
    console.error("Error updating staff:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// 🗑️ Delete Staff
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Staff.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Staff not found" });
    res.status(200).json({ message: "Staff deleted successfully" });
  } catch (err) {
    console.error("Error deleting staff:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getActiveStaffs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search = "",
      fromDate,
      toDate,
    } = req.query;

    const query = { status: "Active" };

    if (search) {
      query.$or = [
        { employee_id: { $regex: search, $options: "i" } },
        { member_name: { $regex: search, $options: "i" } },
        { non_member_name: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
      ];
    }

    if (fromDate && toDate) {
      query.start_date = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    const skip = (page - 1) * limit;
    const [staffs, total] = await Promise.all([
      Staff.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Staff.countDocuments(query),
    ]);

    // Compute advance totals in ONE query
    const ids = staffs.map(s => s.employee_id);
    const totals = await StaffAdvance.aggregate([
      { $match: { employee_id: { $in: ids } } },
      { $group: { _id: "$employee_id", totalAdvance: { $sum: "$amount" } } },
    ]);

    const advMap = Object.fromEntries(totals.map(t => [t._id, t.totalAdvance]));

    const enriched = staffs.map(s => ({
      ...s,
      advancePaid: advMap[s.employee_id] || 0,
    }));

    // avoid stale caching
    res.set("Cache-Control", "no-store");

    res.status(200).json({
      staffs: enriched,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (err) {
    console.error("Error fetching active staffs:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.addStaffAdvance = async (req, res) => {
  try {
    const { employee_id, amount, date } = req.body;

    if (!employee_id || !amount || !date)
      return res.status(400).json({ message: "All fields are required" });

    const staff = await Staff.findOne({ employee_id });
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    const advance = await StaffAdvance.create({
      employee_id,
      amount,
      date,
    });

    res.status(201).json({
      success: true,
      message: "Advance added successfully",
      advance,
    });
  } catch (error) {
    console.error("Error adding advance:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📜 Get Advance History by Employee ID
// ✅ controllers/staffController.js
exports.getStaffAdvances = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { page = 1, limit = 5 } = req.query; // default 5 per page

    const skip = (page - 1) * limit;

    // Fetch only the current page of results
    const advances = await StaffAdvance.find({ employee_id })
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalRecords = await StaffAdvance.countDocuments({ employee_id });
    const totalAdvance = await StaffAdvance.aggregate([
      { $match: { employee_id } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.status(200).json({
      success: true,
      employee_id,
      totalAdvance: totalAdvance[0]?.total || 0,
      advances,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: parseInt(page),
      totalRecords,
    });
  } catch (error) {
    console.error("Error fetching staff advances:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
