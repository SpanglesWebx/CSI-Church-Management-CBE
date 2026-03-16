const mongoose = require("mongoose");
 
const LedgerSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
 
status: {
  type: String,
  enum: ["active", "inactive"],
  default: "active"
},
 
previousStatus: {
  type: String,
  enum: ["active", "inactive"],
  default: null
},
   
    depreciationValue: {
      type: Number,
      default: null
    },
   
    depreciationDate: {
      type: Date,
      default: null
    }
  },
  { _id: false }
);
 
const LedgerCategorySchema = new mongoose.Schema(
  {
    accountType: {
      type: String,
      enum: [
        "Capital A/c",
        "Assets-Fixed Assets",
        "Assets-Current Assets",
        "Assets-Investments & Deposits",
        "Liabilities-Current Liabilities and Provisions",
        "Liabilities-Funds",
        "Income",
        "Expense"
      ],
      required: true
    },
 
    incomeType: {
      type: String,
      enum: ["ASSESSABLE", "NON_ASSESSABLE"],
      default: null
    },
 
    name: {
      type: String,
      required: true,
      trim: true
    },
 
status: {
  type: String,
  enum: ["active", "inactive"],
  default: "active"
},
 
    depreciationPercent: {
      type: Number,
      default: null
    },
 
    // 🔥 LEDGERS WITH AUTO CODE
    ledgers: {
      type: [LedgerSchema],
      default: []
    }
  },
  { timestamps: true }
);
 
// Prevent duplicate category under same account + income type
LedgerCategorySchema.index(
  { accountType: 1, incomeType: 1, name: 1 },
  { unique: true }
);
 
module.exports = mongoose.model("LedgerCategory", LedgerCategorySchema);