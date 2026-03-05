const mongoose = require("mongoose");

const MarriagePriceSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,   // JUST LIKE BANNS PRICE
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MarriagePrice", MarriagePriceSchema);
