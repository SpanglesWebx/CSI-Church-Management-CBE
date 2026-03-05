const Price = require("../Schema/AsanamTiffinCarrierPrice");

// ➤ Add price (one per year)
exports.addPrice = async (req, res) => {
  try {
    const { date, price_per_carrier, note } = req.body;

    if (!date || price_per_carrier === undefined) {
      return res.status(400).json({
        status: "Failed",
        message: "Date and price_per_carrier are required",
      });
    }

    const year = new Date(date).getFullYear();
    const exist = await Price.findOne({ year });

    if (exist) {
      return res
        .status(400)
        .json({ status: "Failed", message: `Price already exists for ${year}` });
    }

    const doc = await Price.create({
      year,
      date,
      price_per_carrier: Number(price_per_carrier),
      note: note || "",
    });

    return res.json({ status: "Success", message: "Price saved", data: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Failed", message: "Server Error" });
  }
};

// ➤ Get price by year
exports.getPriceByYear = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ status: "Failed", message: "Year is required" });

    const doc = await Price.findOne({ year: Number(year) });
    if (!doc)
      return res
        .status(404)
        .json({ status: "Failed", message: "No price for this year" });

    return res.json({ status: "Success", data: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Failed", message: "Server Error" });
  }
};

// ➤ List all
exports.listPrices = async (req, res) => {
  try {
    const docs = await Price.find({}).sort({ year: -1 });
    return res.json({ status: "Success", data: docs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Failed", message: "Server Error" });
  }
};
