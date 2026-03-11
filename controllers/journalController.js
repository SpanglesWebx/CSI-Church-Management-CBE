// controllers/journalController.js
const Journal = require("../Schema/JournalSchema");
const Counter = require("../Schema/CounterSchema");

exports.addJournal = async (req, res) => {
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
      { name: "journal" },
      { $inc: { seq: 1 } },
      { returnDocument: "after", upsert: true }
    );

    const autoJournalId = "JRN" + String(counter.seq).padStart(4, "0");

    /* ==================================================
   ⭐ DATE-WISE JOURNAL TRANS NO (J0001...)
================================================== */

    // normalize date (remove time)
    const journalDate = new Date(date);
    journalDate.setHours(0, 0, 0, 0);

    // find last journal for same date
    const lastJournal = await Journal.findOne({
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


    const journal = await Journal.create({
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
      message: "Journal entry added successfully",
      data: journal,
    });
  } catch (err) {
    console.error("Add journal error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getJournalList = async (req, res) => {
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
        end.setHours(23, 59, 59, 999); // include full day
        query.date.$lte = end;
      }
    }

    /* -------------------------
       🚀 FETCH DATA
    -------------------------- */

    const [data, total] = await Promise.all([
      Journal.find(query)
        .select("autoJournalId transNo date accType headerLedger creditorName totalAmount")
        .sort({ autoJournalId: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),

      Journal.countDocuments(query),
    ]);

    res.json({
      data,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    });
  } catch (err) {
    console.error("Get journal list error:", err);
    res.status(500).json({ message: "Failed to fetch journals" });
  }
};


exports.getJournalById = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);

    if (!journal) {
      return res.status(404).json({ message: "Journal not found" });
    }

    res.json({ data: journal });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch journal" });
  }
};

exports.updateJournalById = async (req, res) => {
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

    const journal = await Journal.findById(id);

    if (!journal) {
      return res.status(404).json({
        message: "Journal not found",
      });
    }

    /* --------------------------------
       If DATE changed → recalc transNo
    ----------------------------------*/

    let transNo = journal.transNo;

    const oldDate = new Date(journal.date);
    oldDate.setHours(0, 0, 0, 0);

    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);

    if (oldDate.getTime() !== newDate.getTime()) {
      const lastJournal = await Journal.findOne({
        date: {
          $gte: newDate,
          $lt: new Date(newDate.getTime() + 24 * 60 * 60 * 1000),
        },
        _id: { $ne: id },
      })
        .sort({ transNo: -1 })
        .lean();

      let nextSeq = 1;

      if (lastJournal?.transNo) {
        const lastNumber = parseInt(
          lastJournal.transNo.replace("J", ""),
          10
        );
        nextSeq = lastNumber + 1;
      }

      transNo = "J" + String(nextSeq).padStart(4, "0");
    }

    /* --------------------------------
       Update Journal
    ----------------------------------*/

    const updatedJournal = await Journal.findByIdAndUpdate(
      id,
      {
        date,
        accType,
        creditorId,
        creditorName,
        creditorPhone,
        headerLedger,
        entries,
        totalAmount,
        transNo,
      },
      { new: true }
    );

    res.json({
      message: "Journal updated successfully",
      data: updatedJournal,
    });
  } catch (err) {
    console.error("Update journal error:", err);
    res.status(500).json({
      message: "Failed to update journal",
    });
  }
};