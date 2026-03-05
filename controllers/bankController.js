// controllers/bankController.js
const Bank = require("../Schema/bankSchema");



// 📌 Add Bank
exports.addBank = async (req, res) => {
  try {
    const { ledger_code } = req.body;

    // 🔥 Prevent duplicate bank for same ledger
    const exists = await Bank.findOne({ ledger_code });

    if (exists) {
      return res.status(400).json({
        status: "Failed",
        message: "Bank already exists for this ledger"
      });
    }

    const bank = await Bank.create({
      ...req.body,
      status: "Active",
    });

    return res.json({ status: "Success", data: bank });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "Failed",
      message: "Server error"
    });
  }
};


// 📌 List Banks (pagination + search + status)
exports.getBanks = async (req, res) => {
  try {
    let { page = 1, limit = 25, search, status } = req.query;
    page = Number(page);
    limit = Number(limit);

    const query = {};

    // 🔍 Search by Bank Name OR Account Code
    if (search) {
      query.$or = [
        { bank_name: new RegExp(search, "i") },
        { ledger_code: new RegExp(search, "i") },
      ];
    }

    // 🔽 Status filter (default Active handled in frontend)
    if (status && status !== "All") {
      query.status = status;
    }

    const total = await Bank.countDocuments(query);

    const banks = await Bank.find(query)
      .populate("account_type_id", "name") // 👈 get account type name
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
    console.error(err);
    return res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};

// 📌 Add Opening Balance to Bank
exports.addOpeningBalance = async (req, res) => {
  try {
    const { bank_id, date, amount } = req.body;

    if (!bank_id || !date || amount === undefined) {
      return res.status(400).json({
        status: "Failed",
        message: "Required fields missing",
      });
    }

    const bank = await Bank.findById(bank_id);

    if (!bank) {
      return res.status(404).json({
        status: "Failed",
        message: "Bank not found",
      });
    }

    // ❌ Prevent multiple opening balances
    if (bank.opening_balance > 0) {
      return res.status(400).json({
        status: "Failed",
        message: "Opening balance already set for this bank",
      });
    }

    // ✅ Set balances
    bank.opening_balance = amount;
    bank.current_balance = amount;

    await bank.save();

    return res.json({
      status: "Success",
      message: "Opening balance added successfully",
      data: bank,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};

// 📌 Get all active banks for dropdown (NO pagination)
exports.getAllActiveBanks = async (req, res) => {
  try {
    const banks = await Bank.find({ status: "Active" })
      .select("_id bank_name account_number ledger_code")
      .sort({ bank_name: 1 });

    return res.json({
      status: "Success",
      banks,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};

// 📌 Get ALL banks (Normal + Cemetery) for BRS dropdown
exports.getAllBanksCombined = async (req, res) => {
  try {
    const [banks, cemBanks] = await Promise.all([
      Bank.find({ status: "Active" })
        .select("_id bank_name account_number ledger_code")
        .lean(),

      // 🔥 cemetery banks
      require("../Schema/cemBankSchema")
        .find({ status: "Active" })
        .select("_id bank_name account_number ledger_code")
        .lean(),
    ]);

    // ✅ tag source (VERY IMPORTANT for future safety)
    const normalTagged = banks.map((b) => ({
      ...b,
      bankType: "Church",
    }));

    const cemTagged = cemBanks.map((b) => ({
      ...b,
      bankType: "Cemetery",
    }));

    // ✅ merge + sort
    const combined = [...normalTagged, ...cemTagged].sort((a, b) =>
      a.bank_name.localeCompare(b.bank_name)
    );

    return res.json({
      status: "Success",
      banks: combined,
    });
  } catch (err) {
    console.error("Combined bank dropdown error:", err);
    return res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};
