const AssetCategory = require("../Schema/MarriageHallAssetCategory");

// Create Category
const createCategory = async (req, res) => {
  const cat = await AssetCategory.create({ name: req.body.name, items: [] });
  res.json({ message: "Category created", data: cat });
};

// Add Item inside Category
const addItemToCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { item } = req.body;

  const cat = await AssetCategory.findById(categoryId);
  if (!cat) return res.status(404).json({ message: "Category not found" });

  cat.items.push({ name: item });
  await cat.save();

  res.json({ message: "Item added", data: cat });
};

// Get all categories with items
const getAssetCategories = async (req, res) => {
  const data = await AssetCategory.find().sort({ name: 1 });
  res.json({ data });
};

module.exports = {
  createCategory,
  addItemToCategory,
  getAssetCategories,
};