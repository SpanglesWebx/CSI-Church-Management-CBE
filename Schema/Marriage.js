// models/Marriage.js
const mongoose = require("mongoose");

const HallBookingSubSchema = new mongoose.Schema({
  bookingId: { type: String },
  hallId: { type: String },
  hallName: { type: String },
  categoryId: { type: String },
  categoryName: { type: String },
  bookingDate: { type: Date },
  sessions: [{ type: String }],
  hallAmount: { type: Number },
  advanceAmount: { type: Number },
}, { _id: false });

const MarriageSchema = new mongoose.Schema({
  type: { type: String, enum: ["Banns", "Marriage"], required: true },
  date: { type: Date, required: true },
  amount: { type: Number, default: 0 },

  // Member (optional)
  member: {
    member_id: { type: String },
    member_name: { type: String },
    phone: { type: String },
  },

  // Non-member (optional)
  non_member: {
    name: { type: String },
    phone: { type: String },
    church: { type: String },
    address: { type: String },
  },

  // Hall booking (optional)
  hallBooking: HallBookingSubSchema,

}, { timestamps: true });

module.exports = mongoose.model("Marriage", MarriageSchema);
