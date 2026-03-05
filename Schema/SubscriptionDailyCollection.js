const mongoose = require("mongoose");

const SubscriptionDailyCollectionSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    payment_session: { type: String, enum: ["Morning","Evening","Office Payment"], required: true },

    // new: receipts per member
members: [
      {
        member_id: String,
        member_name: String,
        cash_amount: Number,
        cheque_amount: Number
      }
    ],

    cash_total: { type: Number, required: true, default: 0 },
    cheque_total: { type: Number, required: true, default: 0 },
    total_amount: { type: Number, required: true },
    migrated: { type: Boolean, default: false },
  },
  { timestamps: true }
);


module.exports = mongoose.model(
  "SubscriptionDailyCollection",
  SubscriptionDailyCollectionSchema
);
