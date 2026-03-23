// const LedgerCategory = require("../Schema/LedgerCategory");
// const ChurchExpense = require("../Schema/ChurchExpenseSchema");
// const Receipt = require("../Schema/ReceiptSchema");
// const Bank = require("../Schema/bankSchema");
// const HarvestAuction = require("../Schema/HarvestAuction");

// // 🔥 ACCOUNT ORDER
// const ACCOUNT_ORDER = [
//   "Capital A/c",
//   "Assets-Fixed Assets",
//   "Assets-Current Assets",
//   "Assets-Investments & Deposits",
//   "Liabilities-Current Liabilities and Provisions",
//   "Liabilities-Funds",
//   "Income",
//   "Expense"
// ];

// exports.getTrialBalance = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     const start = startDate ? new Date(startDate) : null;
//     const end = endDate ? new Date(endDate) : null;
//     if (end) end.setHours(23, 59, 59, 999);

//     // ===============================
//     // 1️⃣ LOAD MASTER
//     // ===============================
//     const categories = await LedgerCategory.find().lean();
//     const banks = await Bank.find().lean();

//     const bankMap = {};
//     banks.forEach(b => {
//       bankMap[b._id.toString()] = b.ledger_code;
//     });

//     const ledgerMap = {};

//     categories.forEach(cat => {
//       (cat.ledgers || []).forEach(l => {
//         ledgerMap[l.code] = {
//           ledgerCode: l.code,
//           description: l.name,
//           categoryName: cat.name,
//           accountType: cat.accountType,
//           openingBalance: Number(l.depreciationValue || 0),
//           drAmount: 0,
//           crAmount: 0,
//         };
//       });
//     });

//     // ===============================
//     // 🔥 PERSONAL LEDGER MAP
//     // ===============================
//     const personalLedgerMap = {};

//     const ensurePersonal = (id, name) => {
//       if (!personalLedgerMap[id]) {
//         personalLedgerMap[id] = {
//           ledgerCode: id,
//           description: `${id} - ${name}`,
//           categoryName: "Personal A/cs",
//           accountType: "Liabilities-Current Liabilities and Provisions",
//           openingBalance: 0,
//           drAmount: 0,
//           crAmount: 0,
//         };
//       }
//     };

//     // ===============================
//     // 2️⃣ OPENING (AUCTION ONLY)
//     // ===============================
//     if (start) {
//       const openingAuctions = await HarvestAuction.find({
//         date: { $lt: start }
//       }).lean();

//       openingAuctions.forEach(a => {
//         if (!a.buyerId) return;

//         ensurePersonal(a.buyerId, a.buyerName);

//         // ✅ ONLY BALANCE (NOT AMOUNT)
//         personalLedgerMap[a.buyerId].openingBalance += Number(a.balance || 0);
//       });
//     }

//     // ===============================
//     // 3️⃣ CURRENT DATA
//     // ===============================
//     const receipts = await Receipt.find({
//       receiptDate: { $gte: start, $lte: end },
//       receiptReturned: false
//     }).lean();

//     const expenses = await ChurchExpense.find({
//       date: { $gte: start, $lte: end },
//       expenseReturned: false
//     }).lean();

//     // ===============================
//     // 🔥 PERSONAL CR (PAYMENTS)
//     // ===============================
//     receipts.forEach(rec => {
//       (rec.receiptLines || []).forEach(line => {
//         if (
//           line.ledgerCategoryName === "Loans & Advances" &&
//           line.isMember &&
//           line.memberId
//         ) {
//           ensurePersonal(line.memberId, line.memberName);

//           personalLedgerMap[line.memberId].crAmount += Number(line.amount || 0);
//         }
//       });
//     });

//     // ===============================
//     // 🔥 PERSONAL DR (NEW PURCHASES)
//     // ===============================
//     const currentAuctions = await HarvestAuction.find({
//       date: { $gte: start, $lte: end }
//     }).lean();

