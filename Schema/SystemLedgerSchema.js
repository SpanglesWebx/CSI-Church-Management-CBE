const mongoose = require("mongoose"); 

const SystemLedgerSchema = new mongoose.Schema(
  {
    ledgerName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    ledgerType: {
      type: String,
      enum: ["Asset", "Liability", "Equity", "Income", "Expense"],
      required: true,
    },

  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemLedger", SystemLedgerSchema);
