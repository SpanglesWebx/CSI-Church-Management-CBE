// controllers/reportsController.js
const PDFDocument = require("pdfkit");
const Receipt = require("../Schema/ReceiptSchema");
const ChurchExpense = require("../Schema/ChurchExpenseSchema");
const Journal = require("../Schema/JournalSchema");
const Bank = require("../Schema/bankSchema");
const CashAccount = require("../Schema/CashAccountSchema");
const LedgerCategory = require("../Schema/LedgerCategory");

async function calculateBalanceAsOf(dateInput) {
  const date = new Date(dateInput);
  date.setHours(23, 59, 59, 999);

  const banks = await Bank.find({ status: "Active" }).lean();
  const cashAccounts = await CashAccount.find().lean();

  const bankBalances = {};
  const cashBalances = {};

  // initialize with opening balances (key banks by _id string)
  banks.forEach((b) => {
    bankBalances[b._id.toString()] = Number(b.opening_balance || 0);
  });

  // cash accounts keyed by account_type string (e.g. "Cash on Hand A/c")
  cashAccounts.forEach((c) => {
    cashBalances[c.account_type] = Number(c.opening_balance || 0);
  });

  // ---------- RECEIPTS (<= date) ----------
  const receipts = await Receipt.find({
    receiptDate: { $lte: date },
    receiptReturned: false,
  }).lean();

  receipts.forEach((r) => {
    const amount = Number(r.totalAmount || 0);

    // cash increases petty/cash on hand
    if (r.paymentMethod && r.paymentMethod.toLowerCase().includes("cash")) {
      cashBalances["Cash on Hand A/c"] =
        (cashBalances["Cash on Hand A/c"] || 0) + amount;
    }

    // UPI/Bank/cheque increases bank
    // if bankId is present, use bank._id key; otherwise try bankName mapping later
    if (
      r.paymentMethod &&
      (r.paymentMethod.toLowerCase().includes("upi") ||
        r.paymentMethod.toLowerCase().includes("bank") ||
        r.paymentMethod.toLowerCase().includes("cheque") ||
        r.bankId)
    ) {
      if (r.bankId) {
        const id = r.bankId.toString();
        bankBalances[id] = (bankBalances[id] || 0) + amount;
      } else if (r.bankName) {
        // when bankId missing, push into key using bankName (will be resolved on presentation)
        bankBalances[r.bankName] = (bankBalances[r.bankName] || 0) + amount;
      }
    }
  });

  // ---------- PAYMENTS (<= date) ----------
  const expenses = await ChurchExpense.find({
    date: { $lte: date },
    expenseReturned: false,
  }).lean();

  expenses.forEach((exp) => {
    const amount = Number(exp.totalAmount || 0);

    // Cash payment reduces the specified cash account
    if (exp.paymentMethod && exp.paymentMethod.toLowerCase().includes("cash")) {
      const acc = exp.cashAccountType || "Cash on Hand A/c";
      cashBalances[acc] = (cashBalances[acc] || 0) - amount;
    }

    // Cheque (or UPI) reduces the bank from which payment was made
    if (
      exp.paymentMethod &&
      (exp.paymentMethod === "Cheque" ||
        exp.paymentMethod === "UPI" ||
        exp.paymentMethod.toLowerCase().includes("upi") ||
        exp.paymentMethod.toLowerCase().includes("bank"))
    ) {
      if (exp.bankId) {
        const id = exp.bankId.toString();
        bankBalances[id] = (bankBalances[id] || 0) - amount;
      } else if (exp.bankName) {
        bankBalances[exp.bankName] = (bankBalances[exp.bankName] || 0) - amount;
      }
    }

    (exp.expenseLines || []).forEach((line) => {

      // 🔹 Cash -> Bank (deposit)
      if (line.ledgerCategoryName === "Bank A/C") {

        const bank = banks.find((b) => b.ledger_code === line.ledgerCode);

        if (bank) {
          bankBalances[bank._id.toString()] =
            (bankBalances[bank._id.toString()] || 0) + Number(line.amount || 0);
        } else {
          const key = line.ledgerName || line.ledgerCode || "Bank (unknown)";
          bankBalances[key] = (bankBalances[key] || 0) + Number(line.amount || 0);
        }
      }

      // 🔹 Bank -> Cash (petty cash refill)
      if (line.ledgerCategoryName === "Cash A/C") {

        const cashAccountName = line.ledgerName;  // "Petty Cash A/c"

        cashBalances[cashAccountName] =
          (cashBalances[cashAccountName] || 0) + Number(line.amount || 0);
      }

    });
  });

  // NOTE: Journals intentionally do not update cash/bank here.

  const totalCash = Object.values(cashBalances).reduce((a, b) => a + (Number(b) || 0), 0);
  const totalBank = Object.values(bankBalances).reduce((a, b) => a + (Number(b) || 0), 0);

  return {
    cashBalances,
    bankBalances,
    totalCash,
    totalBank,
    grandTotal: totalCash + totalBank,
  };
}

