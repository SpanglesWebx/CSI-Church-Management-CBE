// models/MissionaryBiriyaniTokenPrice.js 
const mongoose = require("mongoose");

const MissionaryBiriyaniTokenPriceSchema = new mongoose.Schema( 
  {
    year: { type: Number, required: true, unique: true }, // unique: one-per-year (Option C)
    date: { type: Date, required: true },
    price_per_token: { type: Number, required: true },
    note: { type: String, default: "" },
  },
  { timestamps: true, collection: "MissionaryBiriyaniTokenPrice" }
);

module.exports = mongoose.model("MissionarySundayBiriyaniTokenPrice", MissionaryBiriyaniTokenPriceSchema);
