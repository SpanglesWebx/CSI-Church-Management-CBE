const mongoose = require("mongoose");

const ReceiptTransCounterSchema = new mongoose.Schema(
  {
    dateKey: {
      type: String, // format: YYYY-MM-DD
      required: true,
      unique: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ReceiptTransCounter",
  ReceiptTransCounterSchema
);
