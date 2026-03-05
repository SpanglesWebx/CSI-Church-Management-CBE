// controllers/ministryOfferingController.js
const MinistryOfferingCategory = require('../Schema/MinistryOfferingCategory');
const MinistryOffering = require('../Schema/MinistryOffering');
// Helper to escape regex special chars (for safe literal search)
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ======= CATEGORY =======

// Add a new category
exports.addCategory = async (req, res) => {
  try {
    const { category } = req.body;
    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({ status: "Failed", message: "Category name is required" });
    }

    const newCategory = new MinistryOfferingCategory({ category: category.trim() });
    await newCategory.save();

    return res.status(201).json({ status: "Success", message: "Category created successfully", category: newCategory });
  } catch (error) {
    // Handle duplicate key error cleanly
    if (error.code === 11000) {
      return res.status(400).json({ status: "Failed", message: "Category already exists" });
    }
    console.error("Error in addCategory:", error);
    return res.status(500).json({ status: "Failed", message: "Server error" });
  }
};

// Fetch all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await MinistryOfferingCategory.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ status: "Success", categories });
  } catch (error) {
    console.error("Error in getCategories:", error);
    return res.status(500).json({ status: "Failed", message: "Server error" });
  }
};

// Get category by id
exports.getCategoryById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "Failed", message: "Invalid category id" });
    }
    const category = await MinistryOfferingCategory.findById(id).lean();
    if (!category) return res.status(404).json({ status: "Failed", message: "Category not found" });
    return res.status(200).json({ status: "Success", category });
  } catch (error) {
    console.error("Error in getCategoryById:", error);
    return res.status(500).json({ status: "Failed", message: "Server error" });
  }
};

// ======= OFFERINGS =======

// Add a new offering
exports.addOffering = async (req, res) => {
  try {
    const { category, amount, date, day, description } = req.body;

    if (!category || amount == null || !date || !day) {
      return res.status(400).json({ status: "Failed", message: "Category, amount, date, and day are required" });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({ status: "Failed", message: "Invalid amount" });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ status: "Failed", message: "Invalid date" });
    }

    const newOffering = new MinistryOffering({
      category: String(category).trim(),
      amount: parsedAmount,
      date: parsedDate,
      day: String(day).trim(),
      description: description ? String(description) : "",
    });

    await newOffering.save();

    return res.status(201).json({ status: "Success", message: "Offering added successfully", offering: newOffering });
  } catch (error) {
    console.error("Error in addOffering:", error);
    return res.status(500).json({ status: "Failed", message: "Server error" });
  }
};

// Get offerings by category (with pagination, optional date range, and search)
exports.getOfferingsByCategory = async (req, res) => {
  try {
    const {
      category,
      page = '1',
      limit = '15',
      fromdate,
      todate,
      search,
    } = req.query;

    if (!category) {
      return res.status(400).json({ status: "Failed", message: "Category is required" });
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 15);
    const skip = (pageNum - 1) * limitNum;

    const query = { category: String(category).trim() };

    // Date filters (validate)
    if (fromdate) {
      const from = new Date(fromdate);
      if (isNaN(from.getTime())) return res.status(400).json({ status: "Failed", message: "Invalid fromdate" });
      query.date = { ...(query.date || {}), $gte: from };
    }
    if (todate) {
      const to = new Date(todate);
      if (isNaN(to.getTime())) return res.status(400).json({ status: "Failed", message: "Invalid todate" });
      query.date = { ...(query.date || {}), $lte: to };
    }

    // Search filter — only on description (assumes model has no member_name)
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const safe = escapeRegex(search.trim()).slice(0, 200); // cap length to reduce ReDoS risk
      query.description = { $regex: safe, $options: 'i' };
    }

    // Run queries in parallel: offerings + aggregation for totals & count
    const [offerings, totalsAgg] = await Promise.all([
      MinistryOffering.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      MinistryOffering.aggregate([
        { $match: query },
        { $group: { _id: null, totalAmount: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
    ]);

    const totalCount = totalsAgg[0]?.count ?? 0;
    const totalAmount = totalsAgg[0]?.totalAmount ?? 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      status: "Success",
      ministryOfferings: offerings,
      totalCount,
      totalAmount,
      totalPages,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    console.error("Error in getOfferingsByCategory:", error);
    return res.status(500).json({ status: "Failed", message: "Server error" });
  }
};