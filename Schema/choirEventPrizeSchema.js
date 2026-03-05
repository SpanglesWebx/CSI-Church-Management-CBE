const mongoose = require("mongoose");

const ChoirEventPrizeSchema = new mongoose.Schema(
  {
    prizes: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChoirEventPrize", ChoirEventPrizeSchema);       