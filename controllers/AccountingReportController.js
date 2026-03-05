const Receipt = require("../Schema/ReceiptSchema");
const ChurchExpense = require("../Schema/ChurchExpenseSchema");
const Bank = require("../Schema/bankSchema");
const CashAccount = require("../Schema/CashAccountSchema");
const Journal = require("../Schema/JournalSchema");
const LedgerCategory = require("../Schema/LedgerCategory");

/* =========================================================
   RECEIPT SIDE TOTAL (STEP 1)
========================================================= */

//only grand total
// exports.getReceiptSideSummary = async (req, res) => {
//   try {
//     const { fromDate, toDate } = req.query;

//     if (!fromDate || !toDate) {
//       return res.status(400).json({
//         message: "fromDate and toDate required",
//       });
//     }

//     const from = new Date(fromDate);
//     const to = new Date(toDate);
//     to.setHours(23, 59, 59, 999);

//     /* ================= OPENING BALANCE ================= */

//     const banks = await Bank.find({ status: "Active" });
//     const cashAccounts = await CashAccount.find();

//     const openingBankTotal = banks.reduce(
//       (sum, b) => sum + (b.opening_balance || 0),
//       0
//     );

//     const openingCashTotal = cashAccounts.reduce(
//       (sum, c) => sum + (c.opening_balance || 0),
//       0
//     );

//     const openingTotal = openingBankTotal + openingCashTotal;

//     /* ================= RECEIPTS ================= */

//     const receipts = await Receipt.find({
//       receiptDate: { $gte: from, $lte: to },
//       receiptReturned: false,
//     });

//     let receiptTotal = 0;

//     receipts.forEach((r) => {
//       r.receiptLines.forEach((line) => {
//         receiptTotal += line.amount;
//       });
//     });

//     /* ================= JOURNAL (DEBIT SIDE) ================= */

//     const journals = await Journal.find({
//       date: { $gte: from, $lte: to },
//     });

//     let journalDebitTotal = 0;

//     journals.forEach((j) => {
//       if (j.accType === "Debit") {
//         journalDebitTotal += j.totalAmount;
//       }

//       j.entries.forEach((e) => {
//         if (e.type === "Debit") {
//           journalDebitTotal += e.amount;
//         }
//       });
//     });

//     /* ================= FINAL RECEIPT SIDE ================= */

//     const receiptSideTotal =
//       openingTotal + receiptTotal + journalDebitTotal;

//     return res.status(200).json({
//       openingCashTotal,
//       openingBankTotal,
//       openingTotal,
//       receiptTotal,
//       journalDebitTotal,
//       receiptSideTotal,
//     });
//   } catch (err) {
//     console.error("Receipt side error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

