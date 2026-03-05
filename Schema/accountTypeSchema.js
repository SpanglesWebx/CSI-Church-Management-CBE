// schema/AccountTypeSchema.js
const mongoose = require("mongoose");

const AccountTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AccountType", AccountTypeSchema);
