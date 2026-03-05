// Schema/EndeavourAttendance.js
const mongoose = require("mongoose");

const EndeavourAttendanceSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EndeavourClass",
      required: true,
    },
    date: { type: Date, required: true },
    attendance: [
      {
        member_id: { type: String, required: true },
        present: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

// Prevent duplicate attendance for same class/date
EndeavourAttendanceSchema.index({ class: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("EndeavourAttendance", EndeavourAttendanceSchema);
