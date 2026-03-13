const mongoose = require("mongoose");
const Receipt = require("../Schema/ReceiptSchema");
const HarvestAuction = require("../Schema/HarvestAuction");
const HarvestAuctionPayment = require("../Schema/HarvestAuctionPayment");
const Counter = require("../Schema/CounterSchema");
const Bank = require("../Schema/bankSchema");
const CashAccount = require("../Schema/CashAccountSchema");
const BankRecon = require("../Schema/BankReconSchema");
const ReceiptTransCounter = require("../Schema/ReceiptTransCounter");
const { generateNextReceiptId } = require("../util/generateReceiptId");


exports.addReceipt = async (req, res) => {
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

    /* --------------------------------------------------
       1️⃣ BASIC VALIDATIONS
    -------------------------------------------------- */

    if (!receiptDate || !paymentMethod) {
      return res.status(400).json({ message: "Receipt date and payment method are required" });
    }

    if (!Array.isArray(receiptLines) || receiptLines.length === 0) {
      return res.status(400).json({ message: "At least one receipt line is required" });
    }

    if (!totalAmount || Number(totalAmount) <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    /* --------------------------------------------------
       2️⃣ PAYMENT METHOD VALIDATIONS
    -------------------------------------------------- */

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

    /* --------------------------------------------------
       3️⃣ CASH / BANK BALANCE UPDATE
       🔥 SAME LOGIC — JUST USE totalAmount
    -------------------------------------------------- */

    // 🟢 CASH
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



    /* --------------------------------------------------
       4️⃣ GENERATE RECEIPT ID
    -------------------------------------------------- */


    const counter = await Counter.findOneAndUpdate(
      { name: "receipt" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    const autoReceiptId = "REC" + String(counter.seq).padStart(4, "0");

    /* --------------------------------------------------
   🔥 GENERATE DATE-WISE TRANS NO
-------------------------------------------------- */

    // format date key → YYYY-MM-DD
    const dateObj = new Date(receiptDate);
    const dateKey = dateObj.toISOString().split("T")[0];

    // atomic increment per date
    const transCounter = await ReceiptTransCounter.findOneAndUpdate(
      { dateKey },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    // format → 0001, 0002...
    const transNo = String(transCounter.seq).padStart(4, "0");

    /* --------------------------------------------------
       5️⃣ BUILD RECEIPT PAYLOAD
    -------------------------------------------------- */

    const receiptPayload = {
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

      receiptLines: receiptLines.map((row) => ({
        receiptNumber: row.receiptNumber || "",
        ledgerName: row.ledgerName,
        ledgerCode: row.ledgerCode,
        ledgerCategoryName: row.ledgerCategoryName,
        accountType: row.accountType,
        incomeType: row.incomeType || null,
        amount: Number(row.amount),
        description: row.description || "",
        isMember: row.isMember ?? true,
        memberId: row.memberId || "",
        memberName: row.memberName || "",
        phone: row.phone || "",
        nonMemberName: row.nonMemberName || "",
        nonMemberPhone: row.nonMemberPhone || "",
      })),


      createdBy: req.user?._id,
    };


    const receipt = await Receipt.create(receiptPayload);

    /* --------------------------------------------------
   7️⃣ CREATE BANK RECON ENTRY (Cheque / UPI)
-------------------------------------------------- */

    // if (paymentMethod === "Cheque" || paymentMethod === "UPI Payment") {
    //   const partyName = isMember ? memberName : nonMemberName;
    //   const partyPhone = isMember ? phone : nonMemberPhone;

    //   const isUPI = paymentMethod === "UPI Payment";

    //   // 🔥 create BRS row
    //   const recon = await BankRecon.create({
    //     receiptId: receipt._id,
    //     autoReceiptId: receipt.autoReceiptId,
    //     receiptDate: new Date(receiptDate),

    //     paymentMethod,
    //     chequeNumber,
    //     chequeDate: chequeDate ? new Date(chequeDate) : null,
    //     upiId,

    //     bankId,
    //     bankName,

    //     partyName,
    //     phone: partyPhone,
    //     amount: Number(totalAmount),
    //     drCr: "Debit",

    //     realised: isUPI, // ✅ auto realise for UPI
    //     realisedDate: isUPI ? new Date(receiptDate) : null,
    //   });

    //   /* -----------------------------------------
    //      🔥 AUTO CREDIT BANK FOR UPI ONLY
    //   ----------------------------------------- */

    //   if (isUPI) {
    //     const bank = await Bank.findById(bankId);
    //     if (bank) {
    //       bank.current_balance += Number(totalAmount);
    //       await bank.save();
    //     }
    //   }
    // }

    /* --------------------------------------------------
       7️⃣ CREATE BANK RECON ENTRY (Cheque / UPI)
    -------------------------------------------------- */
    if (paymentMethod === "Cheque" || paymentMethod === "UPI Payment") {

      // 🔹 top-level party
      const partyFromTop = isMember ? memberName : nonMemberName;
      const phoneFromTop = isMember ? phone : nonMemberPhone;

      // 🔹 fallback from receipt lines
      let fallbackParty = "";
      let fallbackPhone = "";

      for (const rl of receipt.receiptLines || []) {
        if (!fallbackParty && rl.nonMemberName) fallbackParty = rl.nonMemberName;
        if (!fallbackParty && rl.memberName) fallbackParty = rl.memberName;

        if (!fallbackPhone && rl.nonMemberPhone) fallbackPhone = rl.nonMemberPhone;
        if (!fallbackPhone && rl.phone) fallbackPhone = rl.phone;

        if (fallbackParty && fallbackPhone) break;
      }

      const partyName =
        partyFromTop?.trim() || fallbackParty || "Receipt";

      const partyPhone =
        phoneFromTop?.trim() || fallbackPhone || "";

      const isUPI = paymentMethod === "UPI Payment";

      // ✅ CREATE BRS
      await BankRecon.create({
        receiptId: receipt._id,
        autoReceiptId: receipt.autoReceiptId,
        transNo: receipt.transNo || "",   // ⭐ IMPORTANT
        receiptDate: new Date(receiptDate),

        paymentMethod,
        chequeNumber,
        chequeDate: chequeDate ? new Date(chequeDate) : null,
        upiId,

        bankId,
        bankName,

        partyName,
        phone: partyPhone,
        amount: Number(totalAmount),
        drCr: "Debit",

        realised: isUPI,
        realisedDate: isUPI ? new Date(receiptDate) : null,
      });

      /* 🔥 AUTO CREDIT BANK FOR UPI */
      if (isUPI) {
        const bank = await Bank.findById(bankId);
        if (bank) {
          bank.current_balance += Number(totalAmount);
          await bank.save();
        }
      }
    }

    /* --------------------------------------------------
       6️⃣ HARVEST AUCTION SETTLEMENT
       (UNCHANGED LOGIC — USE TOTAL)
    -------------------------------------------------- */

    const harvestLine = receiptLines.find(
      (r) => r.ledgerCode === "L0008"
    );


    if (harvestLine) {
      let remainingAmount = Number(harvestLine.amount);
      const source = "Receipt";

      // ⭐ get buyer from harvest line (inline)
      const isMemberBuyer = harvestLine.isMember;

      const buyerId = isMemberBuyer
        ? harvestLine.memberId
        : null;

      const buyerName = isMemberBuyer
        ? harvestLine.memberName
        : harvestLine.nonMemberName;

      const buyerPhone = isMemberBuyer
        ? harvestLine.phone
        : harvestLine.nonMemberPhone;

      // ✅ validation
      if (!buyerName) {
        return res.status(400).json({
          message: "Buyer details required for auction receipt",
        });
      }


      const unpaidAuctions = await HarvestAuction.find({
        buyerId: buyerId,
        balance: { $gt: 0 },
      }).sort({ date: 1 });

      for (const auction of unpaidAuctions) {
        if (remainingAmount <= 0) break;

        const payAmount = Math.min(remainingAmount, auction.balance);

        auction.totalPaid += payAmount;
        auction.balance = auction.amount - auction.totalPaid;
        auction.payment_status = auction.balance <= 0 ? "Paid" : "Unpaid";

        auction.payments.push({
          amountPaid: payAmount,
          date: new Date(receiptDate),
          balanceAfter: auction.balance,
          source,
          receiptId: receipt._id,
        });

        await auction.save();

        await HarvestAuctionPayment.create({
          receiptId: receipt._id,
          harvestAuctionId: auction._id,
          buyerId: auction.buyerId,
          buyerName: buyerName,
          buyerPhone: buyerPhone || "N/A",
          sellerId: auction.sellerId || "",
          sellerName: auction.sellerName || "",
          item: auction.item,
          amountPaid: payAmount,
          balanceAfter: auction.balance,
          source,
          date: new Date(receiptDate),
        });

        remainingAmount -= payAmount;
      }
    }

    /* -------------------------------------------------- */

    res.status(201).json({
      message: "Receipt saved successfully",
      data: receipt,
    });
  } catch (error) {
    console.error("Add receipt error:", error);
    res.status(500).json({
      message: "Failed to save receipt",
    });
  }
};

exports.getReceiptList = async (req, res) => {
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

    // 🔍 Search by Receipt For (subcategory)
    if (search) {
      query.$or = [
        { autoReceiptId: { $regex: search, $options: "i" } },
        { memberName: { $regex: search, $options: "i" } },
        { nonMemberName: { $regex: search, $options: "i" } },
        { "receiptLines.receiptNumber": { $regex: search, $options: "i" } },
        { "receiptLines.ledgerName": { $regex: search, $options: "i" } },
        { "receiptLines.ledgerCode": { $regex: search, $options: "i" } },
        { "receiptLines.ledgerCategoryName": { $regex: search, $options: "i" } }
      ];
    }


    // 📅 Date filter
    if (startDate || endDate) {
      query.receiptDate = {};
      if (startDate) query.receiptDate.$gte = new Date(startDate);
      if (endDate) query.receiptDate.$lte = new Date(endDate);
    }

    const [receipts, total] = await Promise.all([
      Receipt.find(query, {
        autoReceiptId: 1,
        transNo: 1,
        receiptNumber: 1,
        receiptLines: 1,
        totalAmount: 1,
        receiptDate: 1,
        isMember: 1,
        memberName: 1,
        nonMemberName: 1,
      })
        .sort({ receiptDate: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Receipt.countDocuments(query),
    ]);


    res.status(200).json({
      data: receipts,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });
  } catch (error) {
    console.error("Get receipt list error:", error);
    res.status(500).json({
      message: "Failed to fetch receipts",
    });
  }
};

exports.getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    res.status(200).json({ data: receipt });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch receipt" });
  }
};

exports.splitSundayReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const { splitLines } = req.body;

    if (!Array.isArray(splitLines) || splitLines.length === 0) {
      return res.status(400).json({ message: "Split lines required" });
    }

    const receipt = await Receipt.findById(id);
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    // 🔎 Find Sunday Receipt line
    const sundayLine = receipt.receiptLines.find(
      (l) => l.ledgerCode === "I0033" // Sunday Receipts
    );

    if (!sundayLine) {
      return res.status(400).json({ message: "Sunday Receipt not found" });
    }

    const sundayAmount = Number(sundayLine.amount);

    // 🔢 Validate split total
    const splitTotal = splitLines.reduce(
      (sum, l) => sum + Number(l.amount || 0),
      0
    );

    if (splitTotal !== sundayAmount) {
      return res.status(400).json({
        message: "Split total must equal Sunday Receipt amount",
      });
    }

    // ❌ Remove Sunday Receipt line
    receipt.receiptLines = receipt.receiptLines.filter(
      (l) => l.ledgerCode !== "I0033"
    );

    // ➕ Add split lines
    receipt.receiptLines.push(
      ...splitLines.map((l) => ({
        ledgerName: l.ledgerName,
        ledgerCode: l.ledgerCode,
        ledgerCategoryName: l.ledgerCategoryName,
        accountType: l.accountType,
        incomeType: l.incomeType || null,
        amount: Number(l.amount),
        description: l.description || "",
      }))
    );

    // 🔒 totalAmount remains untouched
    await receipt.save();

    res.status(200).json({
      message: "Sunday receipt split successfully",
      data: receipt,
    });
  } catch (err) {
    console.error("Split Sunday error:", err);
    res.status(500).json({ message: "Failed to split Sunday receipt" });
  }
};

