const WomenJournal = require("../Schema/WomenJournalSchema");
const Counter = require("../Schema/CounterSchema");

exports.addWomenJournal = async (req, res) => {
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

    // 🔢 Counter (UNCHANGED LOGIC)
    const counter = await Counter.findOneAndUpdate(
      { name: "womenJournal" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    const autoJournalId = "WJRN" + String(counter.seq).padStart(4, "0");

    /* ==================================================
   ⭐ DATE-WISE JOURNAL TRANS NO (J0001...)
================================================== */

    // normalize date (remove time)
    const journalDate = new Date(date);
    journalDate.setHours(0, 0, 0, 0);

    // find last journal for same date
    const lastJournal = await WomenJournal.findOne({
      date: {
        $gte: journalDate,
        $lt: new Date(journalDate.getTime() + 24 * 60 * 60 * 1000),
      },
    })
      .sort({ transNo: -1 })
      .lean();

    let nextSeq = 1;

    if (lastJournal?.transNo) {
      const lastNumber = parseInt(lastJournal.transNo.replace("J", ""), 10);
      nextSeq = lastNumber + 1;
    }

    const transNo = "J" + String(nextSeq).padStart(4, "0");

    const journal = await WomenJournal.create({
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
      message: "Women Journal entry added successfully",
      data: journal,
    });
  } catch (err) {
    console.error("Add women journal error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getWomenJournalList = async (req, res) => {
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

    /* -------------------------
       🔍 SEARCH FILTER
       Search by:
       - Journal ID
       - Creditor Name
       - Ledger Name
    -------------------------- */

    if (search) {
      query.$or = [
        { autoJournalId: { $regex: search, $options: "i" } },
        { creditorName: { $regex: search, $options: "i" } },
        { "headerLedger.ledgerName": { $regex: search, $options: "i" } },
      ];
    }

    /* -------------------------
       📅 DATE FILTER
    -------------------------- */

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

    /* -------------------------
       🚀 FETCH DATA
    -------------------------- */

    const [data, total] = await Promise.all([
      WomenJournal.find(query)
        .select(
          "autoJournalId transNo date accType headerLedger creditorName totalAmount"
        )
        .sort({ autoJournalId: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),

      WomenJournal.countDocuments(query),
    ]);

    res.json({
      data,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });
  } catch (err) {
    console.error("Get women journal list error:", err);
    res.status(500).json({ message: "Failed to fetch women journals" });
  }
};

exports.getWomenJournalById = async (req, res) => {
  try {
    const journal = await WomenJournal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({ message: "Women Journal not found" });
    }

    res.json({ data: journal });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch women journal" });
  }
};

exports.updateWomenJournalById = async (req, res) => {
  try {
    const { id } = req.params;

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
      return res.status(400).json({
        message: "Required fields missing",
      });
    }

    const journal = await WomenJournal.findById(id);

    if (!journal) {
      return res.status(404).json({
        message: "Women Journal not found",
      });
    }

    /* --------------------------
       Recalculate transNo if date changed
    --------------------------- */

    let transNo = journal.transNo;

    const oldDate = new Date(journal.date);
    oldDate.setHours(0, 0, 0, 0);

    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);

    if (oldDate.getTime() !== newDate.getTime()) {

      const lastJournal = await WomenJournal.findOne({
        date: {
          $gte: newDate,
          $lt: new Date(newDate.getTime() + 86400000),
        },
        _id: { $ne: id }
      })
      .sort({ transNo: -1 })
      .lean();

      let nextSeq = 1;

      if (lastJournal?.transNo) {
        const lastNumber = parseInt(lastJournal.transNo.replace("J", ""), 10);
        nextSeq = lastNumber + 1;
      }

      transNo = "J" + String(nextSeq).padStart(4, "0");
    }

    const updated = await WomenJournal.findByIdAndUpdate(
      id,
      {
        date,
        accType,
        headerLedger,
        creditorId,
        creditorName,
        creditorPhone,
        entries,
        totalAmount,
        transNo
      },
      { new: true }
    );

    res.json({
      message: "Women Journal updated successfully",
      data: updated
    });

  } catch (err) {
    console.error("Update women journal error:", err);
    res.status(500).json({
      message: "Failed to update women journal"
    });
  }
};