function groupReceipts(receipts) {
  const grouped = {}; // { category: { ledgerName: amount } }

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
  receiptGrouped,
  expenseGrouped,
  journals,
  ledgerCodeCategoryMap = {}
) {

  journals.forEach((j) => {
    if (j.headerLedger?.ledgerCode === "I0018") {
      return;
    }

    if (j.headerLedger) {

      const ledgerName = (j.headerLedger.ledgerName || "Unknown").trim();
      const ledgerCode = j.headerLedger.ledgerCode;

      // 🔥 Get correct category from ledger master
      const category =
        ledgerCodeCategoryMap[ledgerCode] || "Others";

      const amount = Number(j.totalAmount || 0);

      if (!expenseGrouped[category]) {
        expenseGrouped[category] = {};
      }

      if (!expenseGrouped[category][ledgerName]) {
        expenseGrouped[category][ledgerName] = 0;
      }

      expenseGrouped[category][ledgerName] += amount;
    }

    // ENTRY LEDGERS
    (j.entries || []).forEach((entry) => {

      const category = (entry.ledger?.categoryName || "Others").trim();
      const ledger = (entry.ledger?.ledgerName || "Unknown").trim();
      const amount = Number(entry.amount || 0);

      // decide whether it belongs to receipt side or payment side
      if (entry.type === "Credit") {
        // liabilities / income side
        if (!receiptGrouped[category]) receiptGrouped[category] = {};
        if (!receiptGrouped[category][ledger]) receiptGrouped[category][ledger] = 0;

        receiptGrouped[category][ledger] += amount;

      } else {
        // debit side
        if (!expenseGrouped[category]) expenseGrouped[category] = {};
        if (!expenseGrouped[category][ledger]) expenseGrouped[category] = 0;

        expenseGrouped[category][ledger] += amount;
      }
    });

  });
}

function balancesToDetails(balanceMap = {}, banksList = []) {
  const details = [];

  Object.entries(balanceMap || {}).forEach(([key, amount]) => {
    let label = key;
    // if key looks like a MongoDB ObjectId (24 hex chars) try to find in banksList
    if (/^[0-9a-fA-F]{24}$/.test(key)) {
      const b = banksList.find((bb) => bb._id.toString() === key);
      if (b) label = b.ledger_name || b.bank_name || b.bankName || label;
    }
    details.push({ name: label, amount: Number(amount || 0) });
  });

  // sort by name for stable output
  details.sort((a, b) => a.name.localeCompare(b.name));
  return details;
}

