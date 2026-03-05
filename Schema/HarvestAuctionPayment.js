const mongoose = require("mongoose");  
 
const HarvestAuctionPaymentSchema = new mongoose.Schema(
  {
    harvestAuctionId: { type: mongoose.Schema.Types.ObjectId, ref: "HarvestAuction" },
    receiptId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Receipt",
      index: true
    },
    buyerId: { type: String },
    buyerName: { type: String },
    buyerPhone: { type: String },
    sellerId: { type: String },
    sellerName: { type: String },
    item: { type: String },
    amountPaid: { type: Number },
    balanceAfter: { type: Number },
    source: { 
      type: String, 
      enum: ["Direct", "Subscription", "Receipt"], 
      default: "Direct" 
    },
    date: { type: Date, default: Date.now },
    migrated: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("HarvestAuctionPayment", HarvestAuctionPaymentSchema);
