const mongoose = require("mongoose");

const WomenCashAccountSchema = new mongoose.Schema(
  {
    account_type: {
      type: String,
      enum: ["Cash on Hand A/c", "Petty Cash A/c"],
      unique: true,
      required: true,
    },

    opening_balance: {
      type: Number,
      default: 0,
    },

    current_balance: {
      type: Number,
      default: 0,
    },

    opening_balance_migrated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WomenCashAccount", WomenCashAccountSchema);