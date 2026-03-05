const mongoose = require("mongoose");

const HarvestBiriyaniTokenPriceSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true, unique: true },
    date: { type: Date, required: true },
    price_per_token: { type: Number, required: true },
    note: { type: String, default: "" },
  },
  { timestamps: true, collection: "HarvestBiriyaniTokenPrice" }
);

module.exports = mongoose.model("HarvestBiriyaniTokenPrice", HarvestBiriyaniTokenPriceSchema);
