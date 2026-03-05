const ReceiptCategory = require("../Schema/ReceiptCategory");

// ===============================
// GET ALL RECEIPT CATEGORIES
// ===============================
exports.getCategories = async (req, res) => {
  try {
    const categories = await ReceiptCategory.find().sort({ createdAt: 1 });
    res.status(200).json(categories);
  } catch (err) {
    console.error("Error fetching receipt categories:", err);
    res.status(500).json({ message: "Failed to fetch receipt categories" });
  }
};

// ===============================
// ADD NEW RECEIPT CATEGORY
// ===============================
exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const exists = await ReceiptCategory.findOne({ name: name.trim() });
    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const newCategory = new ReceiptCategory({
      name: name.trim(),
      subcategories: [],
    });

    await newCategory.save();

    res.status(201).json({
      message: "Category added successfully",
      category: newCategory,
    });
  } catch (err) {
    console.error("Error adding receipt category:", err);
    res.status(500).json({ message: "Failed to add category" });
  }
};

// ===============================
// DELETE RECEIPT CATEGORY
// ===============================
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await ReceiptCategory.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await ReceiptCategory.findByIdAndDelete(id);

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting receipt category:", err);
    res.status(500).json({ message: "Failed to delete category" });
  }
};

// ===============================
// GET SUBCATEGORIES
// ===============================
exports.getSubcategories = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await ReceiptCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      subcategories: category.subcategories || [],
    });
  } catch (err) {
    console.error("Error fetching receipt subcategories:", err);
    res.status(500).json({ message: "Failed to load subcategories" });
  }
};

// ===============================
// SAVE / UPDATE SUBCATEGORIES
// ===============================
exports.saveSubcategories = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { subcategories } = req.body;

    if (!Array.isArray(subcategories)) {
      return res.status(400).json({ message: "Invalid subcategories format" });
    }

    const category = await ReceiptCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.subcategories = subcategories;
    await category.save();

    res.status(200).json({
      message: "Subcategories updated successfully",
      subcategories: category.subcategories,
    });
  } catch (err) {
    console.error("Error saving receipt subcategories:", err);
    res.status(500).json({ message: "Failed to save subcategories" });
  }
};
