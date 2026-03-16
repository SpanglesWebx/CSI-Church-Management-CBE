const mongoose = require("mongoose");

const CemBankSchema = new mongoose.Schema(
  {
    account_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountType",
      required: true,
    },

    ledger_code: { type: String, required: true },
    ledger_name: { type: String, required: true },
    ledger_category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LedgerCategory",
      required: true,
    },

    bank_name: { type: String, required: true },
    account_number: { type: String, required: true },
    ifsc_code: { type: String, required: true },
    micr_code: { type: String, default: "" },
    branch_name: { type: String, default: "" },
    branch_phone: { type: String, default: "" },
    bank_address: { type: String, default: "" },

    current_balance: {
      type: Number,
      default: 0,
    },

    opening_balance: {
      type: Number,
      default: 0,  
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    opening_balance_migrated: {
      type: Boolean,
      default: false,
    },

    created_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// module.exports = mongoose.model("CemBank", CemBankSchema);
module.exports = mongoose.models.CemBank || mongoose.model("CemBank", CemBankSchema);
