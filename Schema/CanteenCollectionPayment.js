const mongoose = require("mongoose");

const PaymentItemSchema = new mongoose.Schema(
  {
    team: { type: String, required: true },
    amount: { type: Number, default: 0 },
  },
  { _id: false }
);

const CanteenCollectionPaymentSchema = new mongoose.Schema({
  team_group_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CanteenCollectionTeam",
    required: true,
  },
  date: { type: String, required: true }, // YYYY-MM-DD
  payments: [PaymentItemSchema],
  day_total: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  migrated: {
    type: Boolean,
    default: false,
  },

});

// Prevent duplicate payments for same group + date
CanteenCollectionPaymentSchema.index(
  { team_group_id: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "CanteenCollectionPayment",
  CanteenCollectionPaymentSchema
);