// exports.updateReceipt = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     const { id } = req.params;

//     const existingReceipt = await Receipt.findById(id).session(session);
//     if (!existingReceipt) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ message: "Receipt not found" });
//     }

//     const {
//       receiptDate,
//       paymentMethod,
//       chequeNumber,
//       chequeDate,
//       payerBankName,
//       bankId,
//       bankName,
//       bankAccountNumber,
//       upiId,
//       totalAmount,
//       receiptLines,
//     } = req.body;

//     /* ==================================================
//        🔴 STEP 1 — REVERSE OLD CASH/BANK EFFECTS
//     ================================================== */

//     // 🔥 Reverse cash
//     if (existingReceipt.paymentMethod === "Cash") {
//       const cashAccount = await CashAccount.findOne({
//         account_type: "Cash on Hand A/c",
//       }).session(session);

//       if (cashAccount) {
//         cashAccount.current_balance -= Number(existingReceipt.totalAmount);
//         await cashAccount.save({ session });
//       }
//     }

//     // 🔥 Reverse UPI bank
//     if (
//       existingReceipt.paymentMethod === "UPI Payment" &&
//       existingReceipt.bankId
//     ) {
//       const bank = await Bank.findById(existingReceipt.bankId).session(session);
//       if (bank) {
//         bank.current_balance -= Number(existingReceipt.totalAmount);
//         await bank.save({ session });
//       }
//     }

