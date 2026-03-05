const mongoose = require("mongoose");

const BannsPriceSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,   // NEW
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BannsPriceforMarriage", BannsPriceSchema);
