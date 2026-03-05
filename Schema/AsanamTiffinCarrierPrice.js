// models/AsanamTiffinCarrierPrice.js
const mongoose = require("mongoose");

const AsanamTiffinCarrierPriceSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true, unique: true },
    date: { type: Date, required: true },
    price_per_carrier: { type: Number, required: true },
    note: { type: String, default: "" },
  },
  { timestamps: true, collection: "AsanamTiffinCarrierPrice" }
);

module.exports = mongoose.model(
  "AsanamTiffinCarrierPrice",
  AsanamTiffinCarrierPriceSchema
);