//     // 🔥 Remove old BRS
//     await BankRecon.deleteMany({
//       receiptId: existingReceipt._id,
//     }).session(session);

// /* ==================================================
//    🔴 STEP 1B — REVERSE HARVEST (BULLETPROOF)
// ================================================== */

// const oldReceiptId = existingReceipt._id;

// // 🔹 get payments created by this receipt
// const oldPayments = await HarvestAuctionPayment.find({
//   receiptId: oldReceiptId,
// }).session(session);

// for (const payment of oldPayments) {
//   const auction = await HarvestAuction.findById(
//     payment.harvestAuctionId
//   ).session(session);

//   if (!auction) continue;

//   // ✅ remove matching embedded payment by amount + date + source
//   auction.payments = auction.payments.filter((p) => {
//     const sameSource = p.source === "Receipt";
//     const sameAmount =
//       Number(p.amountPaid) === Number(payment.amountPaid);
//     const sameDate =
//       new Date(p.date).getTime() ===
//       new Date(payment.date).getTime();

//     // remove only exact match
//     return !(sameSource && sameAmount && sameDate);
//   });

//   // ✅ recompute totals safely
//   auction.totalPaid = auction.payments.reduce(
//     (sum, p) => sum + Number(p.amountPaid || 0),
//     0
//   );

