// controllers/tokenPriceController.js
const TokenPrice = require("../Schema/MissionaryBiriyaniTokenPrice");
 
// ➤ Add price (one per year only)
exports.addPrice = async (req, res) => {
  try {
    const { date, price_per_token, note } = req.body;
    if (!date || price_per_token === undefined) {
      return res.status(400).json({ status: "Failed", message: "Date and price_per_token are required" });
    }

    const year = new Date(date).getFullYear();

    const existing = await TokenPrice.findOne({ year });
    if (existing) {
      return res.status(400).json({ status: "Failed", message: `Price already set for year ${year}` });
    }

    const doc = await TokenPrice.create({
      year,
      date,
      price_per_token: Number(price_per_token),
      note: note || "",
    });

    return res.json({ status: "Success", message: "Price saved", data: doc });
  } catch (err) {
    console.error("❌ addPrice error:", err);
    return res.status(500).json({ status: "Failed", message: "Server error" });
  }
};

// ➤ Get price for a year
exports.getPriceByYear = async (req, res) => {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ status: "Failed", message: "Year is required" });

    const y = Number(year);
    const doc = await TokenPrice.findOne({ year: y });
    if (!doc) return res.status(404).json({ status: "Failed", message: "Price not found for this year" });

    return res.json({ status: "Success", data: doc });
  } catch (err) {
    console.error("❌ getPriceByYear error:", err);
    return res.status(500).json({ status: "Failed", message: "Server error" });
  }
};

// ➤ Optional: list all prices (admin)
exports.listPrices = async (req, res) => {
  try {
    const docs = await TokenPrice.find({}).sort({ year: -1 });
    return res.json({ status: "Success", data: docs });
  } catch (err) {
    console.error("❌ listPrices error:", err);
    return res.status(500).json({ status: "Failed", message: "Server error" });
  }
};