//     currentAuctions.forEach(a => {
//       if (!a.buyerId) return;

//       ensurePersonal(a.buyerId, a.buyerName);

//       // ✅ ONLY IF STILL UNPAID
//       if (a.balance > 0) {
//         personalLedgerMap[a.buyerId].drAmount += Number(a.amount || 0);
//       }
//     });

//     // ===============================
//     // ❌ REMOVE LOANS LEDGER
//     // ===============================
//     Object.keys(ledgerMap).forEach(code => {
//       if (ledgerMap[code].categoryName === "Loans & Advances") {
//         delete ledgerMap[code];
//       }
//     });

//     // ===============================
//     // 4️⃣ FINAL CALCULATION
//     // ===============================
//     const combined = [
//       ...Object.values(ledgerMap),
//       ...Object.values(personalLedgerMap)
//     ];

//     const result = combined.map(l => {
//       let closing;

//       // ✅ PERSONAL ACCOUNT FIX
//       if (l.categoryName === "Personal A/cs") {
//         closing = l.openingBalance + l.drAmount - l.crAmount;
//       }
//       // ✅ ASSETS
//       else if (l.accountType.startsWith("Assets")) {
//         closing = l.openingBalance + l.drAmount - l.crAmount;
//       }
//       // ✅ OTHERS
//       else {
//         closing = l.openingBalance + l.crAmount - l.drAmount;
//       }

//       return {
//         ...l,
//         closingBalance: Math.abs(closing),
//         balanceType: closing >= 0 ? "Dr" : "Cr",
//       };
//     }).filter(l =>
//       !(l.openingBalance === 0 &&
//         l.drAmount === 0 &&
//         l.crAmount === 0 &&
//         l.closingBalance === 0)
//     );

//     // ===============================
//     // 5️⃣ SORT
//     // ===============================
//     result.sort((a, b) => {
//       const accA = ACCOUNT_ORDER.indexOf(a.accountType);
//       const accB = ACCOUNT_ORDER.indexOf(b.accountType);

//       if (accA !== accB) return accA - accB;
//       return a.ledgerCode.localeCompare(b.ledgerCode);
//     });

//     // ===============================
//     // 6️⃣ GROUP
//     // ===============================
//     const grouped = {};

//     result.forEach(l => {
//       if (!grouped[l.categoryName]) grouped[l.categoryName] = [];
//       grouped[l.categoryName].push(l);
//     });

//     const sortedGrouped = {};

//     ACCOUNT_ORDER.forEach(type => {
//       Object.keys(grouped).forEach(cat => {
//         if (grouped[cat][0]?.accountType === type) {
//           sortedGrouped[cat] = grouped[cat];
//         }
//       });
//     });

//     res.json({ data: sortedGrouped });

//   } catch (err) {
//     console.error("Trial Balance Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// //not thinked chat
// const LedgerCategory = require("../Schema/LedgerCategory");
// const ChurchExpense = require("../Schema/ChurchExpenseSchema");
// const Receipt = require("../Schema/ReceiptSchema");
// const Bank = require("../Schema/bankSchema");
// const HarvestAuction = require("../Schema/HarvestAuction");

// const ACCOUNT_ORDER = [
//   "Capital A/c",
//   "Assets-Fixed Assets",
//   "Assets-Current Assets",
//   "Assets-Investments & Deposits",
//   "Liabilities-Current Liabilities and Provisions",
//   "Liabilities-Funds",
//   "Income",
//   "Expense"
// ];

// exports.getTrialBalance = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     const start = startDate ? new Date(startDate) : null;
//     const end = endDate ? new Date(endDate) : null;
//     if (end) end.setHours(23, 59, 59, 999);

//     // ===============================
//     // LOAD MASTER
//     // ===============================
//     const categories = await LedgerCategory.find().lean();
//     const banks = await Bank.find().lean();

