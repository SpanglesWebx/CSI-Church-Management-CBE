// controllers/tokenIncomeController.js
const TokenIncome = require("../Schema/MissionaryBiriyaniTokenIncome");
const TokenPrice = require("../Schema/MissionaryBiriyaniTokenPrice");

// ➤ Add income: validates price exists for year, computes amount
exports.addIncome = async (req, res) => {
  try {
    const { 
  member_id, 
  member_name, 
  phone, 
  date_of_issue, 
  missionary_day_date,
  num_tokens, 
  description, 
  created_by 
} = req.body;


    if (!member_id || !member_name || !date_of_issue || !missionary_day_date || num_tokens === undefined)
 {
      return res.status(400).json({ status: "Failed", message: "Missing required fields" }); 
    }

    const year = new Date(date_of_issue).getFullYear();


    const priceDoc = await TokenPrice.findOne({ year });
    if (!priceDoc) {
      return res.status(400).json({ status: "Failed", message: `Token price not set for year ${year}` });
    }

    const price_per_token = Number(priceDoc.price_per_token);
    const num = Number(num_tokens);
    const amount = price_per_token * num;

   const doc = await TokenIncome.create({
  member_id,
  member_name,
  phone: phone || "",
  date_of_issue,
  missionary_day_date,
  year,
  num_tokens: num,
  price_per_token,
  amount,
  description: description || "",
  created_by: created_by || "",
  payment_status: "Unpaid"
});


    return res.json({ status: "Success", message: "Token income saved", data: doc });
  } catch (err) {
    console.error("❌ addIncome error:", err);
    return res.status(500).json({ status: "Failed", message: "Server error" });
  }
};

// ➤ List incomes with pagination / search / date filter
exports.listIncomes = async (req, res) => {
  try {
    const { page = 1, search = "", startDate = "", endDate = "" } = req.query;
    const limit = 25;
    const skip = (page - 1) * limit;

    let filter = {};

    if (search) {
      const regex = new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { member_name: { $regex: regex } },
        { member_id: { $regex: regex } },
        { phone: { $regex: regex } }
      ];
    }

    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      filter.date = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.date = { $lte: new Date(endDate) };
    }

    const total = await TokenIncome.countDocuments(filter);
    const incomes = await TokenIncome.find(filter).sort({ date: -1 }).skip(skip).limit(limit);

    return res.json({ status: "Success", incomes, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("❌ listIncomes error:", err);
    return res.status(500).json({ status: "Failed", message: "Server error" });
  }
};

// ➤ Get single income by id
exports.getIncomeById = async (req, res) => {
  try {
    const doc = await TokenIncome.findById(req.params.id);
    if (!doc) return res.status(404).json({ status: "Failed", message: "Record not found" });
    return res.json({ status: "Success", data: doc });
  } catch (err) {
    console.error("❌ getIncomeById error:", err);
    return res.status(500).json({ status: "Failed", message: "Server error" });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const id = req.params.id;

    const doc = await TokenIncome.findByIdAndUpdate(
      id,
      {
        payment_status: "Paid",
        payment_date: new Date(),
      },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({
        status: "Failed",
        message: "Record not found",
      });
    }

    return res.json({
      status: "Success",
      message: "Payment marked as Paid",
      data: doc,
    });
  } catch (err) {
    console.error("markAsPaid error:", err);
    res.status(500).json({
      status: "Failed",
      message: "Server Error",
    });
  }
};
