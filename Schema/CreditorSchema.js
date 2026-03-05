// schema/CreditorSchema.js
const mongoose = require("mongoose");

const CreditorSchema = new mongoose.Schema(
  {
    creditor_id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    // phone: { type: String, required: true },
    address: { type: String, default: "" },
    church_name: { type: String, default: "" },
    aadhaar: { type: String, default: "" },
    primary_contact_number: { type: String, required: true },
    contact_number: { type: String },
    pincode: { type: String },
    email: { type: String },

    bank_name: { type: String },
    account_number: { type: String },
    ifsc_code: { type: String },
    micr_code: { type: String },
    branch_name: { type: String },
    branch_phone: { type: String },


    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    created_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Creditor", CreditorSchema);