//     const bankMap = {};
//     banks.forEach(b => {
//       bankMap[b._id.toString()] = b.ledger_code;
//     });

//     const ledgerMap = {};

//     categories.forEach(cat => {
//       (cat.ledgers || []).forEach(l => {
//         ledgerMap[l.code] = {
//           ledgerCode: l.code,
//           description: l.name,
//           categoryName: cat.name,
//           accountType: cat.accountType,
//           openingBalance: Number(l.depreciationValue || 0),
//           drAmount: 0,
//           crAmount: 0,
//         };
//       });
//     });

//     // ===============================
//     // PERSONAL MAP (GROUPED)
//     // ===============================
//     const personalLedgerMap = {};

//     const ensurePersonal = (ledgerName, memberId, memberName) => {
//       if (!personalLedgerMap[ledgerName]) {
//         personalLedgerMap[ledgerName] = {};
//       }

//       if (!personalLedgerMap[ledgerName][memberId]) {
//         personalLedgerMap[ledgerName][memberId] = {
//           ledgerCode: memberId,
//           description: `${memberId} - ${memberName}`,
//           categoryName: `Personal A/cs - ${ledgerName}`,
//           accountType: "Liabilities-Current Liabilities and Provisions",
//           openingBalance: 0,
//           drAmount: 0,
//           crAmount: 0,
//         };
//       }
//     };

//     // ===============================
//     // OPENING (BEFORE START DATE)
//     // ===============================
//     if (start) {
//       // RECEIPTS OPENING
//       const openingReceipts = await Receipt.find({
//         receiptDate: { $lt: start },
//         receiptReturned: false
//       }).lean();

//       openingReceipts.forEach(rec => {
//         (rec.receiptLines || []).forEach(line => {
//           if (ledgerMap[line.ledgerCode]) {
//             ledgerMap[line.ledgerCode].openingBalance += Number(line.amount || 0);
//           }

//           // PERSONAL OPENING (LOANS)
//           if (line.isMember && line.memberId && line.ledgerCategoryName === "Loans & Advances") {
//             ensurePersonal(line.ledgerName, line.memberId, line.memberName);
//             personalLedgerMap[line.ledgerName][line.memberId].openingBalance += Number(line.amount || 0);
//           }
//         });
//       });

//       // EXPENSE OPENING
//       const openingExpenses = await ChurchExpense.find({
//         date: { $lt: start },
//         expenseReturned: false
//       }).lean();

//       openingExpenses.forEach(exp => {
//         (exp.expenseLines || []).forEach(line => {
//           const ledger = ledgerMap[line.ledgerCode];
//           if (!ledger) return;

//           const amt = Number(line.amount || 0);

//           if (ledger.accountType.startsWith("Assets")) {
//             ledger.openingBalance += amt;
//           } else {
//             ledger.openingBalance -= amt;
//           }
//         });
//       });

//       // AUCTION OPENING
//       const openingAuctions = await HarvestAuction.find({
//         date: { $lt: start }
//       }).lean();

//       openingAuctions.forEach(a => {
//         if (!a.buyerId) return;

//         ensurePersonal("Auction Balance", a.buyerId, a.buyerName);
//         personalLedgerMap["Auction Balance"][a.buyerId].openingBalance += Number(a.balance || 0);
//       });
//     }

//     // ===============================
//     // CURRENT PERIOD
//     // ===============================
//     const receipts = await Receipt.find({
//       receiptDate: { $gte: start, $lte: end },
//       receiptReturned: false
//     }).lean();

//     const expenses = await ChurchExpense.find({
//       date: { $gte: start, $lte: end },
//       expenseReturned: false
//     }).lean();

//     // RECEIPTS
//     receipts.forEach(rec => {
//       (rec.receiptLines || []).forEach(line => {
//         if (ledgerMap[line.ledgerCode]) {
//           ledgerMap[line.ledgerCode].crAmount += Number(line.amount || 0);
//         }