//with details in ledger wise grouping
exports.getReceiptSideSummary = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        message: "fromDate and toDate required",
      });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    /* ======================================================
       🔥 LOAD LEDGER CATEGORY MASTER (for incomeType)
    ====================================================== */

    const ledgerCategories = await LedgerCategory.find({
      accountType: "Income",
    });

    const ledgerToCategoryMap = {};
    const categoryIncomeTypeMap = {};

    ledgerCategories.forEach((cat) => {
      categoryIncomeTypeMap[cat.name] =
        cat.incomeType || "NON_ASSESSABLE";

      (cat.ledgers || []).forEach((l) => {
        ledgerToCategoryMap[l.name] = cat.name;
      });
    });

    /* ======================================================
       1. OPENING BALANCES — CASH
    ====================================================== */

    const cashAccounts = await CashAccount.find();

    const cashDetails = cashAccounts.map((c) => ({
      accountType: c.account_type,
      amount: c.opening_balance || 0,
    }));

    const openingCashTotal = cashDetails.reduce(
      (s, c) => s + c.amount,
      0
    );

    /* ======================================================
       2. OPENING BALANCES — BANK
    ====================================================== */

    const banks = await Bank.find({ status: "Active" });

    const bankDetails = banks.map((b) => ({
      bankName: b.bank_name,
      amount: b.opening_balance || 0,
    }));

    const openingBankTotal = bankDetails.reduce(
      (s, b) => s + b.amount,
      0
    );

    const openingTotal = openingCashTotal + openingBankTotal;

    /* ======================================================
       3. RECEIPTS GROUPING (WITH INCOME TYPE)
    ====================================================== */

    const receipts = await Receipt.find({
      receiptDate: { $gte: from, $lte: to },
      receiptReturned: false,
    });

    const groupedReceipts = {};
    let receiptTotal = 0;

    receipts.forEach((r) => {
      r.receiptLines.forEach((line) => {
        receiptTotal += line.amount;

        const accType = line.accountType || "Others";
        const ledgerName = line.ledgerName || "Others";

        // 🔥 resolve correct category from master
        const mainCategory =
          ledgerToCategoryMap[ledgerName] ||
          line.ledgerCategoryName ||
          "Others";

        // 🔥 get income type
        const incomeType =
          categoryIncomeTypeMap[mainCategory] ||
          "NON_ASSESSABLE";

        /* ===== ensure hierarchy ===== */

        // income type level
        if (!groupedReceipts[incomeType]) {
          groupedReceipts[incomeType] = {};
        }

        // account type level
        if (!groupedReceipts[incomeType][accType]) {
          groupedReceipts[incomeType][accType] = {};
        }

        // main category level
        if (
          !groupedReceipts[incomeType][accType][mainCategory]
        ) {
          groupedReceipts[incomeType][accType][mainCategory] = {
            total: 0,
            ledgers: {},
          };
        }

        // ledger level
        if (
          !groupedReceipts[incomeType][accType][mainCategory]
            .ledgers[ledgerName]
        ) {
          groupedReceipts[incomeType][accType][mainCategory]
            .ledgers[ledgerName] = 0;
        }

        groupedReceipts[incomeType][accType][mainCategory]
          .ledgers[ledgerName] += line.amount;

        groupedReceipts[incomeType][accType][mainCategory].total +=
          line.amount;
      });
    });

    /* ======================================================
       4. JOURNAL — DEBIT SIDE (MERGED PROPERLY)
    ====================================================== */

    const journals = await Journal.find({
      date: { $gte: from, $lte: to },
    });

    let journalDebitTotal = 0;

    journals.forEach((j) => {
      if (j.accType !== "Debit") return;

      const entry = j.entries?.[0];

      const accType = entry?.ledger?.accountType || "Journal";
      const ledgerName =
        entry?.ledger?.ledgerName || "Journal";

      const mainCategory =
        ledgerToCategoryMap[ledgerName] || "Journal";

      const incomeType =
        categoryIncomeTypeMap[mainCategory] ||
        "NON_ASSESSABLE";

      journalDebitTotal += j.totalAmount;

      /* ===== ensure hierarchy ===== */

      if (!groupedReceipts[incomeType]) {
        groupedReceipts[incomeType] = {};
      }

      if (!groupedReceipts[incomeType][accType]) {
        groupedReceipts[incomeType][accType] = {};
      }

      if (
        !groupedReceipts[incomeType][accType][mainCategory]
      ) {
        groupedReceipts[incomeType][accType][mainCategory] = {
          total: 0,
          ledgers: {},
        };
      }

      if (
        !groupedReceipts[incomeType][accType][mainCategory]
          .ledgers[ledgerName]
      ) {
        groupedReceipts[incomeType][accType][mainCategory]
          .ledgers[ledgerName] = 0;
      }

      groupedReceipts[incomeType][accType][mainCategory]
        .ledgers[ledgerName] += j.totalAmount;

      groupedReceipts[incomeType][accType][mainCategory].total +=
        j.totalAmount;
    });

    /* ======================================================
       5. FINAL TOTAL
    ====================================================== */

    const receiptSideTotal =
      openingTotal + receiptTotal + journalDebitTotal;

    /* ======================================================
       RESPONSE
    ====================================================== */

    return res.status(200).json({
      openingBalances: {
        cash: {
          details: cashDetails,
          total: openingCashTotal,
        },
        bank: {
          details: bankDetails,
          total: openingBankTotal,
        },
        openingTotal,
      },

      groupedReceipts,

      receiptTotal,
      journalDebitTotal,
      receiptSideTotal,
    });
  } catch (err) {
    console.error("Receipt side error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//only grand total 
// exports.getPaymentSideSummary = async (req, res) => {
//   try {
//     const { fromDate, toDate } = req.query;

//     if (!fromDate || !toDate) {
//       return res.status(400).json({
//         message: "fromDate and toDate required",
//       });
//     }

//     const from = new Date(fromDate);
//     const to = new Date(toDate);
//     to.setHours(23, 59, 59, 999);

//     /* ======================================================
//        1. OPENING BALANCES
//     ====================================================== */

//     const banks = await Bank.find({ status: "Active" });
//     const cashAccounts = await CashAccount.find();

//     const openingBankTotal = banks.reduce(
//       (s, b) => s + (b.opening_balance || 0),
//       0
//     );

//     const openingCashTotal = cashAccounts.reduce(
//       (s, c) => s + (c.opening_balance || 0),
//       0
//     );

//     /* ======================================================
//        2. RECEIPTS (classify cash vs bank)
//     ====================================================== */

//     const receipts = await Receipt.find({
//       receiptDate: { $gte: from, $lte: to },
//       receiptReturned: false,
//     });

//     let cashReceipts = 0;
//     let bankReceipts = 0;
//     let receiptTotal = 0;

//     receipts.forEach((r) => {
//       r.receiptLines.forEach((line) => {
//         receiptTotal += line.amount;

//         if (r.paymentMethod === "Cash") {
//           cashReceipts += line.amount;
//         } else {
//           bankReceipts += line.amount;
//         }
//       });
//     });

//     /* ======================================================
//        3. JOURNALS (split debit/credit properly)
//     ====================================================== */

//     const journals = await Journal.find({
//       date: { $gte: from, $lte: to },
//     });

//     let journalDebitTotal = 0;
//     let journalCreditTotal = 0;

//     let journalCashPayments = 0;
//     let journalBankPayments = 0;

//     journals.forEach((j) => {
//       // header effect
//       if (j.accType === "Debit") {
//         journalDebitTotal += j.totalAmount;
//       }
//       if (j.accType === "Credit") {
//         journalCreditTotal += j.totalAmount;
//         journalBankPayments += j.totalAmount; // assume bank hit
//       }

//       // entry effect
//       j.entries.forEach((e) => {
//         if (e.type === "Debit") {
//           journalDebitTotal += e.amount;
//         }

//         if (e.type === "Credit") {
//           journalCreditTotal += e.amount;
//           journalBankPayments += e.amount; // assume bank hit
//         }
//       });
//     });

//     /* ======================================================
//        4. EXPENSES (STRICT FILTER)
//     ====================================================== */

//     const expenses = await ChurchExpense.find({
//       date: { $gte: from, $lte: to },
//       expenseReturned: false,
//     });

//     let expenseTotal = 0;
//     let cashPayments = 0;
//     let bankPayments = 0;
//     let bankTransferTotal = 0;

//     // 🔥 NEW movement trackers
//     let cashToBankTransfer = 0;

//     expenses.forEach((exp) => {
//       exp.expenseLines.forEach((line) => {
//         // 🚨 CASH → BANK TRANSFER
//         if (line.ledgerCategoryName === "Bank A/C") {
//           bankTransferTotal += line.amount;

//           // 🔥 MOVE MONEY PROPERLY
//           if (exp.paymentMethod === "Cash") {
//             cashToBankTransfer += line.amount;
//           }

//           return;
//         }

//         // ✅ REAL EXPENSE
//         expenseTotal += line.amount;

//         if (exp.paymentMethod === "Cash") {
//           cashPayments += line.amount;
//         } else {
//           bankPayments += line.amount;
//         }
//       });
//     });

//     /* ======================================================
//        5. PAYMENT SIDE TOTAL
//     ====================================================== */

//     const paymentSideTotal = expenseTotal + journalCreditTotal;



//     /* ======================================================
//        6. TRUE CLOSING BALANCE (NO RATIO)
//     ====================================================== */

//     const closingCash =
//       openingCashTotal +
//       cashReceipts -
//       cashPayments -
//       cashToBankTransfer; // 🔥 IMPORTANT

//     const closingBank =
//       openingBankTotal +
//       bankReceipts -
//       bankPayments +
//       cashToBankTransfer; // 🔥 IMPORTANT

//     // ✅ remove floating garbage
//     const closingCashRounded = Number(closingCash.toFixed(2));
//     const closingBankRounded = Number(closingBank.toFixed(2));
//     const closingTotal = Number(
//       (closingCashRounded + closingBankRounded).toFixed(2)
//     );

//     /* ======================================================
//        7. RECEIPT SIDE TOTAL (reference)
//     ====================================================== */

//     const receiptSideTotal =
//       openingCashTotal +
//       openingBankTotal +
//       receiptTotal +
//       journalDebitTotal;

//     const paymentSideGrandTotal = Number(
//       (paymentSideTotal + closingTotal).toFixed(2)
//     );
//     /* ======================================================
//        RESPONSE
//     ====================================================== */

//     return res.status(200).json({
//       receiptSideTotal,
//       paymentSideGrandTotal,

//       expenseTotal,
//       journalCreditTotal,
//       bankTransferTotal,
//       paymentSideTotal,

//       cashReceipts,
//       bankReceipts,
//       cashPayments,
//       bankPayments,

//       closingCash: closingCashRounded,
//       closingBank: closingBankRounded,
//       closingTotal,
//     });
//   } catch (err) {
//     console.error("Payment side error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

//with details in ledger wise grouping
// exports.getPaymentSideSummary = async (req, res) => {
//   try {
//     const { fromDate, toDate } = req.query;

//     if (!fromDate || !toDate) {
//       return res.status(400).json({
//         message: "fromDate and toDate required",
//       });
//     }

//     const from = new Date(fromDate);
//     const to = new Date(toDate);
//     to.setHours(23, 59, 59, 999);

//     /* ======================================================
//        🔥 LOAD LEDGER CATEGORY MASTER
//     ====================================================== */

//     const ledgerCategories = await LedgerCategory.find();

//     const ledgerToCategoryMap = {};
//     const categoryIncomeTypeMap = {};

//     ledgerCategories.forEach((cat) => {
//       categoryIncomeTypeMap[cat.name] =
//         cat.incomeType || "NON_ASSESSABLE";

//       (cat.ledgers || []).forEach((l) => {
//         ledgerToCategoryMap[l.name] = cat.name;
//       });
//     });

//     /* ======================================================
//        1. OPENING BALANCES
//     ====================================================== */

//     const banks = await Bank.find({ status: "Active" });
//     const cashAccounts = await CashAccount.find();

//     const openingBankTotal = banks.reduce(
//       (s, b) => s + (b.opening_balance || 0),
//       0
//     );

//     const openingCashTotal = cashAccounts.reduce(
//       (s, c) => s + (c.opening_balance || 0),
//       0
//     );

//     /* ======================================================
//        2. RECEIPTS MOVEMENT (for closing only)
//     ====================================================== */

//     const receipts = await Receipt.find({
//       receiptDate: { $gte: from, $lte: to },
//       receiptReturned: false,
//     });

//     let cashReceipts = 0;
//     let bankReceipts = 0;
//     let receiptTotal = 0;

//     receipts.forEach((r) => {
//       r.receiptLines.forEach((line) => {
//         receiptTotal += line.amount;

//         if (r.paymentMethod === "Cash") {
//           cashReceipts += line.amount;
//         } else {
//           bankReceipts += line.amount;
//         }
//       });
//     });

//     /* ======================================================
//        3. JOURNALS — CREDIT SIDE (PAYMENTS)
//     ====================================================== */

//  /* ======================================================
//    3. JOURNALS — CREDIT SIDE (PAYMENTS) ✅ FIXED
// ====================================================== */

// const journals = await Journal.find({
//   date: { $gte: from, $lte: to },
// });

// let journalDebitTotal = 0;
// let journalCreditTotal = 0;

// const groupedPayments = {};

// journals.forEach((j) => {
//   /* ===== RECEIPT SIDE REFERENCE ===== */
//   if (j.accType === "Debit") {
//     journalDebitTotal += j.totalAmount;
//   }

//   /* ======================================================
//      ✅ HEADER CREDIT (VERY IMPORTANT)
//   ====================================================== */

//   if (j.accType === "Credit") {
//     journalCreditTotal += j.totalAmount;

//     const entry = j.entries?.[0];

//     const accType = entry?.ledger?.accountType || "Journal";
//     const ledgerName =
//       entry?.ledger?.ledgerName || "Journal";

//     const mainCategory =
//       ledgerToCategoryMap[ledgerName] || "Journal";

//     const incomeType =
//       categoryIncomeTypeMap[mainCategory] ||
//       "NON_ASSESSABLE";

//     // 🔥 grouping (same logic)
//     if (!groupedPayments[incomeType]) {
//       groupedPayments[incomeType] = {};
//     }

//     if (!groupedPayments[incomeType][accType]) {
//       groupedPayments[incomeType][accType] = {};
//     }

//     if (!groupedPayments[incomeType][accType][mainCategory]) {
//       groupedPayments[incomeType][accType][mainCategory] = {
//         total: 0,
//         ledgers: {},
//       };
//     }

//     if (
//       !groupedPayments[incomeType][accType][mainCategory]
//         .ledgers[ledgerName]
//     ) {
//       groupedPayments[incomeType][accType][mainCategory]
//         .ledgers[ledgerName] = 0;
//     }

//     groupedPayments[incomeType][accType][mainCategory]
//       .ledgers[ledgerName] += j.totalAmount;

//     groupedPayments[incomeType][accType][mainCategory].total +=
//       j.totalAmount;
//   }

//   /* ======================================================
//      ✅ ENTRY CREDIT (YOU WERE MISSING THIS)
//   ====================================================== */

//   j.entries?.forEach((e) => {
//     if (e.type !== "Credit") return;

//     journalCreditTotal += e.amount;

//     const accType = e.ledger?.accountType || "Journal";
//     const ledgerName =
//       e.ledger?.ledgerName || "Journal";

//     const mainCategory =
//       ledgerToCategoryMap[ledgerName] || "Journal";

//     const incomeType =
//       categoryIncomeTypeMap[mainCategory] ||
//       "NON_ASSESSABLE";

//     // 🔥 grouping
//     if (!groupedPayments[incomeType]) {
//       groupedPayments[incomeType] = {};
//     }

//     if (!groupedPayments[incomeType][accType]) {
//       groupedPayments[incomeType][accType] = {};
//     }

//     if (!groupedPayments[incomeType][accType][mainCategory]) {
//       groupedPayments[incomeType][accType][mainCategory] = {
//         total: 0,
//         ledgers: {},
//       };
//     }

//     if (
//       !groupedPayments[incomeType][accType][mainCategory]
//         .ledgers[ledgerName]
//     ) {
//       groupedPayments[incomeType][accType][mainCategory]
//         .ledgers[ledgerName] = 0;
//     }

//     groupedPayments[incomeType][accType][mainCategory]
//       .ledgers[ledgerName] += e.amount;

//     groupedPayments[incomeType][accType][mainCategory].total +=
//       e.amount;
//   });
// });

//     /* ======================================================
//        4. EXPENSES GROUPING
//     ====================================================== */

//     const expenses = await ChurchExpense.find({
//       date: { $gte: from, $lte: to },
//       expenseReturned: false,
//     });

//     let expenseTotal = 0;
//     let cashPayments = 0;
//     let bankPayments = 0;
//     let bankTransferTotal = 0;
//     let cashToBankTransfer = 0;

//     expenses.forEach((exp) => {
//       exp.expenseLines.forEach((line) => {
//         // 🚫 skip bank transfer
//         if (line.ledgerCategoryName === "Bank A/C") {
//           bankTransferTotal += line.amount;

//           if (exp.paymentMethod === "Cash") {
//             cashToBankTransfer += line.amount;
//           }
//           return;
//         }

//         expenseTotal += line.amount;

//         if (exp.paymentMethod === "Cash") {
//           cashPayments += line.amount;
//         } else {
//           bankPayments += line.amount;
//         }

//         // 🔥 grouping

//         const accType = line.accountType || "Expense";
//         const ledgerName = line.ledgerName || "Others";

//         const mainCategory =
//           ledgerToCategoryMap[ledgerName] ||
//           line.ledgerCategoryName ||
//           "Others";

//         const incomeType =
//           categoryIncomeTypeMap[mainCategory] ||
//           "NON_ASSESSABLE";

//         if (!groupedPayments[incomeType]) {
//           groupedPayments[incomeType] = {};
//         }

//         if (!groupedPayments[incomeType][accType]) {
//           groupedPayments[incomeType][accType] = {};
//         }

//         if (!groupedPayments[incomeType][accType][mainCategory]) {
//           groupedPayments[incomeType][accType][mainCategory] = {
//             total: 0,
//             ledgers: {},
//           };
//         }

//         if (
//           !groupedPayments[incomeType][accType][mainCategory]
//             .ledgers[ledgerName]
//         ) {
//           groupedPayments[incomeType][accType][mainCategory]
//             .ledgers[ledgerName] = 0;
//         }

//         groupedPayments[incomeType][accType][mainCategory]
//           .ledgers[ledgerName] += line.amount;

//         groupedPayments[incomeType][accType][mainCategory].total +=
//           line.amount;
//       });
//     });

//     /* ======================================================
//        5. TOTALS
//     ====================================================== */

//     const paymentSideTotal = expenseTotal + journalCreditTotal;

//     const closingCash =
//       openingCashTotal +
//       cashReceipts -
//       cashPayments -
//       cashToBankTransfer;

//     const closingBank =
//       openingBankTotal +
//       bankReceipts -
//       bankPayments +
//       cashToBankTransfer;

//     const closingCashRounded = Number(closingCash.toFixed(2));
//     const closingBankRounded = Number(closingBank.toFixed(2));
//     const closingTotal = Number(
//       (closingCashRounded + closingBankRounded).toFixed(2)
//     );

//     const receiptSideTotal =
//       openingCashTotal +
//       openingBankTotal +
//       receiptTotal +
//       journalDebitTotal;

//     const paymentSideGrandTotal = Number(
//       (paymentSideTotal + closingTotal).toFixed(2)
//     );

//     /* ======================================================
//        RESPONSE
//     ====================================================== */

//     return res.status(200).json({
//       receiptSideTotal,
//       paymentSideGrandTotal,

//       groupedPayments, // ⭐ NEW (like receipt side)

//       expenseTotal,
//       journalCreditTotal,
//       bankTransferTotal,
//       paymentSideTotal,

//       cashReceipts,
//       bankReceipts,
//       cashPayments,
//       bankPayments,

//       closingCash: closingCashRounded,
//       closingBank: closingBankRounded,
//       closingTotal,
//     });
//   } catch (err) {
//     console.error("Payment side error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


//proper closing balance code
exports.getPaymentSideSummary = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    if (!fromDate || !toDate) {
      return res.status(400).json({
        message: "fromDate and toDate required",
      });
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    /* ======================================================
       LOAD LEDGER CATEGORY MASTER
    ====================================================== */

    const ledgerCategories = await LedgerCategory.find();

    const ledgerToCategoryMap = {};
    const categoryIncomeTypeMap = {};

    ledgerCategories.forEach((cat) => {
      categoryIncomeTypeMap[cat.name] =
        cat.incomeType || "NON_ASSESSABLE";

      (cat.ledgers || []).forEach((l) => {
        ledgerToCategoryMap[l.name] = cat.name;
      });
    });

    /* ======================================================
       OPENING BALANCES
    ====================================================== */

    const banks = await Bank.find({ status: "Active" });
    const cashAccounts = await CashAccount.find();

    const openingBankTotal = banks.reduce(
      (s, b) => s + (b.opening_balance || 0),
      0
    );

    const openingCashTotal = cashAccounts.reduce(
      (s, c) => s + (c.opening_balance || 0),
      0
    );

    /* ======================================================
       RECEIPTS MOVEMENT
    ====================================================== */

    const receipts = await Receipt.find({
      receiptDate: { $gte: from, $lte: to },
      receiptReturned: false,
    });

    let cashReceipts = 0;
    let bankReceipts = 0;
    let receiptTotal = 0;

    receipts.forEach((r) => {
      r.receiptLines.forEach((line) => {
        receiptTotal += line.amount;

        if (r.paymentMethod === "Cash") {
          cashReceipts += line.amount;
        } else {
          bankReceipts += line.amount;
        }
      });
    });

    /* ======================================================
       JOURNALS — CREDIT SIDE (FIXED NO DOUBLE COUNT)
    ====================================================== */

    const journals = await Journal.find({
      date: { $gte: from, $lte: to },
    });

    let journalDebitTotal = 0;
    let journalCreditTotal = 0;

    const groupedPayments = {};

    journals.forEach((j) => {
      if (j.accType === "Debit") {
        journalDebitTotal += j.totalAmount;
      }

      // ✅ ONLY ENTRY CREDIT COUNTS (prevents double)
      j.entries?.forEach((e) => {
        if (e.type !== "Credit") return;

        journalCreditTotal += e.amount;

        const accType = e.ledger?.accountType || "Journal";
        const ledgerName = e.ledger?.ledgerName || "Journal";

        const mainCategory =
          ledgerToCategoryMap[ledgerName] || "Journal";

        const incomeType =
          categoryIncomeTypeMap[mainCategory] ||
          "NON_ASSESSABLE";

        if (!groupedPayments[incomeType]) groupedPayments[incomeType] = {};
        if (!groupedPayments[incomeType][accType])
          groupedPayments[incomeType][accType] = {};
        if (!groupedPayments[incomeType][accType][mainCategory]) {
          groupedPayments[incomeType][accType][mainCategory] = {
            total: 0,
            ledgers: {},
          };
        }

        if (
          !groupedPayments[incomeType][accType][mainCategory]
            .ledgers[ledgerName]
        ) {
          groupedPayments[incomeType][accType][mainCategory]
            .ledgers[ledgerName] = 0;
        }

        groupedPayments[incomeType][accType][mainCategory]
          .ledgers[ledgerName] += e.amount;

        groupedPayments[incomeType][accType][mainCategory].total +=
          e.amount;
      });
    });

    /* ======================================================
       EXPENSES
    ====================================================== */

    const expenses = await ChurchExpense.find({
      date: { $gte: from, $lte: to },
      expenseReturned: false,
    });

    let expenseTotal = 0;
    let cashPayments = 0;
    let bankPayments = 0;
    let bankTransferTotal = 0;
    let cashToBankTransfer = 0;

    expenses.forEach((exp) => {
      exp.expenseLines.forEach((line) => {
        // 🚫 INTERNAL TRANSFER
        if (line.ledgerCategoryName === "Bank A/C") {
          bankTransferTotal += line.amount;

          if (exp.paymentMethod === "Cash") {
            cashToBankTransfer += line.amount;
          }
          return;
        }

        expenseTotal += line.amount;

        if (exp.paymentMethod === "Cash") {
          cashPayments += line.amount;
        } else {
          bankPayments += line.amount;
        }

        // grouping
        const accType = line.accountType || "Expense";
        const ledgerName = line.ledgerName || "Others";

        const mainCategory =
          ledgerToCategoryMap[ledgerName] ||
          line.ledgerCategoryName ||
          "Others";

        const incomeType =
          categoryIncomeTypeMap[mainCategory] ||
          "NON_ASSESSABLE";

        if (!groupedPayments[incomeType]) groupedPayments[incomeType] = {};
        if (!groupedPayments[incomeType][accType])
          groupedPayments[incomeType][accType] = {};
        if (!groupedPayments[incomeType][accType][mainCategory]) {
          groupedPayments[incomeType][accType][mainCategory] = {
            total: 0,
            ledgers: {},
          };
        }

        if (
          !groupedPayments[incomeType][accType][mainCategory]
            .ledgers[ledgerName]
        ) {
          groupedPayments[incomeType][accType][mainCategory]
            .ledgers[ledgerName] = 0;
        }

        groupedPayments[incomeType][accType][mainCategory]
          .ledgers[ledgerName] += line.amount;

        groupedPayments[incomeType][accType][mainCategory].total +=
          line.amount;
      });
    });

    /* ======================================================
       TRUE CLOSING (DO NOT TOUCH)
    ====================================================== */

    const closingCash =
      openingCashTotal +
      cashReceipts -
      cashPayments -
      cashToBankTransfer;

    const closingBank =
      openingBankTotal +
      bankReceipts -
      bankPayments +
      cashToBankTransfer;

    const closingCashRounded = Number(closingCash.toFixed(2));
    const closingBankRounded = Number(closingBank.toFixed(2));
    const closingTotal = Number(
      (closingCashRounded + closingBankRounded).toFixed(2)
    );

    /* ======================================================
       ✅ PROPORTIONAL BREAKUP (CORRECT FOR YOUR DATA)
    ====================================================== */

    const cashClosingDetails = cashAccounts.map((c) => ({
      accountType: c.account_type,
      amount:
        openingCashTotal === 0
          ? 0
          : Number(
              (
                (c.opening_balance / openingCashTotal) *
                closingCashRounded
              ).toFixed(2)
            ),
    }));

    const bankClosingDetails = banks.map((b) => ({
      bankName: b.bank_name,
      amount:
        openingBankTotal === 0
          ? 0
          : Number(
              (
                (b.opening_balance / openingBankTotal) *
                closingBankRounded
              ).toFixed(2)
            ),
    }));

    /* ====================================================== */

    const paymentSideTotal = expenseTotal + journalCreditTotal;

    const receiptSideTotal =
      openingCashTotal +
      openingBankTotal +
      receiptTotal +
      journalDebitTotal;

    const paymentSideGrandTotal = Number(
      (paymentSideTotal + closingTotal).toFixed(2)
    );

    return res.status(200).json({
      receiptSideTotal,
      paymentSideGrandTotal,
      groupedPayments,

      closingBalance: {
        cash: {
          details: cashClosingDetails,
          total: closingCashRounded,
        },
        bank: {
          details: bankClosingDetails,
          total: closingBankRounded,
        },
        closingTotal,
      },

      expenseTotal,
      journalCreditTotal,
      bankTransferTotal,
      paymentSideTotal,

      cashReceipts,
      bankReceipts,
      cashPayments,
      bankPayments,

      closingCash: closingCashRounded,
      closingBank: closingBankRounded,
      closingTotal,
    });
  } catch (err) {
    console.error("Payment side error:", err);
    res.status(500).json({ message: "Server error" });
  }
};