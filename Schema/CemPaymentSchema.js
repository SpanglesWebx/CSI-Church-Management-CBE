const mongoose = require("mongoose");

const CemPaymentSchema = new mongoose.Schema(
  {
    autoExpenseId: {
      type: String,
      unique: true,
      index: true,
    },
    transNo: {
      type: String,
      index: true,
    },

    totalAmount: {
      type: Number,
    },

    expenseLines: [
  {
    voucherNumber: {
      type: String,
      default: "",
    },

    creditorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Creditor",
    },

    creditorName: String,
    creditorCode: String,
    creditorPhone: String,

    ledgerName: { type: String, required: true },
    ledgerCode: { type: String, required: true },
    ledgerCategoryName: { type: String, required: true },
    accountType: { type: String, required: true },

    amount: { type: Number, required: true },

    description: { type: String, default: "" },
  },
],

    date: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Cheque", "UPI"],
      required: true,
    },

    cashAccountType: {
      type: String,
      default: "",
    },

    chequeNumber: { type: String, default: "" },
    upiId: { type: String, default: "" },


    // ✅ IMPORTANT — cemetery bank
    bankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CemBank",
    },
    bankName: String,
    bankAccountNumber: String,

    inFavourOf: {
      type: String,
      trim: true,
    },

    chequeDate: {
      type: Date,
    },

    migrated: { type: Boolean, default: false },

    expenseReturned: {
      type: Boolean,
      default: false,
      index: true,
    },

    expenseReturnDate: {
      type: Date,
      default: null,
    },

    expenseReturnReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CemPayment", CemPaymentSchema);
