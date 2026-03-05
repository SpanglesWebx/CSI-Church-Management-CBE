// controllers/combinedSearchController.js
const ReceiptCategory = require("../Schema/ReceiptCategory");
const ExpenseCategory = require("../Schema/ExpenseCategory");

// GET /api/search?q=keyword
exports.searchReceiptAndExpense = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      // keep behaviour consistent with your existing endpoints
      return res.status(400).json([]);
    }

    const keyword = q.trim().toLowerCase();

    // fetch both category collections in parallel
    const [receiptCats, expenseCats] = await Promise.all([
      ReceiptCategory.find(
        { subcategories: { $exists: true, $not: { $size: 0 } } },
        { name: 1, subcategories: 1 }
      ),
      ExpenseCategory.find(
        { subcategories: { $exists: true, $not: { $size: 0 } } },
        { name: 1, subcategories: 1 }
      ),
    ]);

    const results = [];

    // receipts -> type: 'receipt'
    receiptCats.forEach((cat) => {
      cat.subcategories.forEach((sub) => {
        if (sub.toLowerCase().includes(keyword)) {
          results.push({
            key: `${sub}`,
            label: sub,
            category: cat.name,
            type: "receipt",
          });
        }
      });
    });

    // expenses -> type: 'expense'
    expenseCats.forEach((cat) => {
      cat.subcategories.forEach((sub) => {
        if (sub.toLowerCase().includes(keyword)) {
          results.push({
            key: `${sub}`,
            label: sub,
            category: cat.name,
            type: "expense",
          });
        }
      });
    });

    if (results.length === 0) {
      return res.json([{ key: "none", label: "No Records Found" }]);
    }

    // Optional: you can sort results alphabetically by label (keeps UX stable)
    results.sort((a, b) => a.label.localeCompare(b.label));

    return res.status(200).json(results);
  } catch (err) {
    console.error("Combined search error:", err);
    return res.status(500).json([{ key: "none", label: "No Records Found" }]);
  }
};
