const mongoose = require("mongoose");

const WomenPayment = require("../Schema/WomenPaymentSchema");
const Counter = require("../Schema/CounterSchema");

const WomenBank = require("../Schema/WomenBankSchema");
const WomenCashAccount = require("../Schema/WomenCashAccountSchema");

const BankRecon = require("../Schema/BankReconSchema");

exports.addWomenPayment = async (req, res) => {
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

    const finalAmount = Number(totalAmount);

    if (paymentMethod === "Cash") {
      const cash = await WomenCashAccount.findOne({
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

      const targetBank = await WomenBank.findOne({
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

    const counter = await Counter.findOneAndUpdate(
      { name: "women-expense" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    const autoExpenseId = "WPAY" + String(counter.seq).padStart(4, "0");

    const expenseDate = new Date(date);
    expenseDate.setHours(0, 0, 0, 0);

    const lastExpense = await WomenPayment.findOne({
      date: {
        $gte: expenseDate,
        $lt: new Date(expenseDate.getTime() + 86400000),
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

    const expense = await WomenPayment.create({
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

      cashAccountType: paymentMethod === "Cash" ? cashAccountType : "",

      inFavourOf,

      bankId: paymentMethod === "Cheque" ? bankId : null,
      bankName: paymentMethod === "Cheque" ? bankName : "",
      bankAccountNumber:
        paymentMethod === "Cheque" ? bankAccountNumber : "",

      chequeNumber: paymentMethod === "Cheque" ? chequeNumber : "",
      chequeDate: paymentMethod === "Cheque" ? chequeDate : null,

      upiId: paymentMethod === "UPI" ? upiId : "",

      createdBy: req.user?._id,
    });

    if (paymentMethod === "Cheque" || paymentMethod === "UPI") {
      let partyName = inFavourOf?.trim() || creditorName?.trim() || "";

      let partyPhone = creditorPhone || "";

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

      if (!partyName) partyName = "Women Expense";

      await BankRecon.create({
        receiptId: expense._id,
        autoReceiptId: expense.autoExpenseId,
        transNo: expense.transNo,
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

    res.status(201).json({
      status: "Success",
      message: "Women payment added successfully",
      data: expense,
    });

  } catch (error) {
    console.error("Add women payment error:", error);

    res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};

exports.getWomenPayments = async (req, res) => {
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

    /* SEARCH */

    if (search) {
      const searchNumber = Number(search);

      query.$or = [
        { autoExpenseId: { $regex: search, $options: "i" } },
        { transNo: { $regex: search, $options: "i" } },
        { "expenseLines.ledgerName": { $regex: search, $options: "i" } },
        ...(isNaN(searchNumber) ? [] : [{ totalAmount: searchNumber }]),
      ];
    }

    /* DATE FILTER */

    if (startDate || endDate) {
      query.date = {};

      if (startDate) query.date.$gte = new Date(startDate);

      if (endDate) query.date.$lte = new Date(endDate);
    }

    const [payments, total] = await Promise.all([
      WomenPayment.find(query)
        .sort({ autoExpenseId: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),

      WomenPayment.countDocuments(query),
    ]);

    /* ==================================================
       Attach realised status from BankRecon
    ================================================== */

    const paymentIds = payments.map((p) => p._id);

    const brsList = await BankRecon.find({
      receiptId: { $in: paymentIds },
    }).select("receiptId realised");

    const brsMap = {};

    brsList.forEach((b) => {
      brsMap[b.receiptId.toString()] = b.realised;
    });

    const paymentsWithStatus = payments.map((p) => ({
      ...p,
      realised: brsMap[p._id.toString()] || false,
    }));

    res.status(200).json({
      data: paymentsWithStatus,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });

  } catch (error) {
    console.error("Get women payments error:", error);

    res.status(500).json({
      message: "Failed to fetch women payments",
    });
  }
};

exports.downloadWomenPaymentsDateWise = async (req, res) => {
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

    const payments = await WomenPayment.find({
      date: { $gte: start, $lte: end },
    })
      .sort({ date: 1, transNo: 1 })
      .lean();

    res.status(200).json({
      status: "Success",
      data: payments,
    });

  } catch (err) {
    console.error("Download women payments error:", err);

    res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};

exports.updateWomenPayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;
    const payload = req.body;

    /* ====================================================
       1️⃣ FETCH OLD PAYMENT
    ==================================================== */

    const oldPayment = await WomenPayment.findById(id).session(session);

    if (!oldPayment) {
      throw new Error("Women payment not found");
    }

    const oldAmount = Number(oldPayment.totalAmount);

    /* ====================================================
       2️⃣ REVERSE OLD EFFECTS
    ==================================================== */

    if (oldPayment.paymentMethod === "Cash") {
      const cash = await WomenCashAccount.findOne({
        account_type: oldPayment.cashAccountType,
      }).session(session);

      if (cash) {
        cash.current_balance += oldAmount;
        await cash.save({ session });
      }
    }

    if (oldPayment.paymentMethod === "Cheque" && oldPayment.bankId) {
      const bank = await WomenBank.findById(oldPayment.bankId).session(session);

      if (bank) {
        bank.current_balance += oldAmount;
        await bank.save({ session });
      }
    }

    const oldBankLines = oldPayment.expenseLines.filter(
      (l) => l.ledgerCategoryName === "Bank A/C"
    );

    for (const line of oldBankLines) {
      const bank = await WomenBank.findOne({
        ledger_code: line.ledgerCode,
      }).session(session);

      if (bank) {
        bank.current_balance -= Number(line.amount);
        await bank.save({ session });
      }
    }

    /* ====================================================
       3️⃣ CLEAN NEW PAYLOAD
    ==================================================== */

    const {
      totalAmount,
      paymentMethod,
      cashAccountType,
      bankId,
      expenseLines,
    } = payload;

    const newAmount = Number(totalAmount);

    const cleanedBankId = bankId && bankId !== "" ? bankId : null;

    /* ====================================================
       4️⃣ APPLY NEW EFFECTS
    ==================================================== */

    if (paymentMethod === "Cash") {
      const cash = await WomenCashAccount.findOne({
        account_type: cashAccountType,
      }).session(session);

      if (!cash || cash.current_balance < newAmount) {
        throw new Error(`Insufficient balance in ${cashAccountType}`);
      }

      cash.current_balance -= newAmount;
      await cash.save({ session });
    }

    if (paymentMethod === "Cheque" && cleanedBankId) {
      const bank = await WomenBank.findById(cleanedBankId).session(session);

      if (!bank || bank.current_balance < newAmount) {
        throw new Error("Insufficient bank balance");
      }

      bank.current_balance -= newAmount;

      await bank.save({ session });
    }

    const newBankLines = expenseLines.filter(
      (l) => l.ledgerCategoryName === "Bank A/C"
    );

    for (const line of newBankLines) {
      const bank = await WomenBank.findOne({
        ledger_code: line.ledgerCode,
      }).session(session);

      if (!bank) {
        throw new Error(`Bank not found for ${line.ledgerName}`);
      }

      bank.current_balance += Number(line.amount);

      await bank.save({ session });
    }

    /* ====================================================
       5️⃣ UPDATE PAYMENT
    ==================================================== */

    const updateData = {
      ...payload,
      bankId: cleanedBankId,
    };

    const updatedPayment = await WomenPayment.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: "after", session }
    );

    /* ====================================================
       6️⃣ HANDLE BANK RECON
    ==================================================== */

    const existingBRS = await BankRecon.findOne({
      receiptId: oldPayment._id,
    }).session(session);

    if (paymentMethod === "Cheque") {
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
        await BankRecon.create(
          [
            {
              receiptId: updatedPayment._id,
              autoReceiptId: updatedPayment.autoExpenseId,
              transNo: updatedPayment.transNo,
              receiptDate: new Date(payload.date),
              paymentMethod: "Cheque",
              chequeNumber: payload.chequeNumber || "",
              chequeDate: payload.chequeDate || null,
              bankId: cleanedBankId,
              bankName: payload.bankName || "",
              partyName: payload.inFavourOf || "Women Expense",
              amount: newAmount,
              drCr: "Credit",
              realised: false,
            },
          ],
          { session }
        );
      }
    } else {
      if (existingBRS) {
        await BankRecon.findByIdAndDelete(existingBRS._id).session(session);
      }
    }

    /* ====================================================
       7️⃣ COMMIT
    ==================================================== */

    await session.commitTransaction();

    session.endSession();

    res.status(200).json({
      status: "Success",
      message: "Women payment updated successfully",
      data: updatedPayment,
    });

  } catch (err) {
    await session.abortTransaction();

    session.endSession();

    console.error("Update women payment error:", err);

    res.status(500).json({
      status: "Failed",
      message: err.message || "Failed to update women payment",
    });
  }
};