const mongoose = require("mongoose");

const ShopSchema = new mongoose.Schema({
  shop_name: { type: String, required: true },
  location: { type: String, required: true },
  area: { type: String, default: "" },
  description: { type: String, default: "" },
  availability: { type: String, enum: ["Vacant", "Full"], default: "Vacant" }
}, { timestamps: true });

module.exports = mongoose.model("Shop", ShopSchema); 
