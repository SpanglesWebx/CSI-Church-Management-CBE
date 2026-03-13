const LedgerCategory = require("../Schema/LedgerCategory");

const ACCOUNT_PREFIX = {
  "Capital A/c": "C",
  "Assets-Fixed Assets": "F",
  "Assets-Current Assets": "A",
  "Assets-Investments & Deposits": "D",
  "Liabilities-Current Liabilities and Provisions": "L",
  "Liabilities-Funds": "G",
  "Income": "I",
  "Expense": "E"
};


const normalizeAccountType = (value = "") =>
  String(value)
    .replace(/\u2013/g, "-") // en-dash → hyphen
    .replace(/\u2014/g, "-") // em-dash → hyphen (just in case)
    .replace(/–/g, "-") // fallback
    .replace(/\s+/g, " ")
    .trim();

const getStartingLedgerNumber = async (accountTypeInput) => {
  const accountType = normalizeAccountType(accountTypeInput);
  const prefix = ACCOUNT_PREFIX[accountType];
  if (!prefix) throw new Error("Invalid account type");

  const categories = await LedgerCategory.find({ accountType });

  let max = 0;
  categories.forEach(cat => {
    (cat.ledgers || []).forEach(l => {
      if (l.code && l.code.startsWith(prefix)) {
        const num = Number(l.code.slice(prefix.length));
        if (!isNaN(num) && num > max) max = num;
      }
    });
  });

  return max;
};

const generateLedgerCode = async (accountTypeInput) => {
  const accountType = normalizeAccountType(accountTypeInput);
  const prefix = ACCOUNT_PREFIX[accountType];
  if (!prefix) throw new Error("Invalid account type");

  const max = await getStartingLedgerNumber(accountType);
  const next = max + 1;
  const formatted = next < 10000 ? String(next).padStart(4, "0") : String(next);
  return `${prefix}${formatted}`;
};

exports.getNextLedgerCode = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await LedgerCategory.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const accountType = normalizeAccountType(category.accountType);
    const prefix = ACCOUNT_PREFIX[accountType];
    if (!prefix) return res.status(400).json({ message: "Invalid account type" });

    // Get all categories of the same account type and find current max
    const categories = await LedgerCategory.find({ accountType });
    let max = 0;
    categories.forEach(cat => {
      (cat.ledgers || []).forEach(l => {
        if (l.code && l.code.startsWith(prefix)) {
          const num = Number(l.code.slice(prefix.length));
          if (!isNaN(num) && num > max) max = num;
        }
      });
    });

    const next = prefix + String(max + 1).padStart(4, "0");
    return res.json({ next });
  } catch (err) {
    console.error("getNextLedgerCode error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
};

exports.getCategories = async (req, res) => {
  try {
    // prevent browser caching (avoids stale 304 responses)
    res.set("Cache-Control", "no-store");

    const { incomeType } = req.query;
    const accountType = normalizeAccountType(req.query.accountType);

    const filter = {};
    if (accountType) filter.accountType = accountType;
    if (accountType === "Income" && incomeType) {
      filter.incomeType = incomeType;
    }

    const categories = await LedgerCategory.find(filter).sort({ createdAt: 1 });
    return res.status(200).json(categories);
  } catch (err) {
    console.error("Error fetching ledger categories:", err);
    return res.status(500).json({ message: "Failed to fetch categories" });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { name, accountType: rawAccountType, incomeType } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Category name is required" });
    }
    if (!rawAccountType) {
      return res.status(400).json({ message: "Account type is required" });
    }

    const accountType = normalizeAccountType(rawAccountType);

    // validate accountType exists in our prefix map (optional but safe)
    if (!Object.prototype.hasOwnProperty.call(ACCOUNT_PREFIX, accountType) && accountType !== "Income") {
      // allow "Income" because it is also in ACCOUNT_PREFIX; this check is defensive
      return res.status(400).json({ message: "Invalid account type" });
    }

    // Income type validation
    if (accountType === "Income" && !incomeType) {
      return res.status(400).json({ message: "Income type is required for Income categories" });
    }

    const exists = await LedgerCategory.findOne({
      name: name.trim(),
      accountType,
      incomeType: accountType === "Income" ? incomeType : null
    });

    if (exists) {
      return res.status(400).json({ message: "Category already exists under this account type" });
    }

    const newCategory = new LedgerCategory({
      name: name.trim(),
      accountType,
      incomeType: accountType === "Income" ? incomeType : null,
      ledgers: []
    });

    await newCategory.save();
    return res.status(201).json({ message: "Category added successfully", category: newCategory });
  } catch (err) {
    console.error("Error adding ledger category:", err);
    return res.status(500).json({ message: "Failed to add category" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await LedgerCategory.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    await LedgerCategory.findByIdAndDelete(id);
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting ledger category:", err);
    return res.status(500).json({ message: "Failed to delete category" });
  }
};

exports.getLedgers = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await LedgerCategory.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    return res.status(200).json({ ledgers: category.ledgers || [] });
  } catch (err) {
    console.error("Error fetching ledgers:", err);
    return res.status(500).json({ message: "Failed to load ledgers" });
  }
};

