const SystemLedger = require("../Schema/SystemLedgerSchema");

/**
 * Add System Ledger
 */
exports.addSystemLedger = async (req, res) => {
  try {
    const { ledgerName, ledgerType } = req.body;

    if (!ledgerName || !ledgerType) {
      return res.status(400).json({
        message: "Ledger name and type are required",
      });
    }

    const exists = await SystemLedger.findOne({ ledgerName });
    if (exists) {
      return res.status(400).json({
        message: "Ledger already exists",
      });
    }

    const ledger = await SystemLedger.create({
      ledgerName,
      ledgerType,
    });

    res.status(201).json({
      message: "System ledger created successfully",
      data: ledger,
    });
  } catch (err) {
    console.error("Add System Ledger Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * List System Ledgers
 */
exports.getSystemLedgers = async (req, res) => {
  try {
    const { page = 1, limit = 25, search = "" } = req.query;
    const skip = (page - 1) * limit;

    const query = search
      ? { ledgerName: { $regex: search, $options: "i" } }
      : {};

    const [data, total] = await Promise.all([
      SystemLedger.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      SystemLedger.countDocuments(query),
    ]);

    res.json({
      data,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch system ledgers" });
  }
};
