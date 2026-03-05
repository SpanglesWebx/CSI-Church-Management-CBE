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
      { new: true, upsert: true }
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
      { new: true, upsert: true }
    );

    // format → P0001
    const transNo = "P" + String(transCounter.seq).padStart(4, "0");

    /* ---------- SAVE ---------- */
    const expense = await CemPayment.create({
      autoExpenseId,
      transNo,
      totalAmount: finalAmount,
      expenseLines,
      date,
      paymentMethod,
      cashAccountType:
        paymentMethod === "Cash" ? cashAccountType : "",
      voucherNumber,
      inFavourOf,
      creditorId,
      creditorName,
      creditorCode,
      creditorPhone,
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
        partyName: inFavourOf || creditorName || "Expense",
        phone: creditorPhone || "",
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
    const { page = 1, limit = 25, search = "", startDate, endDate } = req.query;

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

    const [data, total] = await Promise.all([
      CemPayment.find(query)
        .sort({ autoExpenseId: -1 })
        .skip(skip)
        .limit(Number(limit)),
      CemPayment.countDocuments(query),
    ]);

    res.json({
      data,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });
  } catch (error) {
    console.error("Get cem payments error:", error);
    res.status(500).json({
      message: "Failed to fetch payments",
    });
  }
};
