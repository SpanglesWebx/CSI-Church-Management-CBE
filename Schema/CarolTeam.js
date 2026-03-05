// models/CarolTeam.js
const mongoose = require("mongoose"); 

const CarolTeamSchema = new mongoose.Schema({
  year: { type: Number, required: true, index: true },
  teams: [{ type: String, required: true }],
  created_at: { type: Date, default: Date.now },
  total_amount: { type: Number, default: 0 }, // total sum of all daily payments
});

module.exports = mongoose.model("CarolTeam", CarolTeamSchema);
