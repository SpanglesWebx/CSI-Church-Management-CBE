const CemJournal = require("../Schema/CemJournalSchema");
const Counter = require("../Schema/CounterSchema");
const ReceiptTransCounter = require("../Schema/ReceiptTransCounter");

/* ==================================================
   ➕ ADD CEM JOURNAL
================================================== */

exports.addCemJournal = async (req, res) => {
  try {
    const {
      date,
      accType,
      headerLedger,
      creditorId,
      creditorName,
      creditorPhone,
      entries,
      totalAmount,
    } = req.body;

    if (!date || !accType || !entries?.length || !totalAmount) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    /* 🔢 SAME COUNTER LOGIC (separate name) */
    const counter = await Counter.findOneAndUpdate(
      { name: "cem_journal" }, // ✅ cemetery counter
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const autoJournalId =
      "CEMJRN" + String(counter.seq).padStart(4, "0");

      /* --------------------------------------------------
   🔥 GENERATE DATE-WISE JOURNAL TRANS NO
-------------------------------------------------- */

// IST-safe date key
const dateKey = new Date(date)
  .toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

// atomic increment (separate namespace)
const transCounter = await ReceiptTransCounter.findOneAndUpdate(
  { dateKey: `CEMJRN-${dateKey}` }, // ✅ important
  { $inc: { seq: 1 } },
  { new: true, upsert: true }
);

// format → J0001
const transNo = "J" + String(transCounter.seq).padStart(4, "0");

    const journal = await CemJournal.create({
      autoJournalId,
      transNo,
      date,
      accType,
      creditorId,
      creditorName,
      creditorPhone,
      headerLedger,
      entries,
      totalAmount,
    });

    res.status(201).json({
      message: "Cemetery journal entry added successfully",
      data: journal,
    });
  } catch (err) {
    console.error("Add cem journal error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ==================================================
   📋 LIST CEM JOURNALS
================================================== */

exports.getCemJournalList = async (req, res) => {
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

    /* 🔍 SEARCH — SAME LOGIC */
    if (search) {
      query.$or = [
        { autoJournalId: { $regex: search, $options: "i" } },
        { creditorName: { $regex: search, $options: "i" } },
        { "headerLedger.ledgerName": { $regex: search, $options: "i" } },
      ];
    }

    /* 📅 DATE FILTER — SAME */
    if (startDate || endDate) {
      query.date = {};

      if (startDate) {
        query.date.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const [data, total] = await Promise.all([
      CemJournal.find(query)
        .select(
          "autoJournalId date accType headerLedger creditorName totalAmount"
        )
        .sort({ autoJournalId: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),

      CemJournal.countDocuments(query),
    ]);

    res.json({
      data,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });
  } catch (err) {
    console.error("Get cem journal list error:", err);
    res.status(500).json({ message: "Failed to fetch journals" });
  }
};

/* ==================================================
   🔍 GET BY ID
================================================== */

exports.getCemJournalById = async (req, res) => {
  try {
    const journal = await CemJournal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    res.json({ data: journal });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch journal" });
  }
};