//         if (line.isMember && line.memberId && line.ledgerCategoryName === "Loans & Advances") {
//           ensurePersonal(line.ledgerName, line.memberId, line.memberName);
//           personalLedgerMap[line.ledgerName][line.memberId].crAmount += Number(line.amount || 0);
//         }
//       });
//     });

//     // EXPENSES
//     expenses.forEach(exp => {
//       (exp.expenseLines || []).forEach(line => {
//         const ledger = ledgerMap[line.ledgerCode];
//         if (!ledger) return;

//         ledger.drAmount += Number(line.amount || 0);
//       });
//     });

//     // AUCTION DR
//     const currentAuctions = await HarvestAuction.find({
//       date: { $gte: start, $lte: end }
//     }).lean();

//     currentAuctions.forEach(a => {
//       if (!a.buyerId) return;

//       ensurePersonal("Auction Balance", a.buyerId, a.buyerName);

//       if (a.balance > 0) {
//         personalLedgerMap["Auction Balance"][a.buyerId].drAmount += Number(a.amount || 0);
//       }
//     });

//     // ===============================
//     // REMOVE LOANS LEDGER
//     // ===============================
//     Object.keys(ledgerMap).forEach(code => {
//       if (ledgerMap[code].categoryName === "Loans & Advances") {
//         delete ledgerMap[code];
//       }
//     });

//     // ===============================
//     // MERGE
//     // ===============================
//     const personalFlat = [];

//     Object.values(personalLedgerMap).forEach(group => {
//       Object.values(group).forEach(l => personalFlat.push(l));
//     });

//     const combined = [
//       ...Object.values(ledgerMap),
//       ...personalFlat
//     ];

//     // ===============================
//     // FINAL CALCULATION
//     // ===============================
//     const result = combined.map(l => {
//       let closing;

//       if (l.categoryName.startsWith("Personal A/cs")) {
//         closing = l.openingBalance + l.drAmount - l.crAmount;
//       }
//       else if (l.accountType.startsWith("Assets")) {
//         closing = l.openingBalance + l.drAmount - l.crAmount;
//       }
//       else {
//         closing = l.openingBalance + l.crAmount - l.drAmount;
//       }

//       return {
//         ...l,
//         closingBalance: Math.abs(closing),
//         balanceType: closing >= 0 ? "Dr" : "Cr",
//       };
//     });

//     // ===============================
//     // GROUP
//     // ===============================
//     const grouped = {};

//     result.forEach(l => {
//       if (!grouped[l.categoryName]) grouped[l.categoryName] = [];
//       grouped[l.categoryName].push(l);
//     });

//     res.json({ data: grouped });

//   } catch (err) {
//     console.error("Trial Balance Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

const LedgerCategory = require("../Schema/LedgerCategory");
const ChurchExpense = require("../Schema/ChurchExpenseSchema");
const Receipt = require("../Schema/ReceiptSchema");
const Bank = require("../Schema/bankSchema");
const HarvestAuction = require("../Schema/HarvestAuction");

const ACCOUNT_ORDER = [
  "Capital A/c",
  "Assets-Fixed Assets",
  "Assets-Current Assets",
  "Assets-Investments & Deposits",
  "Liabilities-Current Liabilities and Provisions",
  "Liabilities-Funds",
  "Income",
  "Expense"
];

const PERSONAL_ACCOUNT_TYPE = "Liabilities-Current Liabilities and Provisions";

function buildDateFilter(start, end, field) {
  const filter = {};
  if (start) filter.$gte = start;
  if (end) filter.$lte = end;
  return { [field]: filter };
}

function getPersonalGroupName(ledgerName) {
  return `Personal A/c - ${ledgerName || "Unknown"}`;
}

