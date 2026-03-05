const Receipt = require("../Schema/ReceiptSchema");
const ChurchExpense = require("../Schema/ChurchExpenseSchema");
const Bank = require("../Schema/bankSchema");
const CashAccount = require("../Schema/CashAccountSchema");

/**
 * Calculate balances as of a specific date (historical)
 * @param {Date} asOfDate
 */
exports.calculateBalanceAsOf = async (asOfDate) => {
  if (!asOfDate) throw new Error("Date is required");

  const date = new Date(asOfDate);
  date.setHours(23, 59, 59, 999);

  /* ======================================================
     1️⃣ MASTER OPENING BALANCES
  ====================================================== */

  const banks = await Bank.find({ status: "Active" }).lean();
  const cashAccounts = await CashAccount.find().lean();

  const bankBalances = {};
  const cashBalances = {};

  banks.forEach((b) => {
    bankBalances[b._id] = b.opening_balance || 0;
  });

  cashAccounts.forEach((c) => {
    cashBalances[c.account_type] = c.opening_balance || 0;
  });

  /* ======================================================
     2️⃣ APPLY RECEIPTS UNTIL DATE
  ====================================================== */

  const receipts = await Receipt.find({
    receiptDate: { $lte: date },
    receiptReturned: false,
  }).lean();

  receipts.forEach((r) => {
    const amount = Number(r.totalAmount);

    if (r.paymentMethod === "Cash") {
      cashBalances["Cash on Hand A/c"] =
        (cashBalances["Cash on Hand A/c"] || 0) + amount;
    }

    if (r.paymentMethod === "UPI Payment" && r.bankId) {
      bankBalances[r.bankId] =
        (bankBalances[r.bankId] || 0) + amount;
    }

    // Cheque → ignore until realised
  });

  /* ======================================================
     3️⃣ APPLY EXPENSES UNTIL DATE
  ====================================================== */

  const expenses = await ChurchExpense.find({
    date: { $lte: date },
    expenseReturned: false,
  }).lean();

  expenses.forEach((exp) => {
    const amount = Number(exp.totalAmount);

    if (exp.paymentMethod === "Cash") {
      const acc = exp.cashAccountType;
      cashBalances[acc] = (cashBalances[acc] || 0) - amount;
    }

    // Cash → Bank Transfer
    exp.expenseLines.forEach((line) => {
      if (line.ledgerCategoryName === "Bank A/C") {
        const bank = banks.find(
          (b) => b.ledger_code === line.ledgerCode
        );
        if (bank) {
          bankBalances[bank._id] =
            (bankBalances[bank._id] || 0) + Number(line.amount);
        }
      }
    });

    // Cheque → ignore until realised
  });

  /* ======================================================
     4️⃣ SUM TOTALS
  ====================================================== */

  const closingCashTotal = Object.values(cashBalances).reduce(
    (sum, v) => sum + v,
    0
  );

  const closingBankTotal = Object.values(bankBalances).reduce(
    (sum, v) => sum + v,
    0
  );

  return {
    cashAccounts: cashBalances,
    bankAccounts: bankBalances,
    totalCash: Number(closingCashTotal.toFixed(2)),
    totalBank: Number(closingBankTotal.toFixed(2)),
    grandTotal: Number(
      (closingCashTotal + closingBankTotal).toFixed(2)
    ),
  };
};