// controllers/bagOfferingController.js
const BagOfferingCategory = require('../Schema/BagOfferingCategory');
const BagOffering = require('../Schema/BagOfferings');

// ======= CATEGORY =======

// Add a new category
exports.addCategory = async (req, res) => {
  try {
    const { category } = req.body;
    if (!category) return res.status(400).json({ message: "Category name is required" });

    // Prevent duplicates
    const existing = await BagOfferingCategory.findOne({ category });
    if (existing) return res.status(400).json({ message: "Category already exists" });

    const newCategory = new BagOfferingCategory({ category });
    await newCategory.save();

    res.status(201).json({ status: "Success", message: "Category created successfully", category: newCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Failed", message: "Server error" });
  }
};

// Fetch all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await BagOfferingCategory.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Failed", message: "Server error" });
  }
};

// ======= OFFERINGS =======

// Add a new offering
exports.addOffering = async (req, res) => {
  try {
    const { category, amount, date, day, description } = req.body;
    if (!category || !amount || !date || !day) {
      return res.status(400).json({ status: "Failed", message: "Category, amount, date, and day are required" });
    }

    const newOffering = new BagOffering({
      category,
      amount,
      date,
      day,
      description: description || "",
    });

    await newOffering.save(); 

    res.status(201).json({ status: "Success", message: "Offering added successfully", offering: newOffering });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Failed", message: "Server error" });
  }
};



exports.getOfferingsByCategory = async (req, res) => {
  try {
    const { category, page = 1, limit = 25, fromdate, todate, search } = req.query;

    if (!category)
      return res.status(400).json({ status: "Failed", message: "Category is required" });

    const query = { category };

    // ✅ Date Filter
    if (fromdate && todate) {
      query.date = {
        $gte: new Date(fromdate),
        $lte: new Date(todate),
      };
    } else if (fromdate) {
      query.date = { $gte: new Date(fromdate) };
    } else if (todate) {
      query.date = { $lte: new Date(todate) };
    }

    // ✅ Search Filter (optional)
    if (search) {
      query.$or = [
        { member_name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    // ✅ Fetch offerings with pagination
    const [offerings, totalCount, totalAmountAgg] = await Promise.all([
      BagOffering.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      BagOffering.countDocuments(query),
      BagOffering.aggregate([
        { $match: query },
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const totalAmount = totalAmountAgg[0]?.totalAmount || 0;

    res.status(200).json({
      status: "Success",
      bagOfferings: offerings,
      totalCount,
      totalAmount,
      totalPages,
    });
  } catch (error) {
    console.error("Error in getOfferingsByCategory:", error);
    res.status(500).json({ status: "Failed", message: "Server error" });
  }
};



// controller
exports.getCategoryById = async (req, res) => {
  try {
    const category = await BagOfferingCategory.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
