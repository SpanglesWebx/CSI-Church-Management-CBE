const mongoose = require("mongoose");

/* ==================================================
   ENTRY SCHEMA (UNCHANGED)
================================================== */

const CemJournalEntrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Debit", "Credit"],
      required: true,
    },

    ledger: {
      key: String,
      ledgerName: String,
      ledgerCode: String,
      categoryName: String,
      accountType: String,
      incomeType: String,
    },

    amount: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

/* ==================================================
   MAIN SCHEMA
================================================== */

const CemJournalSchema = new mongoose.Schema(
  {
    autoJournalId: {
      type: String,
      unique: true,
      index: true,
    },
    transNo: {
      type: String,
      index: true,
    },

    date: {
      type: Date,
      required: true,
    },

    accType: {
      type: String,
      enum: ["Debit", "Credit"],
      required: true,
    },

    creditorId: {
      type: String,
      trim: true,
    },

    creditorName: {
      type: String,
      default: "",
    },

    creditorPhone: {
      type: String,
      trim: true,
      default: "",
    },

    headerLedger: {
      key: String,
      ledgerName: String,
      ledgerCode: String,
      categoryName: String,
      accountType: String,
      incomeType: String,
    },

    entries: [CemJournalEntrySchema],

    totalAmount: {
      type: Number,
      required: true,
    },

    migrated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CemJournal", CemJournalSchema);
