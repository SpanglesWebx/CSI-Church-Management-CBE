const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SundayClass", 
      required: true,
    },
    date: { type: Date, required: true },

    // Attendance of each student
    attendance: [
      {
        member_id: { type: String, required: true },
        present: { type: Boolean, default: false },
      },
    ],

  },
  { timestamps: true }
);

// 🔹 Prevent duplicate attendance for same class/date
AttendanceSchema.index({ class: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);
