const LedgerCategory = require("../Schema/LedgerCategory");

exports.searchLedgers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json([]);
    }

    const keyword = q.trim().toLowerCase();

    /* ================================
       1️⃣ SEARCH LEDGER CATEGORIES
    ================================= */

    const categories = await LedgerCategory.find(
      { ledgers: { $exists: true, $not: { $size: 0 } } },
      { accountType: 1, incomeType: 1, name: 1, ledgers: 1 }
    );

    const results = [];

    categories.forEach((category) => {
      category.ledgers.forEach((ledger) => {
        if (
          ledger.name.toLowerCase().startsWith(keyword) ||
          ledger.code.toLowerCase().startsWith(keyword)
        ) {
          results.push({
            key: ledger.code,
            ledgerName: ledger.name,
            ledgerCode: ledger.code,
            categoryName: category.name,
            accountType: category.accountType,
            incomeType: category.incomeType,
            type: "Ledger",
          });
        }
      });
    });

    


    if (results.length === 0) {
      return res.json([{ key: "none", label: "No Records Found" }]);
    }

    res.status(200).json(results);

  } catch (err) {
    console.error("Ledger search error:", err);
    res.status(500).json([{ key: "none", label: "No Records Found" }]);
  }
};
