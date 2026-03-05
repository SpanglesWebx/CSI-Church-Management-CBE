const mongoose = require("mongoose");

const MatrimonialFeesSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    date: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MatrimonialFees", MatrimonialFeesSchema);