//   auction.balance = auction.amount - auction.totalPaid;
//   auction.payment_status =
//     auction.balance <= 0 ? "Paid" : "Unpaid";

//   await auction.save({ session });
// }

// // ✅ delete payment rows
// await HarvestAuctionPayment.deleteMany({
//   receiptId: oldReceiptId,
// }).session(session);

//     /* ==================================================
//        🟢 STEP 2 — UPDATE RECEIPT DOCUMENT
//     ================================================== */

//     existingReceipt.receiptDate = new Date(receiptDate);
//     existingReceipt.paymentMethod = paymentMethod;
//     existingReceipt.chequeNumber =
//       paymentMethod === "Cheque" ? chequeNumber : "";
//     existingReceipt.chequeDate =
//       paymentMethod === "Cheque" && chequeDate
//         ? new Date(chequeDate)
//         : null;
//     existingReceipt.payerBankName =
//       paymentMethod === "Cheque" ? payerBankName || "" : "";

//     existingReceipt.bankId =
//       paymentMethod !== "Cash" ? bankId || null : null;
//     existingReceipt.bankName =
//       paymentMethod !== "Cash" ? bankName || "" : "";
//     existingReceipt.bankAccountNumber =
//       paymentMethod !== "Cash" ? bankAccountNumber || "" : "";
//     existingReceipt.upiId =
//       paymentMethod === "UPI Payment" ? upiId || "" : "";

//     existingReceipt.totalAmount = Number(totalAmount);

//     existingReceipt.receiptLines = receiptLines.map((row) => ({
//       receiptNumber: row.receiptNumber || "",
//       ledgerName: row.ledgerName,
//       ledgerCode: row.ledgerCode,
//       ledgerCategoryName: row.ledgerCategoryName,
//       accountType: row.accountType,
//       incomeType: row.incomeType || null,
//       amount: Number(row.amount),
//       description: row.description || "",
//       isMember: row.isMember ?? true,
//       memberId: row.memberId || "",
//       memberName: row.memberName || "",
//       phone: row.phone || "",
//       nonMemberName: row.nonMemberName || "",
//       nonMemberPhone: row.nonMemberPhone || "",
//     }));

//     await existingReceipt.save({ session });

//     /* ==================================================
//        🟢 STEP 3 — APPLY NEW CASH/BANK EFFECTS
//     ================================================== */

