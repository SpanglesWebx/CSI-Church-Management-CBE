const mongoose = require("mongoose");

const OtherIncomeTitleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("OtherIncome", OtherIncomeTitleSchema);
