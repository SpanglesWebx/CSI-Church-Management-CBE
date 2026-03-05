const mongoose = require("mongoose");

const CoupleEventPrizeSchema = new mongoose.Schema(
  {
    prizes: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CoupleEventPrize", CoupleEventPrizeSchema);