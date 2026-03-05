const Income = require("../Schema/AsanamTiffinCarrierIncome");
const Price = require("../Schema/AsanamTiffinCarrierPrice");

// ➤ Add income
exports.addIncome = async (req, res) => {
  try {
    const { member_id, member_name, phone, date_of_issue, asanam_day_date, num_carriers, description, created_by } = req.body;

    if (!member_id || !member_name || !date_of_issue || !asanam_day_date || num_carriers === undefined)
 {
      return res.status(400).json({
        status: "Failed",
        message: "Missing required fields",
      });
    }

    const year = new Date(date_of_issue).getFullYear();
    const priceDoc = await Price.findOne({ year });

    if (!priceDoc) {
      return res
        .status(400)
        .json({ status: "Failed", message: `Price not set for year ${year}` });
    }

    const price = Number(priceDoc.price_per_carrier);
    const num = Number(num_carriers);
    const amount = price * num;

    const doc = await Income.create({
  member_id,
  member_name,
  phone: phone || "",
  date_of_issue,
  asanam_day_date,
  year,
  num_carriers: num,
  price_per_carrier: price,
  amount,
  description: description || "",
  created_by: created_by || "",
  payment_status: "Unpaid",
});



    return res.json({ status: "Success", message: "Income saved", data: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Failed", message: "Server Error" });
  }
};

// ➤ List with filters
exports.listIncomes = async (req, res) => {
  try {
    const { page = 1, search = "", startDate = "", endDate = "" } = req.query;
    const limit = 25;
    const skip = (page - 1) * limit;

    let filter = {};

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { member_name: { $regex: regex } },
        { member_id: { $regex: regex } },
        { phone: { $regex: regex } },
      ];
    }

    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const total = await Income.countDocuments(filter);
    const incomes = await Income.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({ status: "Success", incomes, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Failed", message: "Server Error" });
  }
};

// ➤ Get single
exports.getIncomeById = async (req, res) => {
  try {
    const doc = await Income.findById(req.params.id);
    if (!doc)
      return res.status(404).json({ status: "Failed", message: "Record not found" });

    return res.json({ status: "Success", data: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Failed", message: "Server Error" });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const id = req.params.id;

    const doc = await Income.findByIdAndUpdate(
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
