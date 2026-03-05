// models/staffAdvanceSchema.js
const mongoose = require("mongoose");

const staffAdvanceSchema = new mongoose.Schema(
  {
    employee_id: {
      type: String,
      required: true,
      ref: "Staff",
    },
    date: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StaffAdvance", staffAdvanceSchema);
