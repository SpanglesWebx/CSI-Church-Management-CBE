const CemReceipt = require("../Schema/CemReceiptSchema");
const Counter = require("../Schema/CounterSchema");
const CemBank = require("../Schema/cemBankSchema");
const CashAccount = require("../Schema/CemCashAccountSchema");
const BankRecon = require("../Schema/BankReconSchema");
const ReceiptTransCounter = require("../Schema/ReceiptTransCounter");

/* ==================================================
   ADD CEM RECEIPT
================================================== */
exports.addCemReceipt = async (req, res) => {
  try {
    const {
      receiptDate,
      paymentMethod,
      chequeNumber,
      chequeDate,
      payerBankName,
      bankId,
      bankName,
      bankAccountNumber,
      upiId,
      totalAmount,
      receiptLines,
      isMember,
      memberId,
      memberName,
      phone,
      nonMemberName,
      nonMemberPhone,
    } = req.body;

    /* ---------- BASIC VALIDATION ---------- */
    if (!receiptDate || !paymentMethod) {
      return res.status(400).json({ message: "Receipt date and payment method are required" });
    }

    if (!Array.isArray(receiptLines) || receiptLines.length === 0) {
      return res.status(400).json({ message: "At least one receipt line is required" });
    }

    if (totalAmount === undefined || Number(totalAmount) <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    /* ---------- PAYMENT VALIDATION ---------- */
    if (paymentMethod === "Cheque") {
      if (!chequeNumber) {
        return res.status(400).json({ message: "Cheque number is required" });
      }
      if (!bankId) {
        return res.status(400).json({ message: "Receiver bank is required for cheque" });
      }
    }

    if (paymentMethod === "UPI Payment") {
      if (!upiId) {
        return res.status(400).json({ message: "UPI ID is required for UPI payment" });
      }
      if (!bankId) {
        return res.status(400).json({ message: "Receiver bank is required for UPI payment" });
      }
    }

    /* ---------- CASH UPDATE ---------- */
    if (paymentMethod === "Cash") {
      const cashAccount = await CashAccount.findOne({
        account_type: "Cash on Hand A/c",
      });

      if (!cashAccount) {
        return res.status(400).json({ message: "Cash on Hand account not found" });
      }

      cashAccount.current_balance += Number(totalAmount);
      await cashAccount.save();
    }

    /* ---------- RECEIPT COUNTER ---------- */
    const counter = await Counter.findOneAndUpdate(
      { name: "cem-receipt" }, // ✅ separate counter
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const autoReceiptId = "CEMREC" + String(counter.seq).padStart(4, "0");

    /* --------------------------------------------------
   🔥 GENERATE DATE-WISE TRANS NO (CEM)
-------------------------------------------------- */

// IST-safe date key
const dateKey = new Date(receiptDate)
  .toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

// atomic increment per date
const transCounter = await ReceiptTransCounter.findOneAndUpdate(
  { dateKey: `CEM-${dateKey}` }, // ✅ important prefix
  { $inc: { seq: 1 } },
  { new: true, upsert: true }
);

// format → 0001
const transNo = String(transCounter.seq).padStart(4, "0");

    /* ---------- CREATE RECEIPT ---------- */
    const receipt = await CemReceipt.create({
      autoReceiptId,
      transNo,
      receiptDate: new Date(receiptDate),
      paymentMethod,
      chequeNumber: paymentMethod === "Cheque" ? chequeNumber : "",
      chequeDate: paymentMethod === "Cheque" && chequeDate ? new Date(chequeDate) : null,
      payerBankName: paymentMethod === "Cheque" ? payerBankName || "" : "",
      bankId: paymentMethod !== "Cash" ? bankId : null,
      bankName: paymentMethod !== "Cash" ? bankName || "" : "",
      bankAccountNumber: paymentMethod !== "Cash" ? bankAccountNumber || "" : "",
      upiId: paymentMethod === "UPI Payment" ? upiId || "" : "",
      totalAmount: Number(totalAmount),
      receiptLines,
      isMember,
      memberId: isMember ? memberId : "",
      memberName: isMember ? memberName : "",
      phone: isMember ? phone : "",
      nonMemberName: !isMember ? nonMemberName : "",
      nonMemberPhone: !isMember ? nonMemberPhone : "",
      createdBy: req.user?._id,
    });

    /* ---------- BANK RECON ---------- */
    if (paymentMethod === "Cheque" || paymentMethod === "UPI Payment") {
      const isUPI = paymentMethod === "UPI Payment";

      await BankRecon.create({
        receiptId: receipt._id,
        autoReceiptId: receipt.autoReceiptId,
        transNo: receipt.transNo,
        receiptDate: new Date(receiptDate),
        paymentMethod,
        chequeNumber,
        chequeDate: chequeDate ? new Date(chequeDate) : null,
        upiId,
        bankId,
        bankName,
        partyName: isMember ? memberName : nonMemberName,
        phone: isMember ? phone : nonMemberPhone,
        amount: Number(totalAmount),
        drCr: "Debit",
        realised: isUPI,
        realisedDate: isUPI ? new Date(receiptDate) : null,
      });

      // ✅ UPI auto credit cem bank
      if (isUPI) {
        const bank = await CemBank.findById(bankId);
        if (bank) {
          bank.current_balance += Number(totalAmount);
          await bank.save();
        }
      }
    }

    res.status(201).json({
      message: "Receipt saved successfully",
      data: receipt,
    });
  } catch (error) {
    console.error("Add cem receipt error:", error);
    res.status(500).json({ message: "Failed to save receipt" });
  }
};

/* ==================================================
   LIST
================================================== */
exports.getCemReceiptList = async (req, res) => {
  try {
    const { page = 1, limit = 25, search = "", startDate, endDate } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    if (search) {
      query.$or = [
        { autoReceiptId: { $regex: search, $options: "i" } },
        { memberName: { $regex: search, $options: "i" } },
        { nonMemberName: { $regex: search, $options: "i" } },
        { "receiptLines.receiptNumber": { $regex: search, $options: "i" } },
        { "receiptLines.ledgerName": { $regex: search, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      query.receiptDate = {};
      if (startDate) query.receiptDate.$gte = new Date(startDate);
      if (endDate) query.receiptDate.$lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      CemReceipt.find(query)
        .sort({ autoReceiptId: -1 })
        .skip(skip)
        .limit(Number(limit)),
      CemReceipt.countDocuments(query),
    ]);

    res.json({
      data,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });
  } catch (err) {
    console.error("Get cem receipt list error:", err);
    res.status(500).json({ message: "Failed to fetch receipts" });
  }
};

/* ==================================================
   GET BY ID
================================================== */
exports.getCemReceiptById = async (req, res) => {
  try {
    const receipt = await CemReceipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }
    res.json({ data: receipt });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch receipt" });
  }
};
