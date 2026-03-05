const mongoose = require("mongoose");

const OpeningBalanceSchema = new mongoose.Schema(
  {
    account_type: {
      type: String,
      enum: ["Cash on Hand A/c", "Petty Cash A/c", "Cash at Bank A/c"],
      required: true,
    },

    bank_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bank",
      required: function () {
        return this.account_type === "Cash at Bank A/c";
      },
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    as_on_date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OpeningBalance", OpeningBalanceSchema);