//     // ✅ Cash add
//     if (paymentMethod === "Cash") {
//       const cashAccount = await CashAccount.findOne({
//         account_type: "Cash on Hand A/c",
//       }).session(session);

//       if (cashAccount) {
//         cashAccount.current_balance += Number(totalAmount);
//         await cashAccount.save({ session });
//       }
//     }

//     // ✅ Bank recon
//     if (paymentMethod === "Cheque" || paymentMethod === "UPI Payment") {
//       const isUPI = paymentMethod === "UPI Payment";

//       /* ---------- PARTY RESOLUTION ---------- */

//       let partyName = "";
//       let partyPhone = "";

//       const harvestLineNew = existingReceipt.receiptLines.find(
//         (l) => l.ledgerCode === "L0008"
//       );

//       if (harvestLineNew) {
//         if (harvestLineNew.isMember && harvestLineNew.memberName) {
//           partyName = harvestLineNew.memberName.trim();
//           partyPhone = harvestLineNew.phone || "";
//         } else if (harvestLineNew.nonMemberName) {
//           partyName = harvestLineNew.nonMemberName.trim();
//           partyPhone = harvestLineNew.nonMemberPhone || "";
//         }
//       }

//       if (!partyName) {
//         const firstValid = existingReceipt.receiptLines.find(
//           (l) =>
//             (l.isMember && l.memberName) ||
//             (!l.isMember && l.nonMemberName)
//         );

//         if (firstValid) {
//           if (firstValid.isMember) {
//             partyName = firstValid.memberName.trim();
//             partyPhone = firstValid.phone || "";
//           } else {
//             partyName = firstValid.nonMemberName.trim();
//             partyPhone = firstValid.nonMemberPhone || "";
//           }
//         }
//       }

//       if (!partyName) {
//         await session.abortTransaction();
//         session.endSession();
//         return res.status(400).json({
//           message:
//             "Party name could not be resolved from receipt lines.",
//         });
//       }

//       await BankRecon.create(
//         [
//           {
//             receiptId: existingReceipt._id,
//             autoReceiptId: existingReceipt.autoReceiptId,
//             transNo: existingReceipt.transNo,
//             receiptDate: new Date(receiptDate),
//             paymentMethod,
//             chequeNumber,
//             chequeDate: chequeDate ? new Date(chequeDate) : null,
//             upiId,
//             bankId,
//             bankName,
//             partyName,
//             phone: partyPhone,
//             amount: Number(totalAmount),
//             drCr: "Debit",
//             realised: isUPI,
//             realisedDate: isUPI ? new Date(receiptDate) : null,
//           },
//         ],
//         { session }
//       );

