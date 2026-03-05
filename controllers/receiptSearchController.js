const ReceiptCategory = require("../Schema/ReceiptCategory");

// 🔍 SEARCH RECEIPT SUBCATEGORIES (WITH CATEGORY)
exports.searchReceiptFor = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json([]);
    }

    const keyword = q.trim().toLowerCase();

    // Fetch all receipt categories
    const categories = await ReceiptCategory.find(
      { subcategories: { $exists: true, $not: { $size: 0 } } },
      { name: 1, subcategories: 1 }
    );

    const results = [];

    categories.forEach((category) => {
      category.subcategories.forEach((sub) => {
        if (sub.toLowerCase().includes(keyword)) {
          results.push({
            key: `${sub}`,
            label: sub,                 // what user sees
            category: category.name,    // parent category
            type: "subcategory",        // used by frontend
          });
        }
      });
    });

    if (results.length === 0) {
      return res.json([
        { key: "none", label: "No Records Found" }
      ]);
    }

    res.status(200).json(results);
  } catch (err) {
    console.error("Receipt search error:", err);
    res.status(500).json([
      { key: "none", label: "No Records Found" }
    ]);
  }
};
