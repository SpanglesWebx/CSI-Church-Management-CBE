// schema/JournalSchema.js
const mongoose = require("mongoose");

const JournalEntrySchema = new mongoose.Schema(
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

const JournalSchema = new mongoose.Schema(
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
      type: String, // 🔥 CRD00003 / MBR01032/1
      trim: true,
    },

    creditorName: {
      type: String, // 🔥 from unified search (NAME ONLY)
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

    entries: [JournalEntrySchema],

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
JournalSchema.index({ date: 1, transNo: -1 });
module.exports = mongoose.model("Journal", JournalSchema);
