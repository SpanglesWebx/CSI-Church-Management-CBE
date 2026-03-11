// controllers/churchExpenseController.js
const mongoose = require("mongoose");
const ChurchExpense = require("../Schema/ChurchExpenseSchema");
const Counter = require("../Schema/CounterSchema");
const Bank = require("../Schema/bankSchema");
const CashAccount = require("../Schema/CashAccountSchema");
const BankRecon = require("../Schema/BankReconSchema");


exports.addChurchExpense = async (req, res) => {
  try {
    const {
      totalAmount,
      expenseLines,

      date,
      paymentMethod,
      cashAccountType,

      voucherNumber,
      inFavourOf,

      creditorId,
      creditorName,
      creditorCode,
      creditorPhone,

      bankId,
      bankName,
      bankAccountNumber,

      chequeNumber,
      chequeDate,
      upiId,
    } = req.body;

    /* ==================================================
       1️⃣ BASIC VALIDATION
    ================================================== */

    if (!date || !paymentMethod) {
      return res.status(400).json({
        status: "Failed",
        message: "Date and payment method are required",
      });
    }

    if (!Array.isArray(expenseLines) || expenseLines.length === 0) {
      return res.status(400).json({
        status: "Failed",
        message: "At least one expense line is required",
      });
    }

    if (!totalAmount || Number(totalAmount) <= 0) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid total amount",
      });
    }

    for (const line of expenseLines) {
      if (
        !line.ledgerName ||
        !line.ledgerCode ||
        !line.ledgerCategoryName ||
        !line.accountType ||
        !line.amount ||
        Number(line.amount) <= 0
      ) {
        return res.status(400).json({
          status: "Failed",
          message: "Invalid expense line details",
        });
      }
    }

    if (paymentMethod === "Cash" && !cashAccountType) {
      return res.status(400).json({
        status: "Failed",
        message: "Cash account type is required",
      });
    }

    /* ==================================================
       2️⃣ FINAL AMOUNT
    ================================================== */

    const finalAmount = Number(totalAmount);

    /* ==================================================
       3️⃣ GENERATE AUTO PAY ID
    ================================================== */


    /* ==================================================
       4️⃣ BALANCE HANDLING
    ================================================== */

    // 🟢 CASH
    if (paymentMethod === "Cash") {
      const cash = await CashAccount.findOne({
        account_type: cashAccountType,
      });

      if (!cash || cash.current_balance < finalAmount) {
        return res.status(400).json({
          status: "Failed",
          message: `Insufficient balance in ${cashAccountType}`,
        });
      }

      cash.current_balance -= finalAmount;
      await cash.save();
    }

    /* ==================================================
🔵 BANK PAYMENT (DEDUCT BANK IMMEDIATELY)
================================================== */

