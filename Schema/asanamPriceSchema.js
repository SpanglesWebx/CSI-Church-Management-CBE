const mongoose = require("mongoose");

const asanamPriceSchema = new mongoose.Schema(
  {
    goat_price: {
      type: Number,
      required: true,
    },
    rice_price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("AsanamPrice", asanamPriceSchema);
