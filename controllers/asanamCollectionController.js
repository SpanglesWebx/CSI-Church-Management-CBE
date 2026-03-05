const AsanamCollection = require("../Schema/AsanamCollectionDonation");

// ➤ ADD ASANAM COLLECTION ENTRY
exports.addCollection = async (req, res) => {
  try {
    const {
      receipt_no,
      date,
      member_id,
      member_name,
      member_phone,

member_title,
member_tamil_name,
member_tamil_title,

      zone_name,

      goat_price,
      goat_count,
      goat_total,

      rice_price,
      rice_count,
      rice_total,

      asanam_amount,

      payment_method,
      cheque_number,
      cheque_date,
      upi_id,

      amount,
      description,
    } = req.body;

    // BASIC VALIDATION
    if (!receipt_no || !date) {
      return res.status(400).json({
        status: false,
        message: "Receipt No & Date required",
      });
    }

    if (!member_id || !member_name) {
      return res.status(400).json({
        status: false,
        message: "Member details required",
      });
    }

    // 🔥 UPDATED RULE: Goat OR Rice OR Asanam required
    const g = Number(goat_total) || 0;
    const r = Number(rice_total) || 0;
    const a = Number(asanam_amount) || 0;

    if (g === 0 && r === 0 && a === 0) {
      return res.status(400).json({
        status: false,
        message: "Enter Goat, Rice, or Asanam Amount",
      });
    }

    if (!payment_method) {
      return res.status(400).json({
        status: false,
        message: "Payment method required",
      });
    }

    if (payment_method === "Cheque" && !cheque_number) {
      return res.status(400).json({
        status: false,
        message: "Cheque number required",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: false,
        message: "Grand Total required",
      });
    }

    const entry = new AsanamCollection({
      receipt_no,
      date,
      member_id,
      member_name,
      member_phone,

member_title,
member_tamil_name,
member_tamil_title,

      zone_name,

      goat_price,
      goat_count,
      goat_total,

      rice_price,
      rice_count,
      rice_total,

      asanam_amount: a,

      payment_method,
      cheque_number: payment_method === "Cheque" ? cheque_number : "",
      cheque_date: payment_method === "Cheque" ? cheque_date : null,

      upi_id: payment_method === "UPI" ? upi_id : "",

      amount,
      description,
    });

    await entry.save();

    return res.status(200).json({
      status: true,
      message: "Asanam Collection saved successfully",
      data: entry,
    });

  } catch (err) {
    console.error("Asanam Collection Save Error:", err);
    return res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};



// ➤ GET DETAILS BY ID
exports.getSingleCollection = async (req, res) => {
  try {
    const entry = await AsanamCollection.findById(req.params.id);

    if (!entry)
      return res.status(404).json({ status: false, message: "Record not found" });

    return res.status(200).json({ status: true, data: entry });

  } catch (err) {
    console.error("Fetch Error:", err);
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};


// ➤ LIST with pagination and date filters
exports.listCollections = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      startDate,
      endDate,
      search
    } = req.query;

    const filter = {};

    // 📅 Date filter
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // 🔎 Search filter
    if (search && search.trim() !== "") {
      filter.$or = [
        { member_name: { $regex: search, $options: "i" } },
        { member_id: { $regex: search, $options: "i" } },
        { receipt_no: { $regex: search, $options: "i" } },
        { member_phone: { $regex: search, $options: "i" } },
      ];
    }

    const total = await AsanamCollection.countDocuments(filter);

    const records = await AsanamCollection.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return res.status(200).json({
      status: true,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data: records,
    });

  } catch (err) {
    console.error("List Error:", err);
    return res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};