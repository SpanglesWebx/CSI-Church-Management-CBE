const mongoose = require("mongoose");

const WomenPaymentSchema = new mongoose.Schema(
  {
    autoExpenseId: {
      type: String,
      unique: true,
      index: true, // WPAY0001
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

    chequeNumber: {
      type: String,
      default: "",
    },

    upiId: {
      type: String,
      default: "",
    },

    bankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WomenBank",
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

WomenPaymentSchema.index({ date: 1, transNo: -1 });

module.exports = mongoose.model("WomenPayment", WomenPaymentSchema);