exports.getTrialBalance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);

    // ===============================
    // 1) LOAD MASTER
    // ===============================
    const categories = await LedgerCategory.find().lean();
    const banks = await Bank.find().lean();

    const bankMap = {};
    banks.forEach(b => {
      bankMap[b._id.toString()] = b.ledger_code;
    });

    const ledgerMap = {};

    categories.forEach(cat => {
      (cat.ledgers || []).forEach(l => {
        ledgerMap[l.code] = {
          ledgerCode: l.code,
          description: l.name,
          categoryName: cat.name,
          accountType: cat.accountType,
          openingBalance: Number(l.depreciationValue || 0),
          drAmount: 0,
          crAmount: 0,
        };
      });
    });

    // ===============================
    // 2) PERSONAL LEDGERS (GROUPED BY PERSONAL HEADER)
    // ===============================
    const personalLedgerMap = {};

    const ensurePersonal = (groupName, memberId, memberName) => {
      if (!personalLedgerMap[groupName]) {
        personalLedgerMap[groupName] = {};
      }

      if (!personalLedgerMap[groupName][memberId]) {
        personalLedgerMap[groupName][memberId] = {
          ledgerCode: memberId,
          description: `${memberId} - ${memberName || ""}`.trim(),
          categoryName: groupName,
          accountType: PERSONAL_ACCOUNT_TYPE,
          openingBalance: 0,
          drAmount: 0,
          crAmount: 0,
        };
      }
    };

    // ===============================
    // 3) CASH / PETTY CASH LEDGERS
    // ===============================
    const cashOnHandLedger = Object.values(ledgerMap).find(
      l => l.description === "Cash A/c" || l.description === "Cash on Hand A/c"
    );

    const pettyCashLedger = Object.values(ledgerMap).find(
      l => l.description === "Petty Cash A/c"
    );

    const applyCashEffect = (ledger, type, amount, isOpening = false) => {
      if (!ledger) return;

      if (isOpening) {
        if (type === "DR") ledger.openingBalance += amount;
        else ledger.openingBalance -= amount;
      } else {
        if (type === "DR") ledger.drAmount += amount;
        else ledger.crAmount += amount;
      }
    };

    // ===============================
    // 4) OPENING PERIOD DATA
    // ===============================
    if (start) {
      const openingReceiptFilter = buildDateFilter(null, start, "receiptDate");
      openingReceiptFilter.receiptDate.$lt = start;
      const openingReceipts = await Receipt.find({
        receiptDate: { $lt: start },
        receiptReturned: false
      }).lean();

      const openingExpenses = await ChurchExpense.find({
        date: { $lt: start },
        expenseReturned: false
      }).lean();

      // -------- RECEIPTS BEFORE START --------
      openingReceipts.forEach(rec => {
        (rec.receiptLines || []).forEach(line => {
          const amt = Number(line.amount || 0);

          const isPersonalLine =
            line.isMember &&
            line.memberId &&
            line.accountType === PERSONAL_ACCOUNT_TYPE;

          if (isPersonalLine) {
            const groupName = getPersonalGroupName(line.ledgerName);
            ensurePersonal(groupName, line.memberId, line.memberName);

            // Opening personal balance from earlier receipts (credit side)
            personalLedgerMap[groupName][line.memberId].openingBalance += amt;
            return;
          }

          if (ledgerMap[line.ledgerCode]) {
            ledgerMap[line.ledgerCode].openingBalance += amt;
          }
        });

        const amount = Number(rec.totalAmount || 0);

        if (rec.paymentMethod === "Cash") {
          applyCashEffect(cashOnHandLedger, "DR", amount, true);
        } else if (rec.bankId) {
          const code = bankMap[rec.bankId.toString()];
          if (ledgerMap[code]) ledgerMap[code].openingBalance += amount;
        }
      });

      // -------- EXPENSES BEFORE START --------
      openingExpenses.forEach(exp => {
        (exp.expenseLines || []).forEach(line => {
          const ledger = ledgerMap[line.ledgerCode];
          if (!ledger) return;

          const amt = Number(line.amount || 0);

          // Assets increase with debit side opening
          if (ledger.accountType.startsWith("Assets")) {
            ledger.openingBalance += amt;
          } else {
            ledger.openingBalance -= amt;
          }
        });

        const amount = Number(exp.totalAmount || 0);

        if (exp.paymentMethod === "Cash") {
          const target =
            exp.cashAccountType === "Petty Cash A/c"
              ? pettyCashLedger
              : cashOnHandLedger;

          applyCashEffect(target, "CR", amount, true);
        } else if (exp.bankId) {
          const code = bankMap[exp.bankId.toString()];
          if (ledgerMap[code]) ledgerMap[code].openingBalance -= amount;
        }
      });

      // -------- AUCTION OPENING (PERSONAL / AUCTION BALANCE) --------
      const openingAuctions = await HarvestAuction.find({
        date: { $lt: start }
      }).lean();

      openingAuctions.forEach(a => {
        if (!a.buyerId) return;

        const groupName = getPersonalGroupName("Auction Balance");
        ensurePersonal(groupName, a.buyerId, a.buyerName);

        // Opening is the unpaid balance
        personalLedgerMap[groupName][a.buyerId].openingBalance += Number(a.balance || 0);
      });
    }

    // ===============================
    // 5) CURRENT PERIOD DATA
    // ===============================
    const receiptFilter = {};
    if (start) receiptFilter.receiptDate = { ...(receiptFilter.receiptDate || {}), $gte: start };
    if (end) receiptFilter.receiptDate = { ...(receiptFilter.receiptDate || {}), $lte: end };

    const expenseFilter = {};
    if (start) expenseFilter.date = { ...(expenseFilter.date || {}), $gte: start };
    if (end) expenseFilter.date = { ...(expenseFilter.date || {}), $lte: end };

    const auctionFilter = {};
    if (start) auctionFilter.date = { ...(auctionFilter.date || {}), $gte: start };
    if (end) auctionFilter.date = { ...(auctionFilter.date || {}), $lte: end };

    const receipts = await Receipt.find({
      ...receiptFilter,
      receiptReturned: false
    }).lean();

    const expenses = await ChurchExpense.find({
      ...expenseFilter,
      expenseReturned: false
    }).lean();

    // -------- RECEIPTS CURRENT --------
    receipts.forEach(rec => {
      (rec.receiptLines || []).forEach(line => {
        const amt = Number(line.amount || 0);

        const isPersonalLine =
          line.isMember &&
          line.memberId &&
          line.accountType === PERSONAL_ACCOUNT_TYPE;

        // PERSONAL: group by ledger name, e.g. Personal A/c - Auction Balance / Rev Salary
        if (isPersonalLine) {
          const groupName = getPersonalGroupName(line.ledgerName);
          ensurePersonal(groupName, line.memberId, line.memberName);

          personalLedgerMap[groupName][line.memberId].crAmount += amt;
          return; // important: do not also post this into normal ledgerMap
        }

        // NORMAL LEDGER RECEIPT POSTING
        if (ledgerMap[line.ledgerCode]) {
          ledgerMap[line.ledgerCode].crAmount += amt;
        }
      });

      const amount = Number(rec.totalAmount || 0);

      if (rec.paymentMethod === "Cash") {
        applyCashEffect(cashOnHandLedger, "DR", amount);
      } else if (rec.bankId) {
        const code = bankMap[rec.bankId.toString()];
        if (ledgerMap[code]) ledgerMap[code].drAmount += amount;
      }
    });

    // -------- EXPENSES CURRENT --------
    expenses.forEach(exp => {
      (exp.expenseLines || []).forEach(line => {
        const ledger = ledgerMap[line.ledgerCode];
        if (!ledger) return;

        const amt = Number(line.amount || 0);
        ledger.drAmount += amt;
      });

      const amount = Number(exp.totalAmount || 0);

      if (exp.paymentMethod === "Cash") {
        const target =
          exp.cashAccountType === "Petty Cash A/c"
            ? pettyCashLedger
            : cashOnHandLedger;

        applyCashEffect(target, "CR", amount);
      } else if (exp.bankId) {
        const code = bankMap[exp.bankId.toString()];
        if (ledgerMap[code]) ledgerMap[code].crAmount += amount;
      }
    });

    // -------- AUCTION CURRENT --------
    const currentAuctions = await HarvestAuction.find({
      ...auctionFilter
    }).lean();

    currentAuctions.forEach(a => {
      if (!a.buyerId) return;

      const groupName = getPersonalGroupName("Auction Balance");
      ensurePersonal(groupName, a.buyerId, a.buyerName);

      // Only treat as DR if there is still outstanding balance
      if (Number(a.balance || 0) > 0) {
        personalLedgerMap[groupName][a.buyerId].drAmount += Number(a.amount || 0);
      }
    });

    // ===============================
    // 6) REMOVE LOANS & ADVANCES MASTER LEDGER
    // ===============================
    Object.keys(ledgerMap).forEach(code => {
      if (ledgerMap[code].categoryName === "Loans & Advances") {
        delete ledgerMap[code];
      }
    });

    // ===============================
    // 7) FLATTEN PERSONAL MAP
    // ===============================
    const personalFlat = [];
    Object.keys(personalLedgerMap).forEach(groupName => {
      Object.values(personalLedgerMap[groupName]).forEach(item => {
        personalFlat.push(item);
      });
    });

    // ===============================
    // 8) FINAL CALCULATION
    // ===============================
    const combined = [
      ...Object.values(ledgerMap),
      ...personalFlat
    ];

    const result = combined
      .map(l => {
        let closing;

        if (l.categoryName && l.categoryName.startsWith("Personal A/c -")) {
          // Personal accounts: Opening + DR - CR
          closing = l.openingBalance + l.drAmount - l.crAmount;
        } else if (l.accountType && l.accountType.startsWith("Assets")) {
          // Assets: Opening + DR - CR
          closing = l.openingBalance + l.drAmount - l.crAmount;
        } else {
          // Normal liabilities/income/expense
          closing = l.openingBalance + l.crAmount - l.drAmount;
        }

        return {
          ...l,
          closingBalance: Math.abs(closing),
          balanceType: closing >= 0 ? "Dr" : "Cr",
        };
      })
      .filter(l =>
        !(
          l.openingBalance === 0 &&
          l.drAmount === 0 &&
          l.crAmount === 0 &&
          l.closingBalance === 0
        )
      );

    // ===============================
    // 9) SORT
    // ===============================
    result.sort((a, b) => {
      const accA = ACCOUNT_ORDER.indexOf(a.accountType);
      const accB = ACCOUNT_ORDER.indexOf(b.accountType);

      if (accA !== accB) return accA - accB;

      if (a.categoryName !== b.categoryName) {
        return String(a.categoryName).localeCompare(String(b.categoryName));
      }

      return String(a.ledgerCode).localeCompare(String(b.ledgerCode));
    });

    // ===============================
    // 10) GROUP
    // ===============================
    const grouped = {};

    result.forEach(l => {
      if (!grouped[l.categoryName]) grouped[l.categoryName] = [];
      grouped[l.categoryName].push(l);
    });

    const sortedGrouped = {};

    ACCOUNT_ORDER.forEach(type => {
      Object.keys(grouped).forEach(cat => {
        if (grouped[cat][0]?.accountType === type) {
          sortedGrouped[cat] = grouped[cat];
        }
      });
    });

    // Personal groups are liabilities, so they will appear under the liabilities section
    // in the order they were encountered.
    Object.keys(grouped).forEach(cat => {
      if (!sortedGrouped[cat]) {
        sortedGrouped[cat] = grouped[cat];
      }
    });

    return res.json({ data: sortedGrouped });
  } catch (err) {
    console.error("Trial Balance Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};