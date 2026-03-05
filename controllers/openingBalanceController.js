const OpeningBalance = require("../Schema/OpeningBalanceSchema");
const Bank = require("../Schema/bankSchema");
const CashAccount = require("../Schema/CashAccountSchema");

/**
 * ADD OPENING BALANCE
 */
exports.addOpeningBalance = async (req, res) => {
  try {
    const { account_type, bank_id, amount, as_on_date } = req.body;

    if (!account_type || !amount || !as_on_date) {
      return res.status(400).json({
        status: "Failed",
        message: "Required fields missing",
      });
    }

    if (account_type === "Cash at Bank A/c" && !bank_id) {
      return res.status(400).json({
        status: "Failed",
        message: "Bank is required for Cash at Bank",
      });
    }

    const openingBalance = await OpeningBalance.create({
      account_type,
      bank_id: bank_id || null,
      amount,
      as_on_date,
    });
    
    if (account_type === "Cash on Hand A/c" || account_type === "Petty Cash A/c") {
      await CashAccount.findOneAndUpdate(
        { account_type },
        {
          opening_balance: amount,
          current_balance: amount,
        },
        { upsert: true, new: true }
      );
    }


    res.status(201).json({
      status: "Success",
      message: "Opening balance added successfully",
      data: openingBalance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};

/**
 * LIST OPENING BALANCES (PAGINATED)
 */
exports.getOpeningBalances = async (req, res) => {
  try {
    const { page = 1, limit = 25, search, from, to } = req.query;

    const filter = {};

    if (search) {
      filter.account_type = { $regex: search, $options: "i" };
    }

    if (from || to) {
      filter.as_on_date = {};
      if (from) filter.as_on_date.$gte = new Date(from);
      if (to) filter.as_on_date.$lte = new Date(to);
    }

    const total = await OpeningBalance.countDocuments(filter);

    const data = await OpeningBalance.find(filter)
      .populate("bank_id", "bank_name account_number current_balance")
      .sort({ as_on_date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean(); // 🔥 critical

    // 🔥 attach live balance
    for (const item of data) {
      if (
        item.account_type === "Cash on Hand A/c" ||
        item.account_type === "Petty Cash A/c"
      ) {
        const cash = await CashAccount.findOne({
          account_type: item.account_type,
        }).lean();

        item.current_balance = cash?.current_balance || 0;
      }

      if (item.account_type === "Cash at Bank A/c" && item.bank_id) {
        item.current_balance = item.bank_id.current_balance || 0;
      }
    }

    res.json({
      status: "Success",
      data,
      totalPages: Math.ceil(total / limit),
      page: Number(page),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "Failed",
      message: "Failed to fetch opening balances",
    });
  }
};