exports.getReceiptsPaymentsReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({ message: "fromDate and toDate required" });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    // Opening = previous day closing
    const prevDate = new Date(from);
    prevDate.setDate(prevDate.getDate() - 1);

    const opening = await calculateBalanceAsOf(prevDate);
    const closing = await calculateBalanceAsOf(to);

    const receipts = await Receipt.find({
      receiptDate: { $gte: from, $lte: to },
      receiptReturned: false,
    })
      .sort({ receiptDate: 1 })
      .lean();

    const expenses = await ChurchExpense.find({
      date: { $gte: from, $lte: to },
      expenseReturned: false,
    })
      .sort({ date: 1 })
      .lean();

    const journals = await Journal.find({
      date: { $gte: from, $lte: to },
    })
      .sort({ date: 1 })
      .lean();

    // 🔥 Build Ledger Code → Category Map
    const ledgerCategories = await LedgerCategory.find().lean();

    const ledgerCodeCategoryMap = {};

    ledgerCategories.forEach((cat) => {
      (cat.ledgers || []).forEach((ledger) => {
        ledgerCodeCategoryMap[ledger.code] = cat.name;
      });
    });

    // produce grouped structures for UI
    const receiptGrouped = groupReceipts(receipts); // {category: {ledger: amount}}
    const expenseGrouped = groupExpenses(expenses);
    mergeJournalsIntoGroups(
      receiptGrouped,
      expenseGrouped,
      journals,
      ledgerCodeCategoryMap
    );
    // 🔥 Remove internal transfer categories from Payments side
    delete expenseGrouped["Bank A/C"];
    delete expenseGrouped["Cash A/C"];

    // prepare opening/closing balance details (resolve bank id -> name)
    const banksList = await Bank.find().lean();
    const openingCashDetails = balancesToDetails(opening.cashBalances, banksList);
    const openingBankDetails = balancesToDetails(opening.bankBalances, banksList);
    const closingCashDetails = balancesToDetails(closing.cashBalances, banksList);
    const closingBankDetails = balancesToDetails(closing.bankBalances, banksList);

    res.status(200).json({
      opening: {
        cash: { details: openingCashDetails, total: Number(opening.totalCash || 0) },
        bank: { details: openingBankDetails, total: Number(opening.totalBank || 0) },
        grandTotal: Number(opening.grandTotal || 0),
      },
      receipts: receipts, // keep raw receipts (if UI wants transaction view)
      expenses: expenses, // raw expenses (UI view)
      journals: journals, // raw journals (UI view)
      // grouped structures for the statement view
      statement: {
        receipts: receiptGrouped,
        payments: expenseGrouped,
      },
      closing: {
        cash: { details: closingCashDetails, total: Number(closing.totalCash || 0) },
        bank: { details: closingBankDetails, total: Number(closing.totalBank || 0) },
        grandTotal: Number(closing.grandTotal || 0),
      },
    });
  } catch (err) {
    console.error("Report error:", err);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

exports.downloadReceiptsPaymentsReport = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({ message: "Date range required" });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    const prevDate = new Date(from);
    prevDate.setDate(prevDate.getDate() - 1);

    const opening = await calculateBalanceAsOf(prevDate);
    const closing = await calculateBalanceAsOf(to);

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
    // 🔥 Build Ledger Code → Category Map
    const ledgerCategories = await LedgerCategory.find().lean();

    const ledgerCodeCategoryMap = {};

    ledgerCategories.forEach((cat) => {
      (cat.ledgers || []).forEach((ledger) => {
        ledgerCodeCategoryMap[ledger.code] = cat.name;
      });
    });

    const receiptGrouped = groupReceipts(receipts);
    const expenseGrouped = groupExpenses(expenses);
    mergeJournalsIntoGroups(
      receiptGrouped,
      expenseGrouped,
      journals,
      ledgerCodeCategoryMap
    );
    // 🔥 Remove internal transfer categories from Payments side
    delete expenseGrouped["Bank A/C"];
    delete expenseGrouped["Cash A/C"];

    // totals
    let receiptsTotal = 0;
    Object.values(receiptGrouped).forEach(cat =>
      Object.values(cat).forEach(v => receiptsTotal += Number(v || 0))
    );

    let paymentsTotal = 0;
    Object.values(expenseGrouped).forEach(cat =>
      Object.values(cat).forEach(v => paymentsTotal += Number(v || 0))
    );

    const openingTotal = Number(opening.totalCash || 0) + Number(opening.totalBank || 0);
    const closingTotal = Number(closing.totalCash || 0) + Number(closing.totalBank || 0);

    receiptsTotal += openingTotal;
    paymentsTotal += closingTotal;

    const banksList = await Bank.find().lean();

    function resolveBankNames(balanceMap) {
      const resolved = {};

      Object.entries(balanceMap).forEach(([key, amount]) => {

        const bank = banksList.find(
          (b) => b._id.toString() === key
        );

        if (bank) {
          resolved[bank.ledger_name || bank.bank_name || bank.bankName] = amount;
        } else {
          resolved[key] = amount;
        }
      });

      return resolved;
    }

    return res.status(200).json({
      opening: {
        ...opening,
        bankBalances: resolveBankNames(opening.bankBalances)
      },
      closing: {
        ...closing,
        bankBalances: resolveBankNames(closing.bankBalances)
      },
      statement: {
        receipts: receiptGrouped,
        payments: expenseGrouped,
      },
      totals: {
        receiptsTotal,
        paymentsTotal,
        openingTotal,
        closingTotal,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to prepare download data" });
  }
};

module.exports = exports;