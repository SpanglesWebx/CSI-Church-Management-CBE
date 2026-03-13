const CemPayment = require("../Schema/CemPaymentSchema");
const Counter = require("../Schema/CounterSchema");
const CemBank = require("../Schema/cemBankSchema");
const CashAccount = require("../Schema/CemCashAccountSchema");
const BankRecon = require("../Schema/BankReconSchema");
const ReceiptTransCounter = require("../Schema/ReceiptTransCounter");

/* ==================================================
   ADD CEM PAYMENT
================================================== */
exports.addCemPayment = async (req, res) => {
  try {
    const {
      totalAmount,
      expenseLines,
      date,
      paymentMethod,
      cashAccountType,
      inFavourOf,
      bankId,
      bankName,
      bankAccountNumber,
      chequeNumber,
      chequeDate,
      upiId,
    } = req.body;

    /* ---------- BASIC VALIDATION ---------- */
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

    if (totalAmount === undefined || Number(totalAmount) <= 0) {
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
        line.amount === undefined ||
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

    const finalAmount = Number(totalAmount);

    /* ---------- CASH BALANCE ---------- */
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
    /* ---------- BANK PAYMENT (DEDUCT IMMEDIATELY) ---------- */
    if (paymentMethod === "Cheque" && bankId) {

      const bank = await CemBank.findById(bankId);

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

    /* ---------- BANK TRANSFERS ---------- */
    const bankLines = expenseLines.filter(
      (line) => line.ledgerCategoryName === "Bank A/C"
    );

    for (const line of bankLines) {
      if (
        paymentMethod === "Cheque" &&
        bankId &&
        bankId.toString() === line.ledgerCode
      ) {
        continue;
      }

      const targetBank = await CemBank.findOne({
        ledger_code: line.ledgerCode,
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

    /* ---------- COUNTER ---------- */
    const counter = await Counter.findOneAndUpdate(
      { name: "cem-payment" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    const autoExpenseId =
      "CEMPAY" + String(counter.seq).padStart(4, "0");

    /* --------------------------------------------------
 🔥 GENERATE DATE-WISE PAYMENT TRANS NO
-------------------------------------------------- */

    // IST-safe date key
    const dateKey = new Date(date)
      .toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

    // atomic increment (separate namespace)
    const transCounter = await ReceiptTransCounter.findOneAndUpdate(
      { dateKey: `CEMPAY-${dateKey}` }, // ✅ important
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    // format → P0001
    const transNo = "P" + String(transCounter.seq).padStart(4, "0");

    /* ---------- SAVE ---------- */
    const expense = await CemPayment.create({
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

    /* ---------- BANK RECON ---------- */
    if (paymentMethod === "Cheque" || paymentMethod === "UPI") {

      const firstLine = expenseLines[0] || {};

      await BankRecon.create({
        receiptId: expense._id,
        autoReceiptId: expense.autoExpenseId,
        transNo: expense.transNo,
        receiptDate: new Date(date),

        paymentMethod:
          paymentMethod === "Cheque" ? "Cheque" : "UPI Payment",

        chequeNumber,
        chequeDate: chequeDate ? new Date(chequeDate) : null,

        upiId,

        bankId,
        bankName,

        partyName:
          firstLine.creditorName ||
          firstLine.ledgerName ||
          "Expense",

        phone: firstLine.creditorPhone || "",

        amount: Number(finalAmount),

        drCr: "Credit",

        realised: false,
        realisedDate: null,
      });
    }

    res.status(201).json({
      status: "Success",
      message: "Expense added successfully",
      data: expense,
    });
  } catch (error) {
    console.error("Add cem payment error:", error);
    res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};

/* ==================================================
   LIST
================================================== */
exports.getCemPayments = async (req, res) => {
  try {

    const {
      page = 1,
      limit = 25,
      search = "",
      startDate,
      endDate
    } = req.query;

    const skip = (page - 1) * limit;

    const query = {};

    if (search) {
      query["expenseLines.ledgerName"] = {
        $regex: search,
        $options: "i",
      };
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const payments = await CemPayment.find(query)
      .sort({ autoExpenseId: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await CemPayment.countDocuments(query);

    const data = payments.map((p) => {

      const firstLine = p.expenseLines?.[0] || {};

      return {
        _id: p._id,
        autoExpenseId: p.autoExpenseId,
        transNo: p.transNo,

        paymentFor: {
          ledgerCode: firstLine.ledgerCode,
          ledgerName: firstLine.ledgerName,
          totalLines: p.expenseLines.length
        },

        creditors: p.expenseLines
          .filter(l => l.creditorName)
          .map(l => ({
            name: l.creditorName,
            code: l.creditorCode
          })),

        amount: p.totalAmount,
        date: p.date,

        realised: p.realised || false,
        expenseReturned: p.expenseReturned || false
      };
    });

    res.json({
      data,
      totalPages: Math.ceil(total / limit),
      totalRecords: total
    });

  } catch (error) {
    console.error("Get cem payments error:", error);
    res.status(500).json({
      message: "Failed to fetch payments"
    });
  }
};

exports.viewPaymentById = async (req, res) => {
  try {

    const { id } = req.params;

    const payment = await CemPayment.findById(id);

    if (!payment) {
      return res.status(404).json({
        status: "Failed",
        message: "Payment not found"
      });
    }

    res.json({
      status: "Success",
      data: payment
    });

  } catch (error) {
    console.error("View payment error:", error);
    res.status(500).json({
      status: "Failed",
      message: "Server error"
    });
  }
};

exports.updateCemPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      totalAmount,
      expenseLines,
      date,
      paymentMethod,
      cashAccountType,
      inFavourOf,
      bankId,
      bankName,
      bankAccountNumber,
      chequeNumber,
      chequeDate,
      upiId,
    } = req.body;

    const existing = await CemPayment.findById(id);

    if (!existing) {
      return res.status(404).json({
        status: "Failed",
        message: "Payment not found",
      });
    }

    const oldAmount = Number(existing.totalAmount);

    /* ==================================================
       1️⃣ REVERSE OLD CASH
    ================================================== */

    if (existing.paymentMethod === "Cash") {
      const cash = await CashAccount.findOne({
        account_type: existing.cashAccountType,
      });

      if (cash) {
        cash.current_balance += oldAmount;
        await cash.save();
      }
    }

    /* ==================================================
       2️⃣ REVERSE OLD BANK
    ================================================== */

    if (existing.paymentMethod === "Cheque" && existing.bankId) {
      const bank = await CemBank.findById(existing.bankId);

      if (bank) {
        bank.current_balance += oldAmount;
        await bank.save();
      }
    }

    /* ==================================================
       3️⃣ REVERSE OLD BANK TRANSFERS
    ================================================== */

    const oldBankLines = existing.expenseLines.filter(
      (line) => line.ledgerCategoryName === "Bank A/C"
    );

    for (const line of oldBankLines) {
      const targetBank = await CemBank.findOne({
        ledger_code: line.ledgerCode,
      });

      if (targetBank) {
        targetBank.current_balance -= Number(line.amount);
        await targetBank.save();
      }
    }

    /* ==================================================
       4️⃣ APPLY NEW CASH
    ================================================== */

    const finalAmount = Number(totalAmount);

    if (paymentMethod === "Cash") {
      const cash = await CashAccount.findOne({
        account_type: cashAccountType,
      });

      if (!cash || cash.current_balance < finalAmount) {
        return res.status(400).json({
          status: "Failed",
          message: "Insufficient cash balance",
        });
      }

      cash.current_balance -= finalAmount;
      await cash.save();
    }

    /* ==================================================
       5️⃣ APPLY NEW BANK
    ================================================== */

    if (paymentMethod === "Cheque" && bankId) {
      const bank = await CemBank.findById(bankId);

      if (!bank || bank.current_balance < finalAmount) {
        return res.status(400).json({
          status: "Failed",
          message: "Insufficient bank balance",
        });
      }

      bank.current_balance -= finalAmount;
      await bank.save();
    }

    /* ==================================================
       6️⃣ APPLY NEW BANK TRANSFERS
    ================================================== */

    const newBankLines = expenseLines.filter(
      (line) => line.ledgerCategoryName === "Bank A/C"
    );

    for (const line of newBankLines) {
      const targetBank = await CemBank.findOne({
        ledger_code: line.ledgerCode,
      });

      if (targetBank) {
        targetBank.current_balance += Number(line.amount);
        await targetBank.save();
      }
    }

    /* ==================================================
       7️⃣ UPDATE DOCUMENT
    ================================================== */

    const updated = await CemPayment.findByIdAndUpdate(
      id,
      {
        totalAmount: finalAmount,
        expenseLines,
        date,
        paymentMethod,
        cashAccountType,
        inFavourOf,
        bankId,
        bankName,
        bankAccountNumber,
        chequeNumber,
        chequeDate,
        upiId,
      },
      { new: true }
    );

    /* ==================================================
       8️⃣ UPDATE BRS
    ================================================== */

    await BankRecon.findOneAndUpdate(
      { receiptId: updated._id },
      {
        receiptDate: new Date(date),
        bankId,
        bankName,
        chequeNumber,
        chequeDate,
        upiId,
        amount: finalAmount,
      }
    );

    res.status(200).json({
      status: "Success",
      message: "Payment updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("Update cem payment error:", err);
    res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};