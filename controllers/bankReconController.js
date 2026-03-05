const BankRecon = require("../Schema/BankReconSchema");
const Bank = require("../Schema/bankSchema");
const Receipt = require("../Schema/ReceiptSchema");
const ChurchExpense = require("../Schema/ChurchExpenseSchema");
const CemBank = require("../Schema/cemBankSchema");
const CemReceipt = require("../Schema/CemReceiptSchema");
const CemPayment = require("../Schema/CemPaymentSchema");
const CashAccount = require("../Schema/CashAccountSchema");


exports.realiseBankEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, realisedDate, returnReason, returnDate } = req.body;

    const entry = await BankRecon.findById(id);

    if (!entry) {
      return res.status(404).json({ message: "BRS entry not found" });
    }

    const autoId = entry.autoReceiptId || "";

    const isCem = autoId.startsWith("CEM");
    const isExpense =
      autoId.startsWith("PAY") || autoId.startsWith("CEMPAY");

    /* ==================================================
       ✅ REALISE
    ================================================== */
    if (action === "Realise") {
      if (entry.realised) {
        return res.status(400).json({ message: "Already realised" });
      }

      entry.realised = true;
      entry.realisedDate = realisedDate
        ? new Date(realisedDate)
        : new Date();

      // 🔥 pick correct bank (NO LOGIC CHANGE — only routing)
      let bank = null;

      if (isCem) {
        bank = await CemBank.findById(entry.bankId);
      } else {
        bank = await Bank.findById(entry.bankId);
      }

      if (!bank) {
        return res.status(404).json({ message: "Bank not found" });
      }

      // 🔴 EXPENSE → reduce bank
      // if (isExpense) {
      //   if (bank.current_balance < Number(entry.amount)) {
      //     return res.status(400).json({
      //       message: "Insufficient bank balance",
      //     });
      //   }

      //   bank.current_balance -= Number(entry.amount);
      // }

      // 🔴 EXPENSE → reduce bank
if (isExpense) {
  if (bank.current_balance < Number(entry.amount)) {
    return res.status(400).json({
      message: "Insufficient bank balance",
    });
  }

  bank.current_balance -= Number(entry.amount);

  /* ==================================================
     🔥 HANDLE BANK → CASH TRANSFER (VERY IMPORTANT)
  ================================================== */

  try {
    // detect source document
    let expenseDoc = null;

    if (autoId.startsWith("PAY")) {
      expenseDoc = await ChurchExpense.findById(entry.receiptId).lean();
    } else if (autoId.startsWith("CEMPAY")) {
      expenseDoc = await CemPayment.findById(entry.receiptId).lean();
    }

    if (expenseDoc?.expenseLines?.length) {
      const cashLine = expenseDoc.expenseLines.find(
        (l) => l.ledgerCategoryName === "Cash A/C"
      );

      if (cashLine) {
        const cashAccount = await CashAccount.findOne({
          account_type: cashLine.ledgerName, // ✅ Petty Cash A/c
        });

        if (cashAccount) {
          cashAccount.current_balance += Number(cashLine.amount);
          await cashAccount.save();
        }
      }
    }
  } catch (err) {
    console.error("Cash transfer adjust error:", err);
  }
}
      // 🟢 RECEIPT → increase bank
      else {
        bank.current_balance += Number(entry.amount);
      }

      await bank.save();
    }

    /* ==================================================
       ❌ RETURN
    ================================================== */
    if (action === "Return") {
      entry.returned = true;
      entry.returnReason = returnReason || "";
      entry.realisedDate = returnDate ? new Date(returnDate) : null;

      const isChurchExpense = autoId.startsWith("PAY");
      const isChurchReceipt = autoId.startsWith("REC");
      const isCemExpense = autoId.startsWith("CEMPAY");
      const isCemReceipt = autoId.startsWith("CEMREC");

      // 🔴 CHURCH EXPENSE
      if (isChurchExpense) {
        await ChurchExpense.findByIdAndUpdate(entry.receiptId, {
          expenseReturned: true,
          expenseReturnDate: returnDate
            ? new Date(returnDate)
            : null,
          expenseReturnReason: returnReason || "",
        });
      }

      // 🟢 CHURCH RECEIPT
      else if (isChurchReceipt) {
        await Receipt.findByIdAndUpdate(entry.receiptId, {
          receiptReturned: true,
          receiptReturnDate: returnDate
            ? new Date(returnDate)
            : null,
          receiptReturnReason: returnReason || "",
        });
      }

      // 🔴 CEM EXPENSE
      else if (isCemExpense) {
        await CemPayment.findByIdAndUpdate(entry.receiptId, {
          expenseReturned: true,
          expenseReturnDate: returnDate
            ? new Date(returnDate)
            : null,
          expenseReturnReason: returnReason || "",
        });
      }

      // 🟢 CEM RECEIPT
      else if (isCemReceipt) {
        await CemReceipt.findByIdAndUpdate(entry.receiptId, {
          receiptReturned: true,
          receiptReturnDate: returnDate
            ? new Date(returnDate)
            : null,
          receiptReturnReason: returnReason || "",
        });
      }
    }

    await entry.save();

    res.status(200).json({
      message: "BRS updated successfully",
      data: entry,
    });
  } catch (err) {
    console.error("BRS realise error:", err);
    res.status(500).json({ message: "Failed to update BRS" });
  }
};

// exports.getBankReconList = async (req, res) => {
//   try {
//     const { bankId, method, search = "", tab, startDate, endDate } = req.query;

//     const query = {
//       realised: false,
//       returned: false,
//     };

//     // 🔥 TAB FILTERING
//     if (tab === "Add") {
//       // 🟢 only receipts
//       query.autoReceiptId = { $regex: "^REC" };
//     }

//     if (tab === "Less") {
//       // 🔴 only expenses
//       query.autoReceiptId = { $regex: "^PAY" };
//     }

//     // 📅 DATE FILTER
//     if (startDate || endDate) {
//       query.receiptDate = {};

//       if (startDate) {
//         query.receiptDate.$gte = new Date(startDate);
//       }

//       if (endDate) {
//         // include full end day
//         const end = new Date(endDate);
//         end.setHours(23, 59, 59, 999);
//         query.receiptDate.$lte = end;
//       }
//     }



//     if (bankId) query.bankId = bankId;
//     if (method && method !== "All") query.paymentMethod = method;

//     if (search) {
//       query.$or = [
//         { autoReceiptId: { $regex: search, $options: "i" } },
//         { partyName: { $regex: search, $options: "i" } },
//         { chequeNumber: { $regex: search, $options: "i" } },
//         { upiId: { $regex: search, $options: "i" } },
//       ];
//     }

//     const data = await BankRecon.find(query)
//       .sort({ receiptDate: -1 })
//       .lean();

//     res.status(200).json({ data });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch BRS" });
//   }
// };
exports.getBankReconList = async (req, res) => {
  try {
    const { bankId, method, search = "", tab, startDate, endDate } = req.query;

    const query = {
      realised: false,
      returned: false,
    };

    /* ==================================================
       🔥 TAB FILTERING (UPDATED FOR CEMETERY)
    ================================================== */

    // 🟢 RECEIPTS (Add tab)
    if (tab === "Add") {
      query.$or = [
        { autoReceiptId: { $regex: "^REC" } },     // church receipt
        { autoReceiptId: { $regex: "^CEMREC" } },  // cemetery receipt
      ];
    }

    // 🔴 PAYMENTS (Less tab)
    if (tab === "Less") {
      query.$or = [
        { autoReceiptId: { $regex: "^PAY" } },      // church payment
        { autoReceiptId: { $regex: "^CEMPAY" } },   // cemetery payment
      ];
    }

    /* ==================================================
       📅 DATE FILTER
    ================================================== */
    if (startDate || endDate) {
      query.receiptDate = {};

      if (startDate) {
        query.receiptDate.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.receiptDate.$lte = end;
      }
    }

    /* ==================================================
       🔽 OTHER FILTERS (UNCHANGED)
    ================================================== */

    if (bankId) query.bankId = bankId;

    if (method && method !== "All") {
      query.paymentMethod = method;
    }

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { autoReceiptId: { $regex: search, $options: "i" } },
          { partyName: { $regex: search, $options: "i" } },
          { chequeNumber: { $regex: search, $options: "i" } },
          { upiId: { $regex: search, $options: "i" } },
        ],
      });
    }

    /* ==================================================
       🚀 FETCH
    ================================================== */

    const data = await BankRecon.find(query)
      .sort({ receiptDate: -1 })
      .lean();

    res.status(200).json({ data });
  } catch (err) {
    console.error("BRS list error:", err);
    res.status(500).json({ message: "Failed to fetch BRS" });
  }
};

exports.getBankReconReport = async (req, res) => {
  try {
    const { bankId, method, search = "", startDate, endDate } = req.query;

    // ✅ ONLY COMPLETED (NO PENDING)
    const query = {
      $and: [
        {
          $or: [{ realised: true }, { returned: true }],
        },
      ],
    };


    // 📅 DATE FILTER
    // 📅 DATE FILTER
    if (startDate || endDate) {
      const dateFilter = {};

      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }

      query.$and.push({ receiptDate: dateFilter });
    }


    if (bankId) query.bankId = bankId;
    if (method && method !== "All") query.paymentMethod = method;

    if (search) {
      query.$and.push({
        $or: [
          { autoReceiptId: { $regex: search, $options: "i" } },
          { partyName: { $regex: search, $options: "i" } },
          { chequeNumber: { $regex: search, $options: "i" } },
          { upiId: { $regex: search, $options: "i" } },
        ],
      });
    }


    const data = await BankRecon.find(query)
      .sort({ receiptDate: -1 })
      .lean();

    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch BRS report" });
  }
};