exports.saveLedgers = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { ledgers } = req.body;

    if (!Array.isArray(ledgers)) {
      return res.status(400).json({ message: "Invalid ledgers format" });
    }

    const category = await LedgerCategory.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    // Normalize account type from stored category value
    const accountType = normalizeAccountType(category.accountType);
    const prefix = ACCOUNT_PREFIX[accountType];
    if (!prefix) {
      return res.status(400).json({ message: "Invalid account type" });
    }

    // Get current max (once)
    let currentMax = await getStartingLedgerNumber(accountType);

    const existingNames = new Set((category.ledgers || []).map(l => String(l.name).toLowerCase()));

    // Iterate through provided ledgers; accept either strings or objects with .name
    for (const item of ledgers) {
      const ledgerName = typeof item === "string" ? item : item?.name;
      if (!ledgerName || !String(ledgerName).trim()) continue;

      const nameTrimmed = ledgerName.trim();
      if (existingNames.has(nameTrimmed.toLowerCase())) continue;

      currentMax += 1;
      const formatted = currentMax < 10000 ? String(currentMax).padStart(4, "0") : String(currentMax);

      category.ledgers.push({
        code: `${prefix}${formatted}`,
        name: nameTrimmed
      });

      // add to existingNames to prevent duplicates within same request
      existingNames.add(nameTrimmed.toLowerCase());
    }

    // Save once
    await category.save();

    return res.status(200).json({
      message: "Ledgers updated successfully",
      ledgers: category.ledgers
    });
  } catch (err) {
    console.error("Error saving ledgers:", err);
    return res.status(500).json({ message: "Failed to save ledgers" });
  }
};

// GET BANK LEDGERS (Assets-Current Assets → Bank A/C)
exports.getBankLedgers = async (req, res) => {
  try {
    const category = await LedgerCategory.findOne({
      accountType: "Assets-Current Assets",
      name: "Bank A/C"
    });

    if (!category) {
      return res.status(404).json({ message: "Bank category not found" });
    }

    return res.json({
      categoryId: category._id,
      ledgers: category.ledgers
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};




// ⭐ SET DEPRECIATION
exports.setDepreciation = async (req, res) => {
  try {
    const { categoryId, depreciationPercent } = req.body;

    if (!categoryId)
      return res.status(400).json({ message: "Category required" });

    const category = await LedgerCategory.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    category.depreciationPercent = depreciationPercent || null;
    await category.save();

    res.json({ message: "Depreciation saved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};



// ⭐ SET LEDGER DEPRECIATION VALUE
exports.setLedgerDepreciation = async (req, res) => {
  try {
    const { categoryId, ledgerCode, depreciationValue, depreciationDate } = req.body;

    if (!categoryId || !ledgerCode)
      return res.status(400).json({ message: "Required fields missing" });

    const category = await LedgerCategory.findById(categoryId);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const ledger = category.ledgers.find(l => l.code === ledgerCode);
    if (!ledger)
      return res.status(404).json({ message: "Ledger not found" });

    ledger.depreciationValue = depreciationValue || null;
    ledger.depreciationDate = depreciationDate || null;

    await category.save();

    res.json({ message: "Ledger depreciation saved" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};




exports.toggleCategoryStatus = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await LedgerCategory.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

const newStatus = category.status === "active" ? "inactive" : "active";

if (newStatus === "inactive") {
  // Category OFF → all ledgers inactive
  category.ledgers.forEach(l => {
    l.previousStatus = l.status;
    l.status = "inactive";
  });
} else {
  // Category ON → restore previous ledger state
  category.ledgers.forEach(l => {
    if (l.previousStatus !== null) {
      l.status = l.previousStatus;
    }
  });
}

    category.status = newStatus;

    await category.save();

    res.json({ message: "Category status updated", category });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



exports.toggleLedgerStatus = async (req, res) => {
  try {
    const { categoryId, ledgerCode } = req.params;

    const category = await LedgerCategory.findById(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const ledger = category.ledgers.find(l => l.code === ledgerCode);
    if (!ledger) return res.status(404).json({ message: "Ledger not found" });

    ledger.status = ledger.status === "active" ? "inactive" : "active";

    await category.save();

    res.json({ message: "Ledger status updated", ledger });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};