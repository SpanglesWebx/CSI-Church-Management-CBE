const CemBank = require("../Schema/cemBankSchema");


// =====================================================
// 📌 Add Cemetery Bank
// =====================================================
exports.addCemBank = async (req, res) => {
  try {
    const { ledger_code } = req.body;

    // 🚫 prevent duplicate ledger
    const exists = await CemBank.findOne({ ledger_code });

    if (exists) {
      return res.status(400).json({
        status: "Failed",
        message: "Bank already exists for this ledger",
      });
    }

    const bank = await CemBank.create({
      ...req.body,
      status: "Active",
    });

    return res.json({
      status: "Success",
      data: bank,
    });
  } catch (err) {
    console.error("Add cem bank error:", err);
    return res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};


// =====================================================
// 📌 List Cemetery Banks
// =====================================================
exports.getCemBanks = async (req, res) => {
  try {
    let { page = 1, limit = 25, search, status } = req.query;

    page = Number(page);
    limit = Number(limit);

    const query = {};

    // 🔍 search
    if (search) {
      query.$or = [
        { bank_name: new RegExp(search, "i") },
        { ledger_code: new RegExp(search, "i") },
      ];
    }

    // 🔽 status filter
    if (status && status !== "All") {
      query.status = status;
    }

    const total = await CemBank.countDocuments(query);

    const banks = await CemBank.find(query)
      .populate("account_type_id", "name")
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      status: "Success",
      banks,
      totalPages: Math.ceil(total / limit),
      page,
    });
  } catch (err) {
    console.error("Get cem banks error:", err);
    return res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};


// =====================================================
// 📌 Add Opening Balance
// =====================================================
exports.addCemOpeningBalance = async (req, res) => {
  try {
    const { bank_id, date, amount } = req.body;

    if (!bank_id || !date || amount === undefined) {
      return res.status(400).json({
        status: "Failed",
        message: "Required fields missing",
      });
    }

    const bank = await CemBank.findById(bank_id);

    if (!bank) {
      return res.status(404).json({
        status: "Failed",
        message: "Bank not found",
      });
    }

    // 🚫 prevent multiple OB
    if (bank.opening_balance > 0) {
      return res.status(400).json({
        status: "Failed",
        message: "Opening balance already set for this bank",
      });
    }

    bank.opening_balance = amount;
    bank.current_balance = amount;

    await bank.save();

    return res.json({
      status: "Success",
      message: "Opening balance added successfully",
      data: bank,
    });
  } catch (err) {
    console.error("Add cem OB error:", err);
    return res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};


// =====================================================
// 📌 Dropdown Active Banks
// =====================================================
exports.getAllActiveCemBanks = async (req, res) => {
  try {
    const banks = await CemBank.find({ status: "Active" })
      .select("_id bank_name account_number ledger_code")
      .sort({ bank_name: 1 });

    return res.json({
      status: "Success",
      banks,
    });
  } catch (err) {
    console.error("Dropdown cem banks error:", err);
    return res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};