//       // 🔥 UPI instant credit
//       if (isUPI && bankId) {
//         const bank = await Bank.findById(bankId).session(session);
//         if (bank) {
//           bank.current_balance += Number(totalAmount);
//           await bank.save({ session });
//         }
//       }
//     }
exports.updateReceipt = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;

    const existingReceipt = await Receipt.findById(id).session(session);
    if (!existingReceipt) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Receipt not found" });
    }

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
    } = req.body;

    /* ==================================================
       🔴 STEP 1 — REVERSE OLD CASH/BANK EFFECTS
    ================================================== */

    // 🔥 Reverse Cash
    if (existingReceipt.paymentMethod === "Cash") {
      const cashAccount = await CashAccount.findOne({
        account_type: "Cash on Hand A/c",
      }).session(session);

      if (cashAccount) {
        cashAccount.current_balance -= Number(existingReceipt.totalAmount);
        await cashAccount.save({ session });
      }
    }

    // 🔥 Reverse UPI ONLY (not cheque)
    if (
      existingReceipt.paymentMethod === "UPI Payment" &&
      existingReceipt.bankId
    ) {
      const bank = await Bank.findById(existingReceipt.bankId).session(session);
      if (bank) {
        bank.current_balance -= Number(existingReceipt.totalAmount);
        await bank.save({ session });
      }
    }

    // 🔥 Remove old BRS
    await BankRecon.deleteMany({
      receiptId: existingReceipt._id,
    }).session(session);

    /* ==================================================
       🔴 STEP 1B — REVERSE HARVEST (RECEIPT SPECIFIC)
    ================================================== */

    const oldReceiptId = existingReceipt._id;

    const oldPayments = await HarvestAuctionPayment.find({
      receiptId: oldReceiptId,
    }).session(session);

    for (const payment of oldPayments) {
      const auction = await HarvestAuction.findById(
        payment.harvestAuctionId
      ).session(session);

      if (!auction) continue;

      // remove only exact match
      auction.payments = auction.payments.filter((p) => {
        const sameReceipt =
          String(p.receiptId || "") === String(oldReceiptId);
        const sameAmount =
          Number(p.amountPaid) === Number(payment.amountPaid);

        return !(sameReceipt && sameAmount);
      });

      // recompute totals safely
      auction.totalPaid = auction.payments.reduce(
        (sum, p) => sum + Number(p.amountPaid || 0),
        0
      );

      auction.balance = auction.amount - auction.totalPaid;
      auction.payment_status =
        auction.balance <= 0 ? "Paid" : "Unpaid";

      await auction.save({ session });
    }

    await HarvestAuctionPayment.deleteMany({
      receiptId: oldReceiptId,
    }).session(session);

    /* ==================================================
       🟢 STEP 2 — UPDATE RECEIPT
    ================================================== */

    existingReceipt.receiptDate = new Date(receiptDate);
    existingReceipt.paymentMethod = paymentMethod;
    existingReceipt.chequeNumber =
      paymentMethod === "Cheque" ? chequeNumber : "";
    existingReceipt.chequeDate =
      paymentMethod === "Cheque" && chequeDate
        ? new Date(chequeDate)
        : null;
    existingReceipt.payerBankName =
      paymentMethod === "Cheque" ? payerBankName || "" : "";

    existingReceipt.bankId =
      paymentMethod !== "Cash" ? bankId || null : null;
    existingReceipt.bankName =
      paymentMethod !== "Cash" ? bankName || "" : "";
    existingReceipt.bankAccountNumber =
      paymentMethod !== "Cash" ? bankAccountNumber || "" : "";
    existingReceipt.upiId =
      paymentMethod === "UPI Payment" ? upiId || "" : "";

    existingReceipt.totalAmount = Number(totalAmount);

    existingReceipt.receiptLines = receiptLines.map((row) => ({
      receiptNumber: row.receiptNumber || "",
      ledgerName: row.ledgerName,
      ledgerCode: row.ledgerCode,
      ledgerCategoryName: row.ledgerCategoryName,
      accountType: row.accountType,
      incomeType: row.incomeType || null,
      amount: Number(row.amount),
      description: row.description || "",
      isMember: row.isMember ?? true,
      memberId: row.memberId || "",
      memberName: row.memberName || "",
      phone: row.phone || "",
      nonMemberName: row.nonMemberName || "",
      nonMemberPhone: row.nonMemberPhone || "",
    }));

    await existingReceipt.save({ session });

    /* ==================================================
       🟢 STEP 3 — APPLY NEW CASH/BANK EFFECTS
    ================================================== */

    // ✅ Cash add
    if (paymentMethod === "Cash") {
      const cashAccount = await CashAccount.findOne({
        account_type: "Cash on Hand A/c",
      }).session(session);

      if (cashAccount) {
        cashAccount.current_balance += Number(totalAmount);
        await cashAccount.save({ session });
      }
    }

    // ✅ Cheque / UPI → create BRS
    if (paymentMethod === "Cheque" || paymentMethod === "UPI Payment") {
      const isUPI = paymentMethod === "UPI Payment";

      /* ---------- PARTY RESOLUTION ---------- */

      let partyName = "";
      let partyPhone = "";

      const harvestLineNew = existingReceipt.receiptLines.find(
        (l) => l.ledgerCode === "L0008"
      );

      if (harvestLineNew) {
        if (harvestLineNew.isMember && harvestLineNew.memberName) {
          partyName = harvestLineNew.memberName.trim();
          partyPhone = harvestLineNew.phone || "";
        } else if (harvestLineNew.nonMemberName) {
          partyName = harvestLineNew.nonMemberName.trim();
          partyPhone = harvestLineNew.nonMemberPhone || "";
        }
      }

      if (!partyName) {
        const firstValid = existingReceipt.receiptLines.find(
          (l) =>
            (l.isMember && l.memberName) ||
            (!l.isMember && l.nonMemberName)
        );

        if (firstValid) {
          if (firstValid.isMember) {
            partyName = firstValid.memberName.trim();
            partyPhone = firstValid.phone || "";
          } else {
            partyName = firstValid.nonMemberName.trim();
            partyPhone = firstValid.nonMemberPhone || "";
          }
        }
      }

      if (!partyName) {
        partyName = "Receipt";
        partyPhone = "";
      }

      // ✅ CREATE BRS
      await BankRecon.create(
        [
          {
            receiptId: existingReceipt._id,
            autoReceiptId: existingReceipt.autoReceiptId,
            transNo: existingReceipt.transNo,
            receiptDate: new Date(receiptDate),
            paymentMethod,
            chequeNumber,
            chequeDate: chequeDate ? new Date(chequeDate) : null,
            upiId,
            bankId,
            bankName,
            partyName,
            phone: partyPhone,
            amount: Number(totalAmount),
            drCr: "Debit",
            realised: isUPI,
            realisedDate: isUPI ? new Date(receiptDate) : null,
          },
        ],
        { session }
      );

      // 🔥 ONLY UPI → credit bank
      if (isUPI && bankId) {
        const bank = await Bank.findById(bankId).session(session);
        if (bank) {
          bank.current_balance += Number(totalAmount);
          await bank.save({ session });
        }
      }
    }

    /* ==================================================
       🟢 STEP 3B — APPLY NEW HARVEST SETTLEMENT
    ================================================== */

    const newHarvestLine = existingReceipt.receiptLines.find(
      (r) => r.ledgerCode === "L0008"
    );

    if (newHarvestLine) {
      let remainingAmount = Number(newHarvestLine.amount);
      const receiptIdRef = existingReceipt._id;
      const source = "Receipt";

      const isMemberBuyer = newHarvestLine.isMember;

      const buyerId = isMemberBuyer
        ? newHarvestLine.memberId
        : null;

      const buyerName = isMemberBuyer
        ? newHarvestLine.memberName
        : newHarvestLine.nonMemberName;

      const buyerPhone = isMemberBuyer
        ? newHarvestLine.phone
        : newHarvestLine.nonMemberPhone;

      const unpaidAuctions = await HarvestAuction.find({
        buyerId,
        balance: { $gt: 0 },
      })
        .sort({ date: 1 })
        .session(session);

      for (const auction of unpaidAuctions) {
        if (remainingAmount <= 0) break;

        const payAmount = Math.min(remainingAmount, auction.balance);

        auction.totalPaid += payAmount;
        auction.balance = auction.amount - auction.totalPaid;
        auction.payment_status =
          auction.balance <= 0 ? "Paid" : "Unpaid";

        auction.payments.push({
          amountPaid: payAmount,
          date: new Date(receiptDate),
          balanceAfter: auction.balance,
          source,
          receiptId: receiptIdRef,
        });

        await auction.save({ session });

        await HarvestAuctionPayment.create(
          [
            {
              harvestAuctionId: auction._id,
              receiptId: receiptIdRef,
              buyerId,
              buyerName,
              buyerPhone: buyerPhone || "N/A",
              sellerId: auction.sellerId || "",
              sellerName: auction.sellerName || "",
              item: auction.item,
              amountPaid: payAmount,
              balanceAfter: auction.balance,
              source,
              date: new Date(receiptDate),
            },
          ],
          { session }
        );

        remainingAmount -= payAmount;
      }
    }

    /* ================================================== */

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Receipt updated successfully",
      data: existingReceipt,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Update receipt error:", error);
    res.status(500).json({ message: "Failed to update receipt" });
  }
};

// controllers/receiptController.js

exports.getReceiptDownloadData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "Start date and end date are required",
      });
    }

    const receipts = await Receipt.find({
      receiptDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .sort({ receiptDate: 1 })
      .select(
        "autoReceiptId receiptDate transNo receiptLines totalAmount paymentMethod bankName"
      );

    const formatted = receipts.map((rec, index) => ({
      slNo: index + 1,
      autoReceiptId: rec.autoReceiptId,
      date: rec.receiptDate,
      transNo: rec.transNo,
      receiptNumbers: (rec.receiptLines || [])
        .map((l) => l.receiptNumber)
        .filter(Boolean)
        .join(", "),
      amount: rec.totalAmount,
      paymentMethod: rec.paymentMethod,
      bankName: rec.bankName || "",
    }));

    res.status(200).json({
      data: formatted,
    });
  } catch (error) {
    console.error("Download receipt data error:", error);
    res.status(500).json({
      message: "Failed to fetch receipt download data",
    });
  }
};