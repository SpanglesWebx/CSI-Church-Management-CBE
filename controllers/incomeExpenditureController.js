const Receipt = require("../Schema/ReceiptSchema");
const ChurchExpense = require("../Schema/ChurchExpenseSchema");
const Journal = require("../Schema/JournalSchema");
const LedgerCategory = require("../Schema/LedgerCategory");

/* ---------------- GROUPING ---------------- */

function groupReceipts(receipts) {
  const grouped = {};

  (receipts || []).forEach((r) => {
    (r.receiptLines || []).forEach((line) => {
      const category = (line.ledgerCategoryName || "Others").trim();
      const ledger = (line.ledgerName || "Unknown").trim();
      const amount = Number(line.amount || 0);

      if (!grouped[category]) grouped[category] = {};
      if (!grouped[category][ledger]) grouped[category][ledger] = 0;

      grouped[category][ledger] += amount;
    });
  });

  return grouped;
}

function groupExpenses(expenses) {
  const grouped = {};

  (expenses || []).forEach((e) => {
    (e.expenseLines || []).forEach((line) => {
      const category = (line.ledgerCategoryName || "Others").trim();
      const ledger = (line.ledgerName || "Unknown").trim();
      const amount = Number(line.amount || 0);

      if (!grouped[category]) grouped[category] = {};
      if (!grouped[category][ledger]) grouped[category][ledger] = 0;

      grouped[category][ledger] += amount;
    });
  });

  return grouped;
}

function mergeJournalsIntoGroups(
  incomeGrouped,
  expenseGrouped,
  journals,
  ledgerCodeCategoryMap = {}
) {
  journals.forEach((j) => {

    // Header Ledger → Expense side
    if (j.headerLedger) {
      const ledgerName = j.headerLedger.ledgerName || "Unknown";
      const ledgerCode = j.headerLedger.ledgerCode;
      const category = ledgerCodeCategoryMap[ledgerCode] || "Others";
      const amount = Number(j.totalAmount || 0);

      if (!expenseGrouped[category]) expenseGrouped[category] = {};
      if (!expenseGrouped[category][ledgerName])
        expenseGrouped[category][ledgerName] = 0;

      expenseGrouped[category][ledgerName] += amount;
    }

    // Entries
    (j.entries || []).forEach((entry) => {
      const category = entry.ledger?.categoryName || "Others";
      const ledger = entry.ledger?.ledgerName || "Unknown";
      const amount = Number(entry.amount || 0);

      if (entry.type === "Credit") {
        if (!incomeGrouped[category]) incomeGrouped[category] = {};
        if (!incomeGrouped[category][ledger])
          incomeGrouped[category][ledger] = 0;

        incomeGrouped[category][ledger] += amount;
      } else {
        if (!expenseGrouped[category]) expenseGrouped[category] = {};
        if (!expenseGrouped[category][ledger])
          expenseGrouped[category][ledger] = 0;

        expenseGrouped[category][ledger] += amount;
      }
    });
  });
}

/* ================================
   JSON REPORT
================================ */

exports.getIncomeExpenditureReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate)
      return res.status(400).json({ message: "Date range required" });

    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    const receipts = await Receipt.find({
      receiptDate: { $gte: from, $lte: to },
      receiptReturned: false,
    }).lean();

    const expenses = await ChurchExpense.find({
      date: { $gte: from, $lte: to },
      expenseReturned: false,
    }).lean();

    const journals = await Journal.find({
      date: { $gte: from, $lte: to },
    }).lean();

    const ledgerCategories = await LedgerCategory.find().lean();

    const ledgerCodeCategoryMap = {};
    ledgerCategories.forEach((cat) => {
      (cat.ledgers || []).forEach((ledger) => {
        ledgerCodeCategoryMap[ledger.code] = cat.name;
      });
    });

    const incomeGrouped = groupReceipts(receipts);
    const expenseGrouped = groupExpenses(expenses);

    mergeJournalsIntoGroups(
      incomeGrouped,
      expenseGrouped,
      journals,
      ledgerCodeCategoryMap
    );

    delete expenseGrouped["Bank A/C"];
    delete expenseGrouped["Cash A/C"];
    delete expenseGrouped["Loans & Advances"];
    delete expenseGrouped["Plants & Equipments"];
    delete incomeGrouped["TDS - Payable"];
    delete incomeGrouped["Loans & Advances"];
    delete incomeGrouped["Earmarked Funds"];

    let incomeTotal = 0;
    Object.values(incomeGrouped).forEach((cat) =>
      Object.values(cat).forEach((v) => (incomeTotal += Number(v || 0))),
    );

    let expenseTotal = 0;
    Object.values(expenseGrouped).forEach((cat) =>
      Object.values(cat).forEach((v) => (expenseTotal += Number(v || 0)))
    );

    const surplus = incomeTotal - expenseTotal;

    res.status(200).json({
      statement: {
        income: incomeGrouped,
        expenditure: expenseGrouped,
      },
      totals: {
        incomeTotal,
        expenseTotal,
        surplus,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

/* ================================
   DOWNLOAD
================================ */

exports.downloadIncomeExpenditureReport =
  exports.getIncomeExpenditureReport;

module.exports = exports;