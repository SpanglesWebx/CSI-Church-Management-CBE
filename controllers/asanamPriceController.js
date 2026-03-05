const AsanamPrice = require("../Schema/asanamPriceSchema");

// ➤ ADD PRICE
exports.addPrice = async (req, res) => {
  try {
    const { goat_price, rice_price, description } = req.body;

    if (!goat_price || !rice_price) {
      return res.status(400).json({
        status: false,
        message: "Goat Price & Rice Price are required",
      });
    }

    const newPrice = new AsanamPrice({
      goat_price,
      rice_price,
      description,
    });

    await newPrice.save();

    return res.status(200).json({
      status: true,
      message: "Price saved successfully",
      data: newPrice,
    });
  } catch (err) {
    console.error("Price Save Error:", err);
    return res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

// ➤ GET LATEST PRICE
exports.getLatestPrice = async (req, res) => {
  try {
    const price = await AsanamPrice.findOne().sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      data: price || null,
    });
  } catch (err) {
    console.error("Price Fetch Error:", err);
    return res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

// ➤ LIST ALL PRICES (optional)
// ➤ LIST PRICES WITH PAGINATION
exports.getAllPrices = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    let skip = (page - 1) * limit;

    // 👉 Get year from query OR default to current year
    const year = req.query.year || new Date().getFullYear();

    // 👉 Create date range for that year
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

    // 👉 Count only records for selected year
    const total = await AsanamPrice.countDocuments({
      date: { $gte: startDate, $lte: endDate }
    });

    const prices = await AsanamPrice.find({
      date: { $gte: startDate, $lte: endDate }
    })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      status: true,
      year: year,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      data: prices,
    });

  } catch (err) {
    console.error("Price Fetch Error:", err);
    return res.status(500).json({
      status: false,
      message: "Server Error",
    });
  }
};

exports.getAllYears = async (req, res) => {
  try {
    const years = await AsanamPrice.aggregate([
      {
        $project: {
          year: { $year: "$date" }
        }
      },
      { $group: { _id: "$year" } },
      { $sort: { _id: -1 } }
    ]);

    return res.json({
      status: true,
      years: years.map((y) => y._id)
    });
  } catch (err) {
    console.error("Year Fetch Error:", err);
    return res.status(500).json({ status: false, message: "Server Error" });
  }
};

