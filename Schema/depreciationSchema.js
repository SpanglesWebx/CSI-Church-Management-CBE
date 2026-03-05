const mongoose = require("mongoose");

const depreciationSchema = new mongoose.Schema(
{
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LedgerCategory",
    required: true
  },

  ledgerCode: {
    type: String,
    required: true
  },

  ledgerName: String,

  date: Date,

  openingBalance: Number,

  depreciationValue: Number
},
{ timestamps: true }
);

module.exports = mongoose.model("Depreciation", depreciationSchema);
