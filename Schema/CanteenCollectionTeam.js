const mongoose = require("mongoose");

const CanteenCollectionTeamSchema = new mongoose.Schema({
  year: { type: Number, required: true, index: true },
  teams: [{ type: String, required: true }],
  created_at: { type: Date, default: Date.now },
  total_amount: { type: Number, default: 0 }, // auto calculated from payments
});

module.exports = mongoose.model(
  "CanteenCollectionTeam",
  CanteenCollectionTeamSchema
);
