const mongoose = require("mongoose");

const BankReconSchema = new mongoose.Schema(
  {
    // 🔗 Link to receipt
    receiptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Receipt",
      required: true,
      index: true,
    },

    autoReceiptId: {
      type: String,
      required: true,
      index: true,
    },
    transNo: { // <<< ADD THIS 
    type: String, default: "", index: true, },

    receiptDate: {
      type: Date,
      required: true,
    },

    // 💳 payment info
    paymentMethod: {
      type: String,
      enum: ["Cheque", "UPI Payment"],
      required: true,
    },

    chequeNumber: { type: String, default: "" },
    chequeDate: { type: Date, default: null },
    upiId: { type: String, default: "" },

    // 🏦 bank
    bankId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bank",
      required: true,
      index: true,
    },

    bankName: { type: String, default: "" },

    // 👤 party
    partyName: { type: String, default: "" },
    phone: { type: String, default: "" },

    // 💰 amount
    amount: {
      type: Number,
      required: true,
    },

    drCr: {
      type: String,
      enum: ["Debit", "Credit"],
      required: true,
      index: true,
    },

    // 🔄 reconciliation status
    realised: {
      type: Boolean,
      default: false,
      index: true,
    },

    realisedDate: {
      type: Date,
      default: null,
    },

    returned: {
      type: Boolean,
      default: false,
    },

    returnReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BankRecon", BankReconSchema);
