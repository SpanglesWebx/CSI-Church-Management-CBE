const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
  },
  { _id: false }
);

const MarriageHallAssetCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    items: [ItemSchema],   // 👈 Items inside category
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "MarriageHallAssetCategory",
  MarriageHallAssetCategorySchema
);
