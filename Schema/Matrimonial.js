const mongoose = require("mongoose");

const MatrimonialSchema = new mongoose.Schema(
  {
    isMember: {
      type: Boolean,
      required: true
    },

    // MEMBER DETAILS
    member_id: { type: String },
    member_name: { type: String },
    phone: { type: String },

    // NON-MEMBER DETAILS
    nonMemberName: { type: String },
    nonMemberPhone: { type: String },
    nonMemberChurch: { type: String },
    nonMemberAddress: { type: String },

    // FEES (auto-loaded active fee)
    fees: {
      type: Number,
      required: true
    },

    description: {
      type: String,
      default: ""
    },

    date: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Matrimonial", MatrimonialSchema);
 