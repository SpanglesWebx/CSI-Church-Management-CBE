// controllers/asanamUniformController.js
const AsanamUniformItem = require("../Schema/AsanamUniformItem");
const AsanamUniformSale = require("../Schema/AsanamUniformSale");

// Add items (item-set)
exports.addItemSet = async (req, res) => {
  try {
    const { date, description, items } = req.body;
    if (!date || !items || !items.length) {
      return res.status(400).json({ message: "Invalid payload" });
    }
    const doc = new AsanamUniformItem({
      date,
      description,
      items,
    });
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// get all items (for search/autocomplete)
exports.getItems = async (req, res) => {
  try {
    // Option: return last N or flatten all items
    const docs = await AsanamUniformItem.find().sort({ date: -1 }).limit(50);
    // flatten many docs into a single array of items (keeping reference to item-set id)
    const items = [];
    docs.forEach((d) => {
      d.items.forEach((i) => {
        items.push({ _id: i._id, name: i.name, rate: i.rate, parentId: d._id });
      });
    });
    res.json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// add daily sale (one document per date)
exports.addSale = async (req, res) => {
  try {
    const { receipt_no, date, items, total_amount, description } = req.body;

    if (!receipt_no) {
      return res.status(400).json({ message: "Receipt number is required" });
    }

    if (!date || !items || !items.length) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const sale = new AsanamUniformSale({
      receipt_no,
      date,
      description: description || "",
      items,
      total_amount,
    });

    await sale.save();

    res.json({ success: true, data: sale });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// list sales with pagination, search, date range
exports.getSales = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = 25;
    const q = req.query.q || "";
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const filter = {};
    if (q) {
      // simple search on description or item name
      filter.$or = [
        { description: { $regex: q, $options: "i" } },
        { "items.name": { $regex: q, $options: "i" } },
      ];
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const total = await AsanamUniformSale.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;
    const data = await AsanamUniformSale.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ success: true, data, page, totalPages, total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.searchItems = async (req, res) => {
  try {
    const q = req.query.name || "";

    // 1️⃣ Get the latest item-set only
    const latestSet = await AsanamUniformItem.findOne(
      { "items.name": { $regex: q, $options: "i" } }
    )
      .sort({ date: -1 })  // newest first
      .lean();

    if (!latestSet) {
      return res.json({ data: [] });
    }

    // 2️⃣ Filter only matching items inside that latest set
    const result = latestSet.items
      .filter((i) =>
        i.name.toLowerCase().includes(q.toLowerCase())
      )
      .map((i) => ({
        _id: i._id,
        name: i.name,
        rate: i.rate,
        parentId: latestSet._id,
        date: latestSet.date,
      }));

    res.json({ data: result });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getItemSets = async (req, res) => {
  try {
    let year = req.query.year || new Date().getFullYear();

    const start = new Date(`${year}-01-01T00:00:00.000Z`);
    const end = new Date(`${year}-12-31T23:59:59.999Z`);

    const data = await AsanamUniformItem.find({
      date: { $gte: start, $lte: end }
    }).sort({ date: -1 });

    res.json({ success: true, year, data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getItemYears = async (req, res) => {
  try {
    const years = await AsanamUniformItem.aggregate([
      { $project: { year: { $year: "$date" } } },
      { $group: { _id: "$year" } },
      { $sort: { _id: -1 } }
    ]);

    res.json({ success: true, years: years.map((y) => y._id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

