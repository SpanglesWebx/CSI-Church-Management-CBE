// helpers/balanceHelper.js

const Receipt = require("../Schema/ReceiptSchema");
const ChurchExpense = require("../Schema/ChurchExpenseSchema");
const Journal = require("../Schema/JournalSchema");
const Bank = require("../Schema/bankSchema");
const CashAccount = require("../Schema/CashAccountSchema");

/**
 * Same internal-transfer detection used in controller.
 */
function isInternalTransfer(expenseDoc, expenseLine) {
  if (!expenseDoc || !expenseLine) return false;

  const paymentMethod = (expenseDoc.paymentMethod || "").toString().toLowerCase();
  const ledgerCategoryName = (expenseLine.ledgerCategoryName || "").toString().toLowerCase();
  const ledgerName = (expenseLine.ledgerName || "").toString().toLowerCase();
  const ledgerCode = (expenseLine.ledgerCode || "").toString().toLowerCase();

  if (paymentMethod !== "cash") return false;

  const isBankCategory = ledgerCategoryName === "bank a/c";
  const ledgerLooksLikeBank = ledgerName.includes("bank") || ledgerName.includes("a/c");
  const ledgerCodeLooksLikeBank = ledgerCode.includes("bank");

  return isBankCategory || ledgerLooksLikeBank || ledgerCodeLooksLikeBank;
}

/**
 * Calculate Opening Balance as of given date
 * @param {Date} fromDate
 * @returns {Object} opening balance breakdown
 */
exports.calculateOpeningBalance = async (fromDate) => {
  try {
    if (!fromDate) throw new Error("fromDate is required");

    const date = new Date(fromDate);
    date.setHours(0, 0, 0, 0);

    /* ========== initial master openings ========== */
    const banks = await Bank.find({ status: "Active" }).lean();
    const cashAccounts = await CashAccount.find().lean();

    const initialOpeningBank = (banks || []).reduce((sum, b) => sum + (Number(b.opening_balance) || 0), 0);
    const initialOpeningCash = (cashAccounts || []).reduce((sum, c) => sum + (Number(c.opening_balance) || 0), 0);

    /* ========== receipts BEFORE date ========== */
    const receipts = await Receipt.find({
      receiptDate: { $lt: date },
      receiptReturned: false,
    }).lean();

    let cashReceiptsBefore = 0;
    let bankReceiptsBefore = 0;

    (receipts || []).forEach((r) => {
      (r.receiptLines || []).forEach((line) => {
        const amt = Number(line.amount || 0);
        if ((r.paymentMethod || "").toString().toLowerCase() === "cash") {
          cashReceiptsBefore += amt;
        } else {
          bankReceiptsBefore += amt;
        }
      });
    });

    /* ========== expenses BEFORE date ========== */
    const expenses = await ChurchExpense.find({
      date: { $lt: date },
      expenseReturned: false,
    }).lean();

    let cashPaymentsBefore = 0;
    let bankPaymentsBefore = 0;
    let cashToBankTransferBefore = 0;

    (expenses || []).forEach((exp) => {
      (exp.expenseLines || []).forEach((line) => {
        const amt = Number(line.amount || 0);

        if (isInternalTransfer(exp, line)) {
          // only when exp.paymentMethod === 'Cash'
          cashToBankTransferBefore += amt;
          return;
        }

        if ((exp.paymentMethod || "").toString().toLowerCase() === "cash") {
          cashPaymentsBefore += amt;
        } else {
          bankPaymentsBefore += amt;
        }
      });
    });

    /* ========== journals BEFORE date ========== */
    const journals = await Journal.find({ date: { $lt: date } }).lean();

    let journalDebitBefore = 0;
    let journalCreditBefore = 0;

    (journals || []).forEach((j) => {
      (j.entries || []).forEach((e) => {
        if (e.type === "Debit") journalDebitBefore += Number(e.amount || 0);
        if (e.type === "Credit") journalCreditBefore += Number(e.amount || 0);
      });
    });

    /* ========== compute openings ========== */
    const openingCash =
      initialOpeningCash +
      cashReceiptsBefore +
      journalDebitBefore -
      cashPaymentsBefore -
      journalCreditBefore -
      cashToBankTransferBefore;

    const openingBank =
      initialOpeningBank +
      bankReceiptsBefore -
      bankPaymentsBefore +
      cashToBankTransferBefore;

    const openingCashRounded = Number(openingCash.toFixed(2));
    const openingBankRounded = Number(openingBank.toFixed(2));
    const openingTotal = Number((openingCashRounded + openingBankRounded).toFixed(2));

    return {
      cash: { total: openingCashRounded },
      bank: { total: openingBankRounded },
      openingTotal,
      movementBreakdown: {
        cashReceiptsBefore,
        bankReceiptsBefore,
        cashPaymentsBefore,
        bankPaymentsBefore,
        cashToBankTransferBefore,
        journalDebitBefore,
        journalCreditBefore,
      },
    };
  } catch (err) {
    console.error("Opening balance calculation error:", err);
    throw err;
  }
};