if (paymentMethod === "Cheque" && bankId) {

  const bank = await Bank.findById(bankId);

  if (!bank || bank.current_balance < finalAmount) {
    return res.status(400).json({
      status: "Failed",
      message: "Insufficient bank balance",
    });
  }

  // 🔥 deduct immediately
  bank.current_balance -= finalAmount;

  await bank.save();
}

    /* ================================================
    🔵 HANDLE CASH → BANK / BANK → BANK TRANSFER
 ================================================ */

    const bankLines = expenseLines.filter(
      line => line.ledgerCategoryName === "Bank A/C"
    );


    for (const line of bankLines) {

      // Skip if same bank used for payment
      if (
        paymentMethod === "Cheque" &&
        bankId &&
        bankId.toString() === line.ledgerCode
      ) {
        continue;
      }

      const targetBank = await Bank.findOne({
        ledger_code: line.ledgerCode
      });

      if (!targetBank) {
        return res.status(400).json({
          status: "Failed",
          message: `Bank not found for ${line.ledgerName}`,
        });
      }

      targetBank.current_balance += Number(line.amount);
      await targetBank.save();
    }


    const counter = await Counter.findOneAndUpdate(
      { name: "expense" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    const autoExpenseId =
      "PAY" + String(counter.seq).padStart(4, "0");

    /* ==================================================
 ⭐ DATE-WISE TRANS NO (P0001...)
================================================== */

    // normalize date (remove time)
    const expenseDate = new Date(date);
    expenseDate.setHours(0, 0, 0, 0);

    // find last transNo for this date
    const lastExpense = await ChurchExpense.findOne({
      date: {
        $gte: expenseDate,
        $lt: new Date(expenseDate.getTime() + 24 * 60 * 60 * 1000),
      },
    })
      .sort({ transNo: -1 })
      .lean();

    let nextSeq = 1;

    if (lastExpense?.transNo) {
      const lastNumber = parseInt(lastExpense.transNo.replace("P", ""), 10);
      nextSeq = lastNumber + 1;
    }

    const transNo = "P" + String(nextSeq).padStart(4, "0");


    /* ==================================================
       5️⃣ SAVE EXPENSE (NO DUPLICATE LEDGER FIELDS)
    ================================================== */

    const expense = await ChurchExpense.create({
      autoExpenseId,
      transNo,

      totalAmount: finalAmount,

      expenseLines: expenseLines.map((line) => ({
        voucherNumber: line.voucherNumber || "",

        creditorId: line.creditorId || null,
        creditorName: line.creditorName || "",
        creditorCode: line.creditorCode || "",
        creditorPhone: line.creditorPhone || "",
        ledgerName: line.ledgerName,
        ledgerCode: line.ledgerCode,
        ledgerCategoryName: line.ledgerCategoryName,
        accountType: line.accountType,
        amount: Number(line.amount),
        description: line.description || "",
      })),

      date,

      paymentMethod,
      cashAccountType:
        paymentMethod === "Cash" ? cashAccountType : "",

      inFavourOf,


      bankId: paymentMethod === "Cheque" ? bankId : null,
      bankName: paymentMethod === "Cheque" ? bankName : "",
      bankAccountNumber:
        paymentMethod === "Cheque" ? bankAccountNumber : "",

      chequeNumber:
        paymentMethod === "Cheque" ? chequeNumber : "",

      chequeDate:
        paymentMethod === "Cheque" ? chequeDate : null,

      upiId: paymentMethod === "UPI" ? upiId : "",

      createdBy: req.user?._id,
    });

    if (paymentMethod === "Cheque" || paymentMethod === "UPI") {

      // 🔹 party priority
      let partyName =
        inFavourOf?.trim() ||
        creditorName?.trim() ||
        "";

      let partyPhone = creditorPhone || "";

      // 🔹 fallback from expense lines
      if (!partyName) {
        for (const el of expense.expenseLines || expenseLines) {
          if (el.creditorName) {
            partyName = el.creditorName;
            partyPhone = el.creditorPhone || partyPhone;
            break;
          }

          if (!partyName && el.voucherNumber) {
            partyName = el.voucherNumber;
          }
        }
      }

      if (!partyName) partyName = "Expense";

      await BankRecon.create({
        receiptId: expense._id,
        autoReceiptId: expense.autoExpenseId,
        transNo: expense.transNo || "",   // ⭐ IMPORTANT
        receiptDate: new Date(date),

        paymentMethod:
          paymentMethod === "Cheque"
            ? "Cheque"
            : "UPI Payment",

        chequeNumber,
        chequeDate: chequeDate ? new Date(chequeDate) : null,
        upiId,

        bankId,
        bankName,

        partyName,
        phone: partyPhone || "",

        amount: Number(finalAmount),
        drCr: "Credit",

        realised: false,
        realisedDate: null,
      });
    }
    /* ================================================== */

    res.status(201).json({
      status: "Success",
      message: "Expense added successfully",
      data: expense,
    });

  } catch (error) {
    console.error("Add expense error:", error);
    res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};


exports.getChurchExpenses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      search = "",
      startDate,
      endDate,
    } = req.query;

    const skip = (page - 1) * limit;

    const query = {};

    // 🔍 Search by subcategory (Payment For)
    // 🔍 Global search
if (search) {
  const searchNumber = Number(search);

  query.$or = [
    { autoExpenseId: { $regex: search, $options: "i" } }, // Payment ID
    { transNo: { $regex: search, $options: "i" } },       // Trans No
    { "expenseLines.ledgerName": { $regex: search, $options: "i" } }, // Payment For
    ...(isNaN(searchNumber) ? [] : [{ totalAmount: searchNumber }]) // Amount
  ];
}

    // 📅 Date filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const [expenses, total] = await Promise.all([
  ChurchExpense.find(query)
    .sort({ autoExpenseId: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean(),

  ChurchExpense.countDocuments(query),
]);

// 🔥 Attach realised flag from BankRecon
const expenseIds = expenses.map(e => e._id);

const brsList = await BankRecon.find({
  receiptId: { $in: expenseIds }
}).select("receiptId realised");

const brsMap = {};
brsList.forEach(b => {
  brsMap[b.receiptId.toString()] = b.realised;
});

const expensesWithStatus = expenses.map(exp => ({
  ...exp,
  realised: brsMap[exp._id.toString()] || false
}));

    res.status(200).json({
  data: expensesWithStatus,
  totalPages: Math.ceil(total / limit),
  totalRecords: total,
});
  } catch (error) {
    console.error("Get expense error:", error);
    res.status(500).json({
      message: "Failed to fetch expenses",
    });
  }
};

exports.downloadPaymentsDateWise = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: "Failed",
        message: "Start and End date required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const expenses = await ChurchExpense.find({
      date: { $gte: start, $lte: end },
    })
      .sort({ date: 1, transNo: 1 })
      .lean();

    res.status(200).json({
      status: "Success",
      data: expenses,
    });
  } catch (err) {
    console.error("Download date wise error:", err);
    res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};

exports.updateChurchExpense = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;
    const payload = req.body;

    // ====================================================
    // 1️⃣ FETCH OLD EXPENSE
    // ====================================================
    const oldExpense = await ChurchExpense.findById(id).session(session);

    if (!oldExpense) {
      throw new Error("Expense not found");
    }

    const oldAmount = Number(oldExpense.totalAmount);

    // ====================================================
    // 2️⃣ REVERSE OLD EFFECTS
    // ====================================================

    // 🔴 Reverse old Cash
    if (oldExpense.paymentMethod === "Cash") {
      const cash = await CashAccount.findOne({
        account_type: oldExpense.cashAccountType,
      }).session(session);

      if (cash) {
        cash.current_balance += oldAmount;
        await cash.save({ session });
      }
    }

    // 🔴 Reverse old Cheque Bank deduction
    if (oldExpense.paymentMethod === "Cheque" && oldExpense.bankId) {
      const bank = await Bank.findById(oldExpense.bankId).session(session);
      if (bank) {
        bank.current_balance += oldAmount;
        await bank.save({ session });
      }
    }

    // 🔴 Reverse old Bank transfer lines
    const oldBankLines = oldExpense.expenseLines.filter(
      (l) => l.ledgerCategoryName === "Bank A/C"
    );

    for (const line of oldBankLines) {
      const bank = await Bank.findOne({
        ledger_code: line.ledgerCode,
      }).session(session);

      if (bank) {
        bank.current_balance -= Number(line.amount);
        await bank.save({ session });
      }
    }

    // ====================================================
    // 3️⃣ CLEAN NEW PAYLOAD
    // ====================================================

    const {
      totalAmount,
      paymentMethod,
      cashAccountType,
      bankId,
      expenseLines,
    } = payload;

    const newAmount = Number(totalAmount);

    // 🔥 FIX: clean ObjectId
    const cleanedBankId =
      bankId && bankId !== "" ? bankId : null;

    // ====================================================
    // 4️⃣ APPLY NEW EFFECTS
    // ====================================================

    // 🟢 New Cash deduction
    if (paymentMethod === "Cash") {
      const cash = await CashAccount.findOne({
        account_type: cashAccountType,
      }).session(session);

      if (!cash || cash.current_balance < newAmount) {
        throw new Error(`Insufficient balance in ${cashAccountType}`);
      }

      cash.current_balance -= newAmount;
      await cash.save({ session });
    }

    // 🔵 New Cheque Bank deduction
    if (paymentMethod === "Cheque" && cleanedBankId) {
      const bank = await Bank.findById(cleanedBankId).session(session);

      if (!bank || bank.current_balance < newAmount) {
        throw new Error("Insufficient bank balance");
      }

      bank.current_balance -= newAmount;
      await bank.save({ session });
    }

    // 🔵 Apply new Bank transfer lines
    const newBankLines = expenseLines.filter(
      (l) => l.ledgerCategoryName === "Bank A/C"
    );

    for (const line of newBankLines) {
      const bank = await Bank.findOne({
        ledger_code: line.ledgerCode,
      }).session(session);

      if (!bank) {
        throw new Error(`Bank not found for ${line.ledgerName}`);
      }

      bank.current_balance += Number(line.amount);
      await bank.save({ session });
    }

    // ====================================================
    // 5️⃣ UPDATE EXPENSE DOCUMENT
    // ====================================================

    const updateData = {
      ...payload,
      bankId: cleanedBankId,
    };

    const updatedExpense = await ChurchExpense.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: "after", session }
    );

    // ====================================================
    // 6️⃣ HANDLE BANK RECON (BRS)
    // ====================================================

    const existingBRS = await BankRecon.findOne({
      receiptId: oldExpense._id,
    }).session(session);

    if (paymentMethod === "Cheque") {
      // If BRS exists → update
      if (existingBRS) {
        await BankRecon.findByIdAndUpdate(
          existingBRS._id,
          {
            receiptDate: new Date(payload.date),
            chequeNumber: payload.chequeNumber || "",
            chequeDate: payload.chequeDate || null,
            bankId: cleanedBankId,
            bankName: payload.bankName || "",
            amount: newAmount,
          },
          { session }
        );
      } else {
        // If no BRS → create
        await BankRecon.create(
          [
            {
              receiptId: updatedExpense._id,
              autoReceiptId: updatedExpense.autoExpenseId,
              transNo: updatedExpense.transNo,
              receiptDate: new Date(payload.date),
              paymentMethod: "Cheque",
              chequeNumber: payload.chequeNumber || "",
              chequeDate: payload.chequeDate || null,
              bankId: cleanedBankId,
              bankName: payload.bankName || "",
              partyName: payload.inFavourOf || "Expense",
              amount: newAmount,
              drCr: "Credit",
              realised: false,
            },
          ],
          { session }
        );
      }
    } else {
      // If payment changed from Cheque → Cash
      if (existingBRS) {
        await BankRecon.findByIdAndDelete(existingBRS._id).session(session);
      }
    }

    // ====================================================
    // 7️⃣ COMMIT
    // ====================================================
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      status: "Success",
      message: "Expense updated successfully",
      data: updatedExpense,
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    console.error("Update expense error:", err);

    res.status(500).json({
      status: "Failed",
      message: err.message || "Failed to update expense",
    });
  }
};