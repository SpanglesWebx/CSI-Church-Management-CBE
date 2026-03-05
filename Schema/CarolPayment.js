// models/CarolPayment.js
const mongoose = require("mongoose");

const PaymentItemSchema = new mongoose.Schema(
  {
    team: { type: String, required: true },
    amount: { type: Number, default: 0 },
    receipt_from: { type: Number, required: true },
    receipt_to: { type: Number, required: true },
  },
  { _id: false }
);

const CarolPaymentSchema = new mongoose.Schema({
  team_group_id: { type: mongoose.Schema.Types.ObjectId, ref: "CarolTeam", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  payments: [PaymentItemSchema],
  day_total: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
});

// Prevent duplicate (team_group + date)
CarolPaymentSchema.index({ team_group_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("CarolPaymentCollection", CarolPaymentSchema);
 