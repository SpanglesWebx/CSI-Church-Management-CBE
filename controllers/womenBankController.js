const WomenBank = require("../Schema/WomenBankSchema");

// 📌 Add Bank
exports.addWomenBank = async (req, res) => {
  try {
    const { ledger_code } = req.body;

    // 🔥 Prevent duplicate bank for same ledger
    const exists = await WomenBank.findOne({ ledger_code });

    if (exists) {
      return res.status(400).json({
        status: "Failed",
        message: "Bank already exists for this ledger"
      });
    }

    const bank = await WomenBank.create({
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
exports.getWomenBanks = async (req, res) => {
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

    const total = await WomenBank.countDocuments(query);

    const banks = await WomenBank.find(query)
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
    console.error(err);
    return res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};

// 📌 Add Opening Balance to Bank
exports.addWomenOpeningBalance = async (req, res) => {
  try {
    const { bank_id, date, amount } = req.body;

    if (!bank_id || !date || amount === undefined) {
      return res.status(400).json({
        status: "Failed",
        message: "Required fields missing",
      });
    }

    const bank = await WomenBank.findById(bank_id);

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
exports.getAllActiveWomenBanks = async (req, res) => {
  try {
    const banks = await WomenBank.find({ status: "Active" })
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
exports.getAllWomenBanksCombined = async (req, res) => {
  try {
    const [banks, cemBanks] = await Promise.all([
      WomenBank.find({ status: "Active" })
        .select("_id bank_name account_number ledger_code")
        .lean(),

      require("../Schema/cemBankSchema")
        .find({ status: "Active" })
        .select("_id bank_name account_number ledger_code")
        .lean(),
    ]);

    const normalTagged = banks.map((b) => ({
      ...b,
      bankType: "Women",
    }));

    const cemTagged = cemBanks.map((b) => ({
      ...b,
      bankType: "Cemetery",
    }));

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