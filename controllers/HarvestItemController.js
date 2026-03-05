// Controllers/HarvestItemController.js
const HarvestItem = require("../Schema/HarvestItem");

// ➤ Add Harvest Item
exports.addHarvestItem = async (req, res) => {
  try {
    const item = new HarvestItem(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.getHarvestItems = async (req, res) => {
  try {
    const { page = 1, limit = 25, search = "" } = req.query;
    const skip = (page - 1) * limit;

    const query = {};

    // 🔍 Search by item code or item name (case-insensitive)
    if (search.trim()) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    // 🔹 Paginated data
    const items = await HarvestItem.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // 🔹 Total count for pagination
    const total = await HarvestItem.countDocuments(query);

    res.status(200).json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ➤ Update Harvest Item
exports.updateHarvestItem = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedItem = await HarvestItem.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true } // return updated doc & validate schema
    );

    if (!updatedItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};