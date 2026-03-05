const ChurchExpense = require("../Schema/ChurchExpenseSchema");
const Journal = require("../Schema/JournalSchema");

exports.getCreditorList = async (req, res) => {
  try {
    const payments = await ChurchExpense.find(
      { creditorCode: { $ne: null } },
      { creditorCode: 1, creditorName: 1 }
    );

    const journals = await Journal.find(
      { creditorId: { $ne: "" } },
      { creditorId: 1, creditorName: 1 }
    );

    const map = new Map();

    payments.forEach(p => {
      if (p.creditorCode)
        map.set(p.creditorCode, {
          id: p.creditorCode,
          name: p.creditorName
        });
    });

    journals.forEach(j => {
      if (j.creditorId)
        map.set(j.creditorId, {
          id: j.creditorId,
          name: j.creditorName
        });
    });

    res.json({ data: [...map.values()] });
  } catch (err) {
    console.error("Creditor list error", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getCreditorLedger = async (req, res) => {
  try {
    const { creditorId, startDate, endDate } = req.query;

    if (!creditorId) {
      return res.status(400).json({ message: "Creditor ID required" });
    }

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    /* ---------------- PAYMENTS (CREDIT) ---------------- */
    const payments = await ChurchExpense.find({
      creditorCode: creditorId,
      ...(startDate || endDate ? { date: dateFilter } : {})
    }).lean();

    const paymentRows = payments.map(p => ({
      date: p.date,
      tranNo: p.autoExpenseId,
      description: p.ledgerName,
      narration: p.description,
      debit: 0,
      credit: p.amount
    }));

    /* ---------------- JOURNALS (DEBIT) ---------------- */
    const journals = await Journal.find({
      creditorId,
      ...(startDate || endDate ? { date: dateFilter } : {})
    }).lean();

    const journalRows = journals.map(j => ({
      date: j.date,
      tranNo: j.autoJournalId,
      description: j.headerLedger?.ledgerName || "Journal",
      narration: j.entries.map(e => e.description).join(", "),
      debit: j.totalAmount,
      credit: 0
    }));

    /* ---------------- MERGE & SORT ---------------- */
    const rows = [...journalRows, ...paymentRows].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    /* ---------------- TOTALS ---------------- */
    const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
    const totalCredit = rows.reduce((s, r) => s + r.credit, 0);

    res.json({
      creditorId,
      rows,
      totalDebit,
      totalCredit
    });

  } catch (err) {
    console.error("Creditor report